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

  // Browser dilini otomatik tespit et (sadece ilk ziyarette)
  const existingLocale = request.cookies.get("locale")?.value;
  let activeLocale: "tr" | "en" = existingLocale === "tr" ? "tr" : existingLocale === "en" ? "en" : "en";
  if (!existingLocale) {
    const acceptLanguage = request.headers.get("accept-language") ?? "";
    activeLocale = acceptLanguage.toLowerCase().startsWith("tr") ? "tr" : "en";
    supabaseResponse.cookies.set("locale", activeLocale, { maxAge: 60 * 60 * 24 * 365, path: "/" });
  }

  // Ülke tespiti (IP konumu) — GİB gibi Türkiye'ye özel özellikleri kapılamak için.
  // İlk ziyarette Vercel geo header'ından yazılır; header yoksa (localhost) varsayılan TR.
  if (!request.cookies.get("country")) {
    const country = (request.headers.get("x-vercel-ip-country") || "TR").toUpperCase();
    supabaseResponse.cookies.set("country", country, { maxAge: 60 * 60 * 24 * 365, path: "/" });
  }

  const path = request.nextUrl.pathname;
  const isAuthPage      = path.startsWith("/auth");
  const isUploadPage    = path.startsWith("/yukle");
  const isApiRoute      = path.startsWith("/api");
  const isPricingPage   = path === "/pricing";
  const isPortalPage    = path.startsWith("/portal");
  const isPublicPage    = isAuthPage || isUploadPage || isApiRoute || isPricingPage || isPortalPage || path === "/";
  const isPasswordReset = path === "/auth/sifremi-guncelle";

  // Not logged in → login page
  if (!user && !isPublicPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/giris";
    return NextResponse.redirect(url);
  }

  // Logged in → redirect away from auth pages (except password reset)
  if (user && isAuthPage && !isPasswordReset) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Subscription check for logged-in users accessing dashboard
  if (user && path.startsWith("/dashboard")) {
    const { data: accountant } = await supabase
      .from("accountants")
      .select("plan, trial_ends_at, locale")
      .eq("user_id", user.id)
      .single();

    if (accountant) {
      // Muhasebecinin kalıcı dil tercihini tarayıcı diline eşitle
      // (cron/e-posta gibi istek bağlamı olmayan yerler bunu kullanır)
      if (accountant.locale !== activeLocale) {
        await supabase.from("accountants").update({ locale: activeLocale }).eq("user_id", user.id);
      }

      const hasPaidPlan  = accountant.plan && accountant.plan !== "free";
      const trialActive  = accountant.trial_ends_at
        ? new Date(accountant.trial_ends_at) > new Date()
        : false;

      if (!hasPaidPlan && !trialActive) {
        const url = request.nextUrl.clone();
        url.pathname = "/pricing";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
