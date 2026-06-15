import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { user_id, full_name, email, office_name } = await request.json();

  if (!user_id || !full_name || !email) {
    return NextResponse.json({ error: "Eksik alan" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  const { error } = await supabase.from("accountants").insert({
    user_id,
    full_name,
    email,
    office_name: office_name ?? null,
  });

  if (error) {
    console.error("Accountant insert error:", error);
    return NextResponse.json({ error: "Kayıt oluşturulamadı" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
