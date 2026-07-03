import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const MusteriSchema = z.object({
  full_name: z.string().min(2, "Ad soyad en az 2 karakter olmalı"),
  company_name: z.string().optional(),
  tax_number: z.string().optional(),
  email: z.string().email("Geçerli bir e-posta girin").optional().or(z.literal("")),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ hata: "Giriş gerekli" }, { status: 401 });

  const { data: accountant } = await supabase
    .from("accountants").select("id").eq("user_id", user.id).single();
  if (!accountant) return NextResponse.json({ hata: "Hesap bulunamadı" }, { status: 404 });

  const body = await request.json();
  const result = MusteriSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ hata: "Geçersiz veri", detaylar: result.error.flatten() }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("clients")
    .insert({ ...result.data, accountant_id: accountant.id, email: result.data.email || null })
    .select()
    .single();

  if (error) return NextResponse.json({ hata: "Müşteri eklenemedi" }, { status: 500 });

  // Aktivite logu
  await supabase.from("activity_logs").insert({
    accountant_id: accountant.id,
    client_id: data.id,
    action: "musteri_eklendi",
    entity_type: "client",
    entity_id: data.id,
  });

  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: accountant } = await supabase
    .from("accountants").select("id").eq("user_id", user.id).single();
  if (!accountant) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const { id, ...updates } = await request.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const allowed = ["monthly_fee", "notes", "phone", "email", "status",
    "tax_number", "tax_office", "e_invoice_status", "gib_debt", "gib_debt_checked_at"];
  const safe = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)));

  const { data, error } = await supabase
    .from("clients")
    .update({ ...safe, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("accountant_id", accountant.id)
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ hata: "Giriş gerekli" }, { status: 401 });

  const { data: accountant } = await supabase
    .from("accountants").select("id").eq("user_id", user.id).single();

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("accountant_id", accountant!.id)
    .neq("status", "archived")
    .order("full_name");

  if (error) return NextResponse.json({ hata: "Veri alınamadı" }, { status: 500 });
  return NextResponse.json(data);
}
