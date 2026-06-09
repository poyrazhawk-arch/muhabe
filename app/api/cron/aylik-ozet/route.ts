import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const resend = new Resend(process.env.RESEND_API_KEY!);

/**
 * Cron: Her ayın son günü saat 09:00'da çalışır.
 * Her müşteriye o ayki özet e-postası gönderir.
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET)
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const supabase = await createClient();
  const now = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1;

  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const monthEnd   = `${year}-${String(month).padStart(2, "0")}-31`;
  const monthLabel = format(now, "MMMM yyyy", { locale: tr });

  let sent = 0;
  let skipped = 0;

  const { data: accountants } = await supabase.from("accountants").select("id, full_name, email");

  for (const acc of accountants ?? []) {
    const { data: clients } = await supabase
      .from("clients").select("id, full_name, email")
      .eq("accountant_id", acc.id).eq("status", "active");

    for (const client of clients ?? []) {
      if (!client.email) { skipped++; continue; }

      // Bu ay belgeler
      const { data: docs } = await supabase
        .from("documents")
        .select("id, document_type, status")
        .eq("client_id", client.id)
        .eq("accountant_id", acc.id)
        .gte("created_at", monthStart)
        .lte("created_at", monthEnd);

      // Bu ay görevler
      const { data: tasks } = await supabase
        .from("tasks")
        .select("id, title, status, due_date")
        .eq("client_id", client.id)
        .eq("accountant_id", acc.id)
        .gte("due_date", monthStart)
        .lte("due_date", monthEnd);

      const completedTasks = tasks?.filter(t => t.status === "completed").length ?? 0;
      const pendingTasks   = tasks?.filter(t => t.status !== "completed" && t.status !== "cancelled").length ?? 0;
      const approvedDocs   = docs?.filter(d => d.status === "approved").length ?? 0;
      const totalDocs      = docs?.length ?? 0;

      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL ?? "noreply@nixtagency.com",
          to: [client.email],
          subject: `${monthLabel} Aylık Muhasebe Özeti`,
          html: buildOzetHtml(client.full_name, acc.full_name, monthLabel, {
            totalDocs, approvedDocs, completedTasks, pendingTasks,
            tasks: tasks ?? [],
          }),
        });
        sent++;
      } catch {
        skipped++;
      }
    }
  }

  return NextResponse.json({ sent, skipped, month, year });
}

function buildOzetHtml(
  clientName: string,
  accountantName: string,
  monthLabel: string,
  data: { totalDocs: number; approvedDocs: number; completedTasks: number; pendingTasks: number; tasks: any[] }
): string {
  const taskList = data.tasks
    .slice(0, 8)
    .map(t => `<li style="padding:4px 0;color:#374151">${t.title} — <span style="color:${t.status === "completed" ? "#16a34a" : "#d97706"}">${t.status === "completed" ? "Tamamlandı" : "Bekliyor"}</span></li>`)
    .join("");

  return `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;margin:0;padding:32px 16px">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e8edf2;overflow:hidden">
    <div style="background:#0c1524;padding:24px 32px">
      <p style="color:#4b80b8;font-size:12px;margin:0 0 4px">Muhasebe · Aylık Özet</p>
      <p style="color:#fff;font-size:20px;font-weight:600;margin:0">${monthLabel}</p>
    </div>
    <div style="padding:32px">
      <p style="color:#374151;margin:0 0 24px">Sayın <strong>${clientName}</strong>, ${monthLabel} ayındaki muhasebe aktivitelerinizin özeti aşağıdadır.</p>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">
        <div style="background:#f0fdf4;border-radius:10px;padding:16px;border:1px solid #bbf7d0">
          <p style="margin:0;font-size:24px;font-weight:700;color:#15803d">${data.completedTasks}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#166534">Tamamlanan Görev</p>
        </div>
        <div style="background:#eff6ff;border-radius:10px;padding:16px;border:1px solid #bfdbfe">
          <p style="margin:0;font-size:24px;font-weight:700;color:#1d4ed8">${data.approvedDocs}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#1e40af">Onaylanan Belge</p>
        </div>
        ${data.pendingTasks > 0 ? `
        <div style="background:#fffbeb;border-radius:10px;padding:16px;border:1px solid #fde68a">
          <p style="margin:0;font-size:24px;font-weight:700;color:#d97706">${data.pendingTasks}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#92400e">Bekleyen Görev</p>
        </div>` : ""}
        <div style="background:#f8fafc;border-radius:10px;padding:16px;border:1px solid #e2e8f0">
          <p style="margin:0;font-size:24px;font-weight:700;color:#374151">${data.totalDocs}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#6b7280">Toplam Belge</p>
        </div>
      </div>

      ${data.tasks.length > 0 ? `
      <h3 style="font-size:14px;color:#0d1117;margin:0 0 12px">Bu Ay Yapılanlar</h3>
      <ul style="margin:0;padding:0 0 0 16px">${taskList}</ul>
      ` : ""}
    </div>
    <div style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e8edf2">
      <p style="margin:0;font-size:12px;color:#9ca3af">
        Muhasebeci: <strong>${accountantName}</strong> · Muhasebe İş Akışı Sistemi
      </p>
    </div>
  </div>
</body>
</html>`;
}
