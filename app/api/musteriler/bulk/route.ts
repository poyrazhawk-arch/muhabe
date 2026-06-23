import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const RowSchema = z.object({
  full_name:    z.string().min(1),
  company_name: z.string().optional(),
  tax_number:   z.string().optional(),
  email:        z.string().email().optional().or(z.literal("")),
  phone:        z.string().optional(),
  notes:        z.string().optional(),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: accountant } = await supabase
    .from("accountants").select("id").eq("user_id", user.id).single();
  if (!accountant) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const body = await request.json();
  const rows: unknown[] = Array.isArray(body) ? body : [];

  const valid: z.infer<typeof RowSchema>[] = [];
  const errors: { row: number; reason: string }[] = [];

  rows.forEach((row, i) => {
    const r = RowSchema.safeParse(row);
    if (r.success) valid.push(r.data);
    else errors.push({ row: i + 1, reason: r.error.issues[0]?.message ?? "Invalid" });
  });

  if (valid.length === 0) {
    return NextResponse.json({ error: "No valid rows", errors }, { status: 400 });
  }

  const inserts = valid.map(r => ({
    ...r,
    email: r.email || null,
    accountant_id: accountant.id,
  }));

  const { data: inserted, error: dbError } = await supabase
    .from("clients")
    .insert(inserts)
    .select("id");

  if (dbError) return NextResponse.json({ error: "DB error", detail: dbError.message }, { status: 500 });

  // Activity logs
  if (inserted?.length) {
    await supabase.from("activity_logs").insert(
      inserted.map(c => ({
        accountant_id: accountant.id,
        client_id: c.id,
        action: "musteri_eklendi",
        entity_type: "client",
        entity_id: c.id,
      }))
    );
  }

  return NextResponse.json({ imported: inserted?.length ?? 0, errors }, { status: 201 });
}
