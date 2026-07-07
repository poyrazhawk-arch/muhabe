import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { email, password, fullName, officeName } = await request.json();

  if (!email || !password || !fullName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const metadata = { full_name: fullName, office_name: officeName || null };

  // 1) Tercih edilen yol: service key ile onaysız kullanıcı (tek adımda giriş)
  const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });

  if (!error) {
    return NextResponse.json({ success: true, needsConfirmation: false, userId: data.user?.id });
  }

  if (error.message.includes("already been registered") || error.message.includes("already exists")) {
    return NextResponse.json({ error: "This email is already registered. Sign in instead." }, { status: 409 });
  }

  // 2) Service key geçersizse (ör. env hatası) kayıt kapısını kapatma:
  //    anon signUp ile devam et — kullanıcı e-postasını onaylayıp girer.
  const anon = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.ledgerapp.online";

  const { data: anonData, error: anonError } = await anon.auth.signUp({
    email,
    password,
    options: { data: metadata, emailRedirectTo: appUrl },
  });

  if (anonError) {
    if (anonError.message.includes("already registered")) {
      return NextResponse.json({ error: "This email is already registered. Sign in instead." }, { status: 409 });
    }
    return NextResponse.json({ error: anonError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    needsConfirmation: !anonData.session,
    userId: anonData.user?.id,
  });
}
