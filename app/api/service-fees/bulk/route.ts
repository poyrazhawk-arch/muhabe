import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const Schema = z.object({
  period_month: z.number().int().min(1).max(12),
  period_year:  z.number().int().min(2020).max(2099),
  due_date:     z.string().optional(),
  items: z.array(z.object({
    client_id: z.string().uuid(),
    amount:    z.number().positive(),
  })).min(1),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: accountant } = await supabase
    .from("accountants").select("id").eq("user_id", user.id).single();
  if (!accountant) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { period_month, period_year, due_date, items } = parsed.data;

  // Skip clients that already have a fee for this period
  const { data: existing } = await supabase
    .from("service_fees")
    .select("client_id")
    .eq("accountant_id", accountant.id)
    .eq("period_month", period_month)
    .eq("period_year", period_year);

  const existingIds = new Set((existing ?? []).map(r => r.client_id));
  const toInsert = items
    .filter(i => !existingIds.has(i.client_id))
    .map(i => ({
      accountant_id: accountant.id,
      client_id:     i.client_id,
      amount:        i.amount,
      period_month,
      period_year,
      due_date:      due_date || null,
      status:        "pending",
    }));

  if (toInsert.length === 0) {
    return NextResponse.json({ created: 0, skipped: items.length, message: "All clients already billed for this period" });
  }

  const { data, error } = await supabase
    .from("service_fees")
    .insert(toInsert)
    .select("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    created: data?.length ?? 0,
    skipped: items.length - (data?.length ?? 0),
  }, { status: 201 });
}
