import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LandingPage from "@/components/LandingPage";

// Supabase bazen magic link kodunu root URL'e atar — buradan yakalıyoruz
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string; error_description?: string }>;
}) {
  const params = await searchParams;

  if (params.code) {
    redirect(`/auth/callback?code=${params.code}`);
  }

  if (params.error) {
    redirect(`/auth/giris?hata=${encodeURIComponent(params.error_description ?? params.error)}`);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  // Çıkış yapmış ziyaretçi: login'e atmak yerine ürünü anlatan vitrin
  return <LandingPage />;
}
