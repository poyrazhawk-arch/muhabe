import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import SablonForm from "./SablonForm";

const RECURRENCE: Record<string, string> = {
  monthly:   "Her Ay",
  quarterly: "Her Çeyrek",
  yearly:    "Yıllık",
  custom:    "Özel",
};

export default async function GorevSablonlariPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: accountant } = await supabase
    .from("accountants").select("id").eq("user_id", user!.id).single();

  const { data: sablonlar } = await supabase
    .from("task_templates")
    .select("*")
    .eq("accountant_id", accountant!.id)
    .order("title");

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/gorevler" className="text-[12px] font-medium" style={{ color: "var(--text-3)" }}>
              Görevler
            </Link>
            <span style={{ color: "var(--text-3)" }}>/</span>
            <span className="text-[12px] font-medium" style={{ color: "var(--text-2)" }}>Şablonlar</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-1)" }}>Görev Şablonları</h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--text-3)" }}>
            Her ay otomatik oluşturulacak tekrarlayan görev şablonları
          </p>
        </div>
        <SablonForm />
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
      >
        {!sablonlar || sablonlar.length === 0 ? (
          <div className="py-16 text-center">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
            >
              <svg className="w-5 h-5" style={{ color: "var(--text-3)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <p className="text-[13px] font-medium" style={{ color: "var(--text-1)" }}>Henüz şablon yok</p>
            <p className="text-[12px] mt-1" style={{ color: "var(--text-3)" }}>
              Şablon ekleyin — her ay otomatik görev oluşturulsun
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead style={{ background: "#fafbfc", borderBottom: "1px solid var(--border)" }}>
              <tr>
                {["Şablon Adı", "Tekrar", "Son Tarih (Gün)", "Önceden (Gün)", "Durum"].map((h, i) => (
                  <th key={i} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-3)", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sablonlar.map((s: any, idx: number) => (
                <tr key={s.id} className="transition-colors hover:bg-slate-50/60"
                  style={{ borderTop: idx > 0 ? "1px solid var(--border-2)" : "none" }}>
                  <td className="px-5 py-3">
                    <p className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>{s.title}</p>
                    {s.description && (
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>{s.description}</p>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                      style={{ background: "var(--accent-bg)", color: "var(--accent)", border: "1px solid var(--accent-lt)" }}>
                      {RECURRENCE[s.recurrence_type] ?? s.recurrence_type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[13px] tabular-nums" style={{ color: "var(--text-2)" }}>
                    {s.due_day ? `Her ayın ${s.due_day}'i` : s.due_month ? `${s.due_month}. ay` : "—"}
                  </td>
                  <td className="px-5 py-3 text-[13px] tabular-nums" style={{ color: "var(--text-2)" }}>
                    {s.advance_days} gün önce
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                      style={s.is_active
                        ? { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }
                        : { background: "var(--surface-2)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
                      {s.is_active ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div
        className="rounded-xl px-5 py-4"
        style={{ background: "var(--amber-bg)", border: "1px solid var(--amber-lt)" }}
      >
        <p className="text-[12px] font-semibold mb-1" style={{ color: "var(--amber)" }}>Otomatik Çalışma</p>
        <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-2)" }}>
          Şablonlar her ayın 1'inde saat 08:00'de otomatik çalışır ve tüm aktif müşteriler için görev oluşturur.
          Manuel tetikleme: <code style={{ background: "rgba(0,0,0,0.05)", padding: "1px 5px", borderRadius: "4px", fontSize: "11px" }}>/api/cron/gorev-olustur</code>
        </p>
      </div>
    </div>
  );
}
