import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const SablonSchema = z.object({
  title: z.string().min(2, "Başlık en az 2 karakter"),
  description: z.string().optional(),
  recurrence_type: z.enum(["monthly", "quarterly", "yearly", "custom"]),
  due_day: z.number().min(1).max(31).optional(),
  due_month: z.number().min(1).max(12).optional(),
  advance_days: z.number().min(1).max(30).default(7),
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ hata: "Giriş gerekli" }, { status: 401 });

  const { data: accountant } = await supabase
    .from("accountants").select("id").eq("user_id", user.id).single();

  const { data } = await supabase
    .from("task_templates")
    .select("*")
    .eq("accountant_id", accountant!.id)
    .eq("is_active", true)
    .order("title");

  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ hata: "Giriş gerekli" }, { status: 401 });

  const { data: accountant } = await supabase
    .from("accountants").select("id").eq("user_id", user.id).single();

  const body = await request.json();
  const result = SablonSchema.safeParse(body);
  if (!result.success)
    return NextResponse.json({ hata: "Geçersiz veri", detaylar: result.error.flatten() }, { status: 400 });

  const { data, error } = await supabase
    .from("task_templates")
    .insert({ ...result.data, accountant_id: accountant!.id })
    .select().single();

  if (error) return NextResponse.json({ hata: "Şablon oluşturulamadı" }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
