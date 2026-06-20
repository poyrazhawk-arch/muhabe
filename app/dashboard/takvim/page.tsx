import { createClient } from "@/lib/supabase/server";
import { format, isBefore, addDays } from "date-fns";
import { enUS } from "date-fns/locale";
import { generateTaxCalendar, getUpcomingDeadlines } from "@/lib/utils/taxCalendar";

const BEYANNAME_COLOR: Record<string, { bg: string; color: string; border: string }> = {
  "VAT Return":                  { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  "PAYE / Payroll Filing":       { bg: "#f5f3ff", color: "#6d28d9", border: "#ddd6fe" },
  "Q1 Corporation Tax":          { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  "Q2 Corporation Tax":          { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  "Q3 Corporation Tax":          { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  "Q4 Corporation Tax":          { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  "Self Assessment (online)":    { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  "Corporation Tax Return":      { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  "Company Accounts Filing":     { bg: "#fdf4ff", color: "#7e22ce", border: "#e9d5ff" },
  "Confirmation Statement":      { bg: "#f0f9ff", color: "#0369a1", border: "#bae6fd" },
  default:                        { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" },
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
          {year} filing deadlines — UK / International
        </p>
      </div>

      {/* Özet */}
      <div className="rounded-xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="grid grid-cols-3">
          {[
            { label: "This Month",  value: thisMonth.length, numColor: "#2563eb",  bg: "transparent" },
            { label: "Next 60 Days", value: upcoming.length, numColor: "#d97706",  bg: "transparent" },
            { label: "Past Due",    value: overdue.length,   numColor: overdue.length > 0 ? "#dc2626" : "var(--text-3)", bg: overdue.length > 0 ? "var(--red-bg)" : "transparent" },
          ].map(({ label, value, numColor, bg }, i) => (
            <div key={label} className="px-5 py-4"
              style={{
                borderRight: i < 2 ? "1px solid var(--border-2)" : "none",
                background: bg,
              }}>
              <p className="tabular-nums leading-none"
                style={{ fontSize: "30px", fontWeight: 700, letterSpacing: "-0.045em", color: numColor, marginBottom: 6 }}>
                {value}
              </p>
              <p className="text-[11.5px] font-medium" style={{ color: "var(--text-3)" }}>{label}</p>
            </div>
          ))}
        </div>
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
          <div>
            {upcoming.map((item, i) => {
              const due = new Date(item.due_date);
              const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              const urgent = daysLeft <= 7;
              const cfg = BEYANNAME_COLOR[item.beyanname_turu] ?? BEYANNAME_COLOR.default;
              return (
                <div key={i} className="px-5 py-3 flex items-center justify-between"
                  style={{ borderTop: i > 0 ? "1px solid var(--border-2)" : "none" }}>
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
        <div>
          {thisMonth.map((item, i) => {
            const due = new Date(item.due_date);
            const passed = isBefore(due, now);
            const cfg = BEYANNAME_COLOR[item.beyanname_turu] ?? BEYANNAME_COLOR.default;
            return (
              <div key={i} className="px-5 py-3 flex items-center justify-between"
                style={{ borderTop: i > 0 ? "1px solid var(--border-2)" : "none", opacity: passed ? 0.5 : 1 }}>
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
