import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const Schema = z.object({
  status: z.enum(["pending", "received", "approved", "rejected"]),
  notes: z.string().optional(),
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
  const result = Schema.safeParse(body);
  if (!result.success)
    return NextResponse.json({ hata: "Geçersiz veri" }, { status: 400 });

  const update: Record<string, unknown> = { ...result.data };
  if (result.data.status === "approved") {
    update.approved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("documents")
    .update(update)
    .eq("id", id)
    .eq("accountant_id", accountant!.id)
    .select()
    .single();

  if (error || !data)
    return NextResponse.json({ hata: "Belge güncellenemedi" }, { status: 500 });

  return NextResponse.json(data);
}
