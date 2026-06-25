import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const GuncellemeSchema = z.object({
  status:        z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
  priority:      z.enum(["low", "normal", "high", "critical"]).optional(),
  outcome_ref:   z.string().optional(),
  outcome_notes: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ hata: "Giriş gerekli" }, { status: 401 });

  const { data: accountant } = await supabase
    .from("accountants").select("id").eq("user_id", user.id).single();

  const body = await request.json();
  const result = GuncellemeSchema.safeParse(body);
  if (!result.success)
    return NextResponse.json({ hata: "Geçersiz veri" }, { status: 400 });

  const update: Record<string, unknown> = { ...result.data };
  if (result.data.status === "completed") {
    update.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(update)
    .eq("id", id)
    .eq("accountant_id", accountant!.id)
    .select()
    .single();

  if (error || !data)
    return NextResponse.json({ hata: "Görev güncellenemedi" }, { status: 500 });

  await supabase.from("activity_logs").insert({
    accountant_id: accountant!.id,
    client_id: data.client_id,
    action: `gorev_${result.data.status}`,
    entity_type: "task",
    entity_id: id,
  });

  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ hata: "Giriş gerekli" }, { status: 401 });

  const { data: accountant } = await supabase
    .from("accountants").select("id").eq("user_id", user.id).single();

  const { error } = await supabase
    .from("tasks")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("accountant_id", accountant!.id);

  if (error) return NextResponse.json({ hata: "İşlem başarısız" }, { status: 500 });
  return NextResponse.json({ basarili: true });
}
