import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { format, differenceInDays } from "date-fns";
import { enUS } from "date-fns/locale";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const { data: fees } = await supabase
    .from("service_fees")
    .select("*, clients(full_name, email, company_name), accountants(full_name)")
    .in("status", ["pending", "overdue"])
    .lte("due_date", todayStr)
    .not("due_date", "is", null);

  if (!fees || fees.length === 0)
    return NextResponse.json({ sent: 0, message: "No overdue payments" });

  const overdueIds = fees.map(f => f.id);
  await supabase.from("service_fees").update({ status: "overdue" }).in("id", overdueIds);

  let sent = 0;
  let skipped = 0;

  for (const fee of fees) {
    const client = fee.clients as any;
    const accountant = fee.accountants as any;
    if (!client?.email) { skipped++; continue; }

    const daysLate = differenceInDays(today, new Date(fee.due_date));
    // Only send on day 0, 3, 7, 14 to avoid spam
    if (![3, 7, 14].includes(daysLate) && daysLate !== 0) { skipped++; continue; }

    const period = format(new Date(fee.period_year, fee.period_month - 1, 1), "MMMM yyyy", { locale: enUS });
    const amount = Number(fee.amount).toLocaleString("en-GB", { style: "currency", currency: "GBP" });

    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "noreply@nixtagency.com",
        to: [client.email],
        subject: daysLate === 0
          ? `Due Today: ${period} Service Fee`
          : `Reminder: ${period} Service Fee (${daysLate} days overdue)`,
        html: buildHatirlatmaHtml({
          clientName: client.full_name,
          accountantName: accountant?.full_name ?? "Your accountant",
          period,
          amount,
          daysLate,
          dueDate: format(new Date(fee.due_date), "d MMMM yyyy", { locale: enUS }),
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
  period: string;
  amount: string;
  daysLate: number;
  dueDate: string;
}) {
  const urgencyColor = p.daysLate >= 14 ? "#dc2626" : p.daysLate >= 7 ? "#d97706" : "#2563eb";
  const urgencyBg    = p.daysLate >= 14 ? "#fef2f2" : p.daysLate >= 7 ? "#fffbeb" : "#eff6ff";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;margin:0;padding:32px 16px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e8edf2;overflow:hidden">
    <div style="background:#0c1524;padding:24px 32px">
      <p style="color:#4b80b8;font-size:12px;margin:0 0 4px">Accounting · Service Fee Reminder</p>
      <p style="color:#fff;font-size:18px;font-weight:600;margin:0">${p.period}</p>
    </div>
    <div style="padding:32px">
      <p style="color:#374151;margin:0 0 20px">Dear <strong>${p.clientName}</strong>,</p>
      <p style="color:#374151;margin:0 0 20px">
        ${p.daysLate === 0
          ? "This is a reminder that today is the due date for your"
          : `This is a reminder about your outstanding`
        } <strong>${p.period}</strong> service fee${p.daysLate > 0 ? `, now ${p.daysLate} day${p.daysLate === 1 ? "" : "s"} overdue` : ""}.
      </p>
      <div style="background:${urgencyBg};border:1px solid;border-color:${urgencyColor}30;border-radius:10px;padding:20px;margin-bottom:24px;text-align:center">
        <p style="margin:0;font-size:28px;font-weight:700;color:${urgencyColor}">${p.amount}</p>
        <p style="margin:6px 0 0;font-size:13px;color:#6b7280">Due date: ${p.dueDate}</p>
      </div>
      <p style="color:#6b7280;font-size:13px;margin:0">
        Once payment has been made, please notify your accountant.
        If you have any questions, please do not hesitate to get in touch.
      </p>
    </div>
    <div style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e8edf2">
      <p style="margin:0;font-size:12px;color:#9ca3af">
        Accountant: <strong>${p.accountantName}</strong>
      </p>
    </div>
  </div>
</body>
</html>`;
}
