import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const Schema = z.object({
  client_id: z.string().uuid(),
  channel:   z.enum(["note", "email", "call", "letter"]),
  subject:   z.string().min(1).max(200),
  body:      z.string().optional(),
  logged_at: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: accountant } = await supabase
    .from("accountants").select("id").eq("user_id", user.id).single();

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const { data, error } = await supabase
    .from("client_comms")
    .insert({
      accountant_id: accountant!.id,
      client_id:     parsed.data.client_id,
      channel:       parsed.data.channel,
      subject:       parsed.data.subject,
      body:          parsed.data.body ?? null,
      logged_at:     parsed.data.logged_at ?? new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
