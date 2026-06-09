import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const FeeSchema = z.object({
  client_id:    z.string().uuid(),
  amount:       z.number().positive(),
  period_month: z.number().int().min(1).max(12),
  period_year:  z.number().int().min(2020).max(2099),
  due_date:     z.string().optional(),
  notes:        z.string().optional(),
});

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { data: accountant } = await supabase
    .from("accountants").select("id").eq("user_id", user.id).single();
  if (!accountant) return NextResponse.json({ error: "Hesap bulunamadı" }, { status: 404 });

  const url = new URL(req.url);
  const clientId = url.searchParams.get("client_id");

  let query = supabase
    .from("service_fees")
    .select("*, clients(full_name, company_name)")
    .eq("accountant_id", accountant.id)
    .order("period_year", { ascending: false })
    .order("period_month", { ascending: false });

  if (clientId) query = query.eq("client_id", clientId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { data: accountant } = await supabase
    .from("accountants").select("id").eq("user_id", user.id).single();
  if (!accountant) return NextResponse.json({ error: "Hesap bulunamadı" }, { status: 404 });

  const body = await req.json();
  const parsed = FeeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data, error } = await supabase
    .from("service_fees")
    .insert({ ...parsed.data, accountant_id: accountant.id })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const { id, status, paid_at } = body;
  if (!id) return NextResponse.json({ error: "ID gerekli" }, { status: 400 });

  const { data: accountant } = await supabase
    .from("accountants").select("id").eq("user_id", user.id).single();

  const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === "paid") updates.paid_at = paid_at ?? new Date().toISOString();

  const { data, error } = await supabase
    .from("service_fees")
    .update(updates)
    .eq("id", id)
    .eq("accountant_id", accountant!.id)
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
