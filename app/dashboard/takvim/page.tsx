import { createClient } from "@/lib/supabase/server";
import { format, isBefore, addDays } from "date-fns";
import { enUS } from "date-fns/locale";
import { generateTaxCalendar, getUpcomingDeadlines } from "@/lib/utils/taxCalendar";

const BEYANNAME_COLOR: Record<string, { bg: string; color: string; border: string }> = {
  "KDV Beyannamesi":            { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  "Muhtasar Beyanname":         { bg: "#f5f3ff", color: "#6d28d9", border: "#ddd6fe" },
  "SGK Aylık Bildirge":         { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  "BA-BS Bildirimi":            { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  "1. Dönem Geçici Vergi":      { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  "2. Dönem Geçici Vergi":      { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  "3. Dönem Geçici Vergi":      { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  default:                       { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" },
};

export default async function TakvimPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: accountant } = await supabase
    .from("accountants").select("id").eq("user_id", user!.id).single();

  const now  = new Date();
  const year = now.getFullYear();
  const allItems = generateTaxCalendar(year);
  const upcoming = getUpcomingDeadlines(allItems, 60);

  // Bu ayın tüm beyanname tarihleri
  const thisMonth = allItems.filter(item => {
    const d = new Date(item.due_date);
    return d.getFullYear() === year && d.getMonth() === now.getMonth();
  }).sort((a, b) => a.due_date.localeCompare(b.due_date));

  // Gecikmiş
  const overdue = allItems.filter(item => {
    const d = new Date(item.due_date);
    return isBefore(d, now) && d.getFullYear() === year;
  });

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-1)" }}>Tax Calendar</h1>
        <p className="text-[13px] mt-0.5" style={{ color: "var(--text-3)" }}>
          {year} Turkish tax filing calendar
        </p>
      </div>

      {/* Özet */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "This Month", value: thisMonth.length, color: "#2563eb", bg: "#eff6ff" },
          { label: "Next 60 Days", value: upcoming.length, color: "#d97706", bg: "#fffbeb" },
          { label: "Past Due", value: overdue.length, color: "#dc2626", bg: "#fef2f2" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="rounded-xl p-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", borderTop: `2px solid ${color}` }}>
            <p className="text-[26px] font-bold tracking-tight tabular-nums" style={{ color }}>{value}</p>
            <p className="text-[12px] mt-0.5 font-medium" style={{ color: "var(--text-3)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Yaklaşan (60 gün) */}
      <div className="rounded-xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
        <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--border-2)" }}>
          <h2 className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>Upcoming Filings (60 days)</h2>
        </div>
        {upcoming.length === 0 ? (
          <p className="px-5 py-10 text-center text-[13px]" style={{ color: "var(--text-3)" }}>
            No filings in the next 60 days
          </p>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border-2)" }}>
            {upcoming.map((item, i) => {
              const due = new Date(item.due_date);
              const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              const urgent = daysLeft <= 7;
              const cfg = BEYANNAME_COLOR[item.beyanname_turu] ?? BEYANNAME_COLOR.default;
              return (
                <div key={i} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                      {item.beyanname_turu}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] tabular-nums" style={{ color: "var(--text-2)" }}>
                      {format(due, "d MMMM yyyy", { locale: enUS })}
                    </span>
                    <span className="text-[12px] font-semibold px-2 py-0.5 rounded-md"
                      style={{
                        background: urgent ? "#fef2f2" : "#f8fafc",
                        color: urgent ? "#dc2626" : "#64748b",
                        border: urgent ? "1px solid #fecaca" : "1px solid #e2e8f0",
                      }}>
                      {daysLeft}d left
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bu ay */}
      <div className="rounded-xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
        <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--border-2)" }}>
          <h2 className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>
            {format(now, "MMMM yyyy", { locale: enUS })} Filings
          </h2>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--border-2)" }}>
          {thisMonth.map((item, i) => {
            const due = new Date(item.due_date);
            const passed = isBefore(due, now);
            const cfg = BEYANNAME_COLOR[item.beyanname_turu] ?? BEYANNAME_COLOR.default;
            return (
              <div key={i} className="px-5 py-3 flex items-center justify-between"
                style={{ opacity: passed ? 0.5 : 1 }}>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                  style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                  {item.beyanname_turu}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] tabular-nums" style={{ color: "var(--text-2)" }}>
                    {format(due, "d MMMM", { locale: enUS })}
                  </span>
                  {passed && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: "#f0fdf4", color: "#15803d" }}>
                      Done
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
