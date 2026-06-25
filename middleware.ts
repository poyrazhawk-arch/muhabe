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
  const isAuthPage      = path.startsWith("/auth");
  const isUploadPage    = path.startsWith("/yukle");
  const isApiRoute      = path.startsWith("/api");
  const isPricingPage   = path === "/pricing";
  const isPublicPage    = isAuthPage || isUploadPage || isApiRoute || isPricingPage || path === "/";
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
      .select("plan, trial_ends_at")
      .eq("user_id", user.id)
      .single();

    if (accountant) {
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
