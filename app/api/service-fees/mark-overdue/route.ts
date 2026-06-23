import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Marks all pending fees whose due_date has passed as overdue
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: accountant } = await supabase
    .from("accountants").select("id").eq("user_id", user.id).single();
  if (!accountant) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("service_fees")
    .update({ status: "overdue", updated_at: new Date().toISOString() })
    .eq("accountant_id", accountant.id)
    .eq("status", "pending")
    .lt("due_date", today)
    .not("due_date", "is", null)
    .select("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ marked: data?.length ?? 0 });
}
