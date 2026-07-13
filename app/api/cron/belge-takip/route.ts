import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

const REMIND_EVERY_DAYS = 3;
const MAX_REMINDERS = 3;

/**
 * Cron: Her gün 10:00 — bekleyen belge isteklerini otomatik takip eder.
 * Muhasebecilerin #1 zaman kaybı "evrak kovalamak"; bu cron müşteriye
 * 3 günde bir, en fazla 3 kez, kademeli tonda hatırlatma gönderir.
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET)
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const supabase = await createServiceClient();
  const now = new Date();
  const cutoff = new Date(now.getTime() - REMIND_EVERY_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // Aktif, süresi dolmamış, hiç yükleme yapılmamış ve hatırlatma sırası gelmiş istekler
  const { data: tokens } = await supabase
    .from("upload_tokens")
    .select("*, clients(full_name, email), accountants(full_name, locale)")
    .eq("is_active", true)
    .eq("used_count", 0)
    .gt("expires_at", now.toISOString())
    .lt("created_at", cutoff)
    .lt("reminder_count", MAX_REMINDERS)
    .or(`last_reminded_at.is.null,last_reminded_at.lt.${cutoff}`);

  if (!tokens?.length) return NextResponse.json({ sent: 0, message: "No pending document requests" });

  let sent = 0;
  let skipped = 0;

  for (const tok of tokens) {
    const client = tok.clients as any;
    const accountant = tok.accountants as any;
    if (!client?.email) { skipped++; continue; }

    const locale: "tr" | "en" = accountant?.locale === "en" ? "en" : "tr";
    const nth = (tok.reminder_count ?? 0) + 1;
    const uploadUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://www.ledgerapp.online"}/yukle?token=${tok.token}`;

    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "noreply@nixtagency.com",
        to: [client.email],
        subject: buildSubject(locale, nth),
        html: buildHtml(locale, nth, {
          clientName: client.full_name,
          accountantName: accountant?.full_name ?? (locale === "tr" ? "Muhasebeciniz" : "Your accountant"),
          uploadUrl,
          documentTypes: tok.document_types ?? [],
          expiresAt: tok.expires_at,
        }),
      });

      await supabase
        .from("upload_tokens")
        .update({ last_reminded_at: now.toISOString(), reminder_count: nth })
        .eq("id", tok.id);

      sent++;
    } catch {
      skipped++;
    }
  }

  return NextResponse.json({ sent, skipped, total: tokens.length });
}

function buildSubject(locale: "tr" | "en", nth: number): string {
  if (locale === "tr") {
    if (nth >= 3) return "Son hatırlatma: bekleyen belgeleriniz var";
    if (nth === 2) return "Hatırlatma: belgelerinizi bekliyoruz";
    return "Belgelerinizi yüklemeyi unutmayın";
  }
  if (nth >= 3) return "Final reminder: documents still outstanding";
  if (nth === 2) return "Reminder: your documents are still pending";
  return "A quick reminder about your documents";
}

function buildHtml(
  locale: "tr" | "en",
  nth: number,
  p: { clientName: string; accountantName: string; uploadUrl: string; documentTypes: string[]; expiresAt: string },
): string {
  const docList = p.documentTypes.length
    ? `<ul style="margin:0 0 20px;padding-left:18px;color:#374151;font-size:14px;line-height:1.8">${p.documentTypes.map(d => `<li>${d}</li>`).join("")}</ul>`
    : "";
  const expires = new Date(p.expiresAt).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-GB");

  const tr = {
    tag: "Muhasebe · Belge Hatırlatması",
    hello: `Sayın <strong>${p.clientName}</strong>,`,
    body: nth >= 3
      ? `Muhasebeciniz ${p.accountantName} tarafından istenen belgeler hâlâ yüklenmedi. Yükleme bağlantınızın süresi <strong>${expires}</strong> tarihinde doluyor — gecikme, beyanname sürecinizi aksatabilir.`
      : `Muhasebeciniz ${p.accountantName}, aşağıdaki belgeleri sizden bekliyor. Birkaç dakikanızı ayırıp yükleyebilirsiniz:`,
    cta: "Belgeleri Yükle",
    footer: "Bu bağlantı yalnızca size özeldir; giriş yapmanız gerekmez.",
  };
  const en = {
    tag: "Accounting · Document Reminder",
    hello: `Dear <strong>${p.clientName}</strong>,`,
    body: nth >= 3
      ? `The documents requested by ${p.accountantName} are still outstanding. Your upload link expires on <strong>${expires}</strong> — a delay may hold up your filing.`
      : `${p.accountantName} is still waiting for the documents below. It only takes a couple of minutes to upload them:`,
    cta: "Upload Documents",
    footer: "This link is unique to you — no sign-in required.",
  };
  const c = locale === "tr" ? tr : en;

  return `<!DOCTYPE html>
<html lang="${locale}">
<head><meta charset="UTF-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;margin:0;padding:32px 16px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e8edf2;overflow:hidden">
    <div style="background:#0c1524;padding:20px 28px">
      <p style="color:#4b80b8;font-size:12px;margin:0">${c.tag}</p>
    </div>
    <div style="padding:28px">
      <p style="color:#374151;margin:0 0 16px">${c.hello}</p>
      <p style="color:#374151;margin:0 0 16px;font-size:14px;line-height:1.7">${c.body}</p>
      ${docList}
      <a href="${p.uploadUrl}"
        style="display:inline-block;background:#2563eb;color:#fff;font-weight:600;font-size:14px;padding:11px 22px;border-radius:9px;text-decoration:none">
        ${c.cta}
      </a>
      <p style="color:#9ca3af;font-size:12px;margin:20px 0 0">${c.footer}</p>
    </div>
  </div>
</body>
</html>`;
}
