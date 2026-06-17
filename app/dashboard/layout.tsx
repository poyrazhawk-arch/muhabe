import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/giris");

  const { data: accountant } = await supabase
    .from("accountants").select("*").eq("user_id", user.id).single();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      <Sidebar accountant={accountant} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1140px] mx-auto px-7 py-7">{children}</div>
      </main>
    </div>
  );
}
