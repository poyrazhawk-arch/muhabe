import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // `next` parametresi: resetPasswordForEmail'de redirectTo'ya eklenir
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // next mutlaka kendi origin'imizle başlasın (open redirect önlemi)
      const safeNext = next.startsWith("/") ? `${origin}${next}` : `${origin}/dashboard`;
      return NextResponse.redirect(safeNext);
    }
  }

  return NextResponse.redirect(`${origin}/auth/giris?hata=dogrulama-hatasi`);
}
