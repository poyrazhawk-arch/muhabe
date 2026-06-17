import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Geçici admin endpoint — şifre sıfırlama linki üretir
export async function GET() {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: "psahin870@gmail.com",
    options: {
      redirectTo: `https://muhasebe-tawny.vercel.app/auth/callback?next=/auth/sifremi-guncelle`,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    link: data.properties?.action_link,
    note: "Bu linke tarayıcında tıkla — şifre sıfırlama sayfasına gider.",
  });
}
