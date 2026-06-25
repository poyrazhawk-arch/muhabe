import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendBelgeIstegiEmail } from "@/lib/utils/email";

const TokenSchema = z.object({
  client_id:      z.string().uuid(),
  document_types: z.array(z.string()).min(1),
  message:        z.string().optional(),
  expires_hours:  z.number().min(1).max(168).default(48),
  max_uses:       z.number().min(1).max(50).default(10),
  send_email:     z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: accountant } = await supabase
    .from("accountants").select("id, full_name").eq("user_id", user.id).single();
  if (!accountant) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const body = await request.json();
  const result = TokenSchema.safeParse(body);
  if (!result.success)
    return NextResponse.json({ error: "Invalid data", details: result.error.flatten() }, { status: 400 });

  const { data: client } = await supabase
    .from("clients")
    .select("id, full_name, email")
    .eq("id", result.data.client_id)
    .eq("accountant_id", accountant.id)
    .single();
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + result.data.expires_hours);

  const { data: token, error } = await supabase
    .from("upload_tokens")
    .insert({
      client_id:      result.data.client_id,
      accountant_id:  accountant.id,
      document_types: result.data.document_types,
      message:        result.data.message ?? null,
      expires_at:     expiresAt.toISOString(),
      max_uses:       result.data.max_uses,
    })
    .select()
    .single();

  if (error || !token) return NextResponse.json({ error: "Failed to create token" }, { status: 500 });

  const uploadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/yukle?token=${token.token}`;

  let emailSent = false;
  if (result.data.send_email && client.email) {
    try {
      await sendBelgeIstegiEmail({
        to:             client.email,
        clientName:     client.full_name,
        accountantName: accountant.full_name ?? "Your accountant",
        uploadUrl,
        documentTypes:  result.data.document_types,
        message:        result.data.message ?? undefined,
      });
      emailSent = true;
    } catch {
      // Email failure should not block the token creation response
    }
  }

  return NextResponse.json({ ...token, upload_url: uploadUrl, email_sent: emailSent }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: accountant } = await supabase
    .from("accountants").select("id").eq("user_id", user.id).single();

  const clientId = request.nextUrl.searchParams.get("client_id");
  let query = supabase
    .from("upload_tokens")
    .select("*, clients(full_name)")
    .eq("accountant_id", accountant!.id)
    .order("created_at", { ascending: false });

  if (clientId) query = query.eq("client_id", clientId);

  const { data } = await query;
  return NextResponse.json(data ?? []);
}
