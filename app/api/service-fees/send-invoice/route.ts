import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { sendFeeInvoiceEmail } from "@/lib/utils/email";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fee_id } = await req.json();
  if (!fee_id) return NextResponse.json({ error: "fee_id required" }, { status: 400 });

  const { data: accountant } = await supabase
    .from("accountants").select("id, full_name").eq("user_id", user.id).single();
  if (!accountant) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const { data: fee } = await supabase
    .from("service_fees")
    .select("*, clients(full_name, email, company_name)")
    .eq("id", fee_id)
    .eq("accountant_id", accountant.id)
    .single();

  if (!fee) return NextResponse.json({ error: "Fee not found" }, { status: 404 });

  const client = fee.clients as any;
  if (!client?.email)
    return NextResponse.json({ error: "Client has no email address" }, { status: 400 });

  const period = format(new Date(fee.period_year, fee.period_month - 1, 1), "MMMM yyyy", { locale: enUS });
  const amount = Number(fee.amount).toLocaleString("en-GB", { style: "currency", currency: "GBP" });
  const dueDate = fee.due_date
    ? format(new Date(fee.due_date), "d MMMM yyyy", { locale: enUS })
    : undefined;

  await sendFeeInvoiceEmail({
    to:             client.email,
    clientName:     client.full_name,
    accountantName: accountant.full_name ?? "Your accountant",
    period,
    amount,
    dueDate,
    notes:          fee.notes ?? undefined,
  });

  return NextResponse.json({ ok: true, to: client.email });
}
