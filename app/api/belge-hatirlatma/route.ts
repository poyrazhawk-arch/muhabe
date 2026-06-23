import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { sendBelgeIstegiEmail } from "@/lib/utils/email";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token_id } = await req.json();

  const { data: accountant } = await supabase
    .from("accountants").select("id, full_name").eq("user_id", user.id).single();
  if (!accountant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: token } = await supabase
    .from("upload_tokens")
    .select("*, clients(full_name, email)")
    .eq("id", token_id)
    .eq("accountant_id", accountant.id)
    .eq("is_active", true)
    .single();

  if (!token) return NextResponse.json({ error: "Token not found or expired" }, { status: 404 });

  const client = token.clients as any;
  if (!client?.email)
    return NextResponse.json({ error: "Client has no email address" }, { status: 400 });

  const uploadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/yukle?token=${token.token}`;

  await sendBelgeIstegiEmail({
    to:             client.email,
    clientName:     client.full_name,
    accountantName: accountant.full_name ?? "Your accountant",
    uploadUrl,
    documentTypes:  token.document_types ?? [],
    message:        token.message ?? undefined,
  });

  return NextResponse.json({ ok: true, to: client.email });
}
