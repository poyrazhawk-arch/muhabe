import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  ChartBar,
  CalendarBlank,
  ClipboardText,
  Buildings,
} from "@phosphor-icons/react/dist/ssr";

export default async function RaporlarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: accountant } = await supabase
    .from("accountants").select("id").eq("user_id", user!.id).single();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, full_name, company_name")
    .eq("accountant_id", accountant!.id)
    .eq("status", "active")
    .order("full_name");

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-1)" }}>Raporlar</h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--text-3)" }}>
            {clients?.length ?? 0} aktif müşteri · aylık özet ve dönem kapanış raporları
          </p>
        </div>
      </div>

      {/* Rapor türleri özeti */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            icon: CalendarBlank,
            title: "Aylık Özet",
            desc: "Tamamlanan görevler, belgeler ve beyanname durumu",
            color: "#2563eb",
            bg: "var(--accent-bg)",
          },
          {
            icon: ClipboardText,
            title: "Dönem Kapanış",
            desc: "Vergi dönemi kapanış kontrolü ve eksik belgeler",
            color: "#7c3aed",
            bg: "var(--purple-bg)",
          },
        ].map(({ icon: Icon, title, desc, color, bg }) => (
          <div
            key={title}
            className="rounded-xl p-4 flex items-start gap-3"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: bg }}
            >
              <Icon size={16} style={{ color }} weight="duotone" />
            </div>
            <div>
              <p className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>{title}</p>
              <p className="text-[12px] mt-0.5 leading-snug" style={{ color: "var(--text-3)" }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Müşteri listesi */}
      {!clients || clients.length === 0 ? (
        <div
          className="rounded-xl py-16 text-center"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
          >
            <ChartBar size={22} style={{ color: "var(--text-3)" }} weight="duotone" />
          </div>
          <p className="text-[13px] font-medium" style={{ color: "var(--text-1)" }}>Henüz müşteri yok</p>
          <p className="text-[12px] mt-1" style={{ color: "var(--text-3)" }}>
            <Link href="/dashboard/musteriler/yeni" style={{ color: "var(--accent)" }}>Müşteri ekleyin</Link>
            {" "}ve raporlar burada görünür
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {clients.map((client) => {
            const initials = client.full_name
              .split(" ")
              .map((n: string) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <div
                key={client.id}
                className="rounded-xl p-4 flex items-center justify-between gap-4"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                    style={{
                      background: "var(--surface-2)",
                      color: "var(--text-2)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ color: "var(--text-1)" }}>
                      {client.full_name}
                    </p>
                    {client.company_name && (
                      <p className="text-[11px] truncate flex items-center gap-1 mt-0.5" style={{ color: "var(--text-3)" }}>
                        <Buildings size={10} weight="fill" />
                        {client.company_name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Link
                    href={`/dashboard/raporlar/musteri/${client.id}?tip=aylik`}
                    className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
                    style={{ color: "var(--accent)", background: "var(--accent-bg)", border: "1px solid var(--accent-lt)" }}
                  >
                    <CalendarBlank size={12} weight="bold" />
                    Aylık
                  </Link>
                  <Link
                    href={`/dashboard/raporlar/musteri/${client.id}?tip=kapanis`}
                    className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
                    style={{ color: "var(--text-2)", background: "var(--surface-2)", border: "1px solid var(--border)" }}
                  >
                    <ClipboardText size={12} weight="bold" />
                    Kapanış
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
