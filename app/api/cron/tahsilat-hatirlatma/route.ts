import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { format, differenceInDays } from "date-fns";
import { tr } from "date-fns/locale";

const resend = new Resend(process.env.RESEND_API_KEY!);

/**
 * Cron: Her Pazartesi 09:00'da çalışır.
 * Gecikmiş veya bugün son tarihi gelen hizmet bedellerini kontrol eder,
 * müşteriye nazik hatırlatma maili gönderir.
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET)
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const supabase = await createClient();
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Gecikmiş veya bugün son tarihi gelen pending fee'ler
  const { data: fees } = await supabase
    .from("service_fees")
    .select("*, clients(full_name, email, company_name), accountants(full_name)")
    .in("status", ["pending", "overdue"])
    .lte("due_date", todayStr)
    .not("due_date", "is", null);

  if (!fees || fees.length === 0)
    return NextResponse.json({ sent: 0, message: "Gecikmiş ödeme yok" });

  // Gecikmiş olarak işaretle
  const overdueIds = fees.map(f => f.id);
  await supabase.from("service_fees").update({ status: "overdue" }).in("id", overdueIds);

  let sent = 0;
  let skipped = 0;

  for (const fee of fees) {
    const client = fee.clients as any;
    const accountant = fee.accountants as any;
    if (!client?.email) { skipped++; continue; }

    const daysLate = differenceInDays(today, new Date(fee.due_date));
    // Sadece 3, 7, 14 günlük gecikmelerde gönder (spam önleme)
    if (![3, 7, 14].includes(daysLate) && daysLate !== 0) { skipped++; continue; }

    const ay = format(new Date(fee.period_year, fee.period_month - 1, 1), "MMMM yyyy", { locale: tr });
    const tutar = Number(fee.amount).toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "noreply@nixtagency.com",
        to: [client.email],
        subject: daysLate === 0
          ? `Bugün Son Gün: ${ay} Hizmet Bedeli`
          : `Hatırlatma: ${ay} Hizmet Bedeli (${daysLate} gün gecikti)`,
        html: buildHatirlatmaHtml({
          clientName: client.full_name,
          accountantName: accountant?.full_name ?? "Muhasebeciniz",
          ay,
          tutar,
          daysLate,
          dueDate: format(new Date(fee.due_date), "d MMMM yyyy", { locale: tr }),
        }),
      });
      sent++;
    } catch {
      skipped++;
    }
  }

  return NextResponse.json({ sent, skipped, total: fees.length });
}

function buildHatirlatmaHtml(p: {
  clientName: string;
  accountantName: string;
  ay: string;
  tutar: string;
  daysLate: number;
  dueDate: string;
}) {
  const urgencyColor = p.daysLate >= 14 ? "#dc2626" : p.daysLate >= 7 ? "#d97706" : "#2563eb";
  const urgencyBg    = p.daysLate >= 14 ? "#fef2f2" : p.daysLate >= 7 ? "#fffbeb" : "#eff6ff";

  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;margin:0;padding:32px 16px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e8edf2;overflow:hidden">
    <div style="background:#0c1524;padding:24px 32px">
      <p style="color:#4b80b8;font-size:12px;margin:0 0 4px">Muhasebe · Hizmet Bedeli Hatırlatması</p>
      <p style="color:#fff;font-size:18px;font-weight:600;margin:0">${p.ay}</p>
    </div>
    <div style="padding:32px">
      <p style="color:#374151;margin:0 0 20px">Sayın <strong>${p.clientName}</strong>,</p>
      <p style="color:#374151;margin:0 0 20px">
        ${p.daysLate === 0
          ? "Bugün son gün olmak üzere,"
          : `${p.daysLate} gündür beklemekte olan`
        } <strong>${p.ay}</strong> dönemi hizmet bedelinizi hatırlatmak istedik.
      </p>
      <div style="background:${urgencyBg};border:1px solid;border-color:${urgencyColor}30;border-radius:10px;padding:20px;margin-bottom:24px;text-align:center">
        <p style="margin:0;font-size:28px;font-weight:700;color:${urgencyColor}">${p.tutar}</p>
        <p style="margin:6px 0 0;font-size:13px;color:#6b7280">Son Tarih: ${p.dueDate}</p>
      </div>
      <p style="color:#6b7280;font-size:13px;margin:0">
        Ödemenizi gerçekleştirdiğinizde lütfen muhasebecizi bilgilendirin.
        Herhangi bir sorunuz varsa iletişime geçmekten çekinmeyin.
      </p>
    </div>
    <div style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e8edf2">
      <p style="margin:0;font-size:12px;color:#9ca3af">
        Muhasebeci: <strong>${p.accountantName}</strong>
      </p>
    </div>
  </div>
</body>
</html>`;
}
