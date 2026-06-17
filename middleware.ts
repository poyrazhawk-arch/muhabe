import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthPage   = path.startsWith("/auth");
  const isUploadPage = path.startsWith("/yukle");
  const isPublicPage = isAuthPage || isUploadPage || path === "/";

  // Şifre güncelleme sayfası: session gerektirir, auth sayfası gibi davranmamalı
  const isPasswordReset = path === "/auth/sifremi-guncelle";

  if (!user && !isPublicPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/giris";
    return NextResponse.redirect(url);
  }

  // Loggedın kullanıcıyı auth sayfalarından uzaklaştır —
  // ama şifre güncelleme sayfasını kapsama (recovery session gerekiyor)
  if (user && isAuthPage && !isPasswordReset) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
