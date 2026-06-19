import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY!);

const BroadcastSchema = z.object({
  client_ids: z.array(z.string().uuid()).min(1),
  subject:    z.string().min(3).max(200),
  message:    z.string().min(10),
  template:   z.enum(["document_reminder", "filing_deadline", "custom"]).default("custom"),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: accountant } = await supabase
    .from("accountants").select("id, full_name, email").eq("user_id", user.id).single();
  if (!accountant) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const body = await req.json();
  const parsed = BroadcastSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { client_ids, subject, message } = parsed.data;

  // Müşterileri getir ve yetkiyi doğrula
  const { data: clients, error: clientErr } = await supabase
    .from("clients")
    .select("id, full_name, email")
    .in("id", client_ids)
    .eq("accountant_id", accountant.id)
    .not("email", "is", null);

  if (clientErr) return NextResponse.json({ error: clientErr.message }, { status: 500 });
  if (!clients || clients.length === 0)
    return NextResponse.json({ error: "No clients with a valid email address found" }, { status: 404 });

  // Send emails via Resend batch
  const emails = clients.map(client => ({
    from: process.env.RESEND_FROM_EMAIL ?? "noreply@nixtagency.com",
    to: [client.email!],
    subject,
    html: buildEmailHtml(client.full_name, message, accountant.full_name),
  }));

  let sent = 0;
  let failed = 0;

  // Resend batch max 100 — send in groups of 50
  for (let i = 0; i < emails.length; i += 50) {
    const batch = emails.slice(i, i + 50);
    try {
      await resend.batch.send(batch);
      sent += batch.length;
    } catch {
      failed += batch.length;
    }
  }

  return NextResponse.json({ sent, failed, total: clients.length });
}

function buildEmailHtml(clientName: string, message: string, accountantName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;margin:0;padding:32px 16px">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e8edf2;overflow:hidden">
    <div style="background:#1e3a5f;padding:24px 32px">
      <p style="color:#93c5fd;font-size:12px;margin:0 0 4px">Accounting · Workflow System</p>
      <p style="color:#fff;font-size:18px;font-weight:600;margin:0">Dear ${clientName}</p>
    </div>
    <div style="padding:32px">
      <div style="white-space:pre-line;color:#374151;font-size:14px;line-height:1.7">${message}</div>
    </div>
    <div style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e8edf2">
      <p style="margin:0;font-size:12px;color:#9ca3af">
        This email was sent by your accountant <strong>${accountantName}</strong> via the Accounting system.
      </p>
    </div>
  </div>
</body>
</html>`;
}
