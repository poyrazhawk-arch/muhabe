import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { format, isPast, isToday } from "date-fns";
import { enUS, tr } from "date-fns/locale";
import { ClipboardText, Plus } from "@phosphor-icons/react/dist/ssr";
import GorevTamamlaButton from "./GorevTamamlaButton";
import { getLocale } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n/dictionaries";

const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, normal: 2, low: 3 };

export default async function GorevlerPage() {
  const locale = await getLocale();
  const t = getDict(locale).gorevler;
  const dateLocale = locale === "tr" ? tr : enUS;

  const P_CFG: Record<string, { dot: string; label: string }> = {
    critical: { dot: "#dc2626", label: t.priorityCritical },
    high:     { dot: "#ea580c", label: t.priorityHigh     },
    normal:   { dot: "#6b7280", label: t.priorityNormal   },
    low:      { dot: "#9ca3af", label: t.priorityLow       },
  };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: accountant } = await supabase
    .from("accountants").select("id").eq("user_id", user!.id).single();

  const { data: raw } = await supabase
    .from("tasks").select("*, clients(full_name)")
    .eq("accountant_id", accountant!.id)
    .neq("status", "completed").neq("status", "cancelled")
    .order("due_date");

  const tasks = [...(raw ?? [])].sort((a, b) => {
    const aO = isPast(new Date(a.due_date)) && !isToday(new Date(a.due_date));
    const bO = isPast(new Date(b.due_date)) && !isToday(new Date(b.due_date));
    const pa = PRIORITY_ORDER[a.priority] ?? 2;
    const pb = PRIORITY_ORDER[b.priority] ?? 2;
    if (pa !== pb) return pa - pb;
    if (aO !== bO) return aO ? -1 : 1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  const geciken = tasks.filter(t => isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date))).length;
  const bugun   = tasks.filter(t => isToday(new Date(t.due_date))).length;
  const critical = tasks.filter(t => t.priority === "critical").length;

  return (
    <div className="space-y-5 animate-fade-up">

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 6 }}>
            {t.tasks}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.055em", color: "var(--text-1)", lineHeight: 1 }}>
              {tasks.length}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {geciken > 0 && (
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20,
                  background: "var(--red-bg)", color: "var(--red)", border: "1px solid var(--red-lt)",
                }}>
                  {geciken} {t.overdue}
                </span>
              )}
              {bugun > 0 && (
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20,
                  background: "var(--amber-bg)", color: "var(--amber)", border: "1px solid var(--amber-lt)",
                }}>
                  {bugun} {t.today}
                </span>
              )}
              {critical > 0 && (
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20,
                  background: "#fff1f2", color: "#dc2626", border: "1px solid #fecaca",
                }}>
                  {critical} {t.critical}
                </span>
              )}
            </div>
          </div>
        </div>
        <Link
          href="/dashboard/gorevler/yeni"
          className="btn-primary"
          style={{ alignSelf: "flex-end" }}
        >
          <Plus size={13} weight="bold" />
          {t.newTask}
        </Link>
      </div>

      {/* Table */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow-sm)",
      }}>
        {tasks.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, margin: "0 auto 12px",
              background: "var(--surface-2)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ClipboardText size={20} style={{ color: "var(--text-3)" }} weight="duotone" />
            </div>
            <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-1)" }}>{t.noActiveTasks}</p>
            <p style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 4 }}>{t.addTaskToStart}</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
                {[
                  { label: t.colTask,      w: "auto" },
                  { label: t.colClient,    w: 160 },
                  { label: t.colDue,       w: 130 },
                  { label: t.colPriority,  w: 100 },
                  { label: "",          w: 110 },
                ].map((col, i) => (
                  <th key={i}
                    style={{
                      padding: "9px 16px",
                      fontSize: 10.5, fontWeight: 600, letterSpacing: "0.07em",
                      textTransform: "uppercase", color: "var(--text-3)",
                      textAlign: i === 4 ? "right" : "left",
                      width: col.w !== "auto" ? col.w : undefined,
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map((task: any, idx: number) => {
                const due     = new Date(task.due_date);
                const overdue = isPast(due) && !isToday(due);
                const todayT  = isToday(due);
                const p       = P_CFG[task.priority] ?? P_CFG.normal;
                const criticalOverdue = task.priority === "critical" && overdue;

                return (
                  <tr
                    key={task.id}
                    style={{
                      borderTop: idx > 0 ? "1px solid var(--border-2)" : "none",
                      background: criticalOverdue ? "rgba(220,38,38,0.025)" : "transparent",
                      transition: "background 0.1s",
                      position: "relative",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = criticalOverdue ? "rgba(220,38,38,0.055)" : "var(--surface-2)")}
                    onMouseLeave={e => (e.currentTarget.style.background = criticalOverdue ? "rgba(220,38,38,0.025)" : "transparent")}
                  >
                    {/* Priority stripe */}
                    <td style={{ padding: 0, width: 3 }}>
                      <div style={{
                        width: 3, height: "100%", minHeight: 44,
                        background: criticalOverdue ? "#dc2626" : task.priority === "critical" ? "#dc262644" : "transparent",
                      }} />
                    </td>

                    {/* Task name */}
                    <td style={{ padding: "11px 14px 11px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          title={p.label}
                          style={{
                            width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                            background: overdue ? "#dc2626" : todayT ? "#d97706" : p.dot,
                          }}
                        />
                        <span style={{
                          fontSize: 13, fontWeight: 600, color: "var(--text-1)",
                          letterSpacing: "-0.01em",
                        }}>
                          {task.title}
                        </span>
                      </div>
                    </td>

                    {/* Client */}
                    <td style={{ padding: "11px 14px", fontSize: 12.5, color: "var(--text-3)", width: 160 }}>
                      {task.clients ? (task.clients as any).full_name : <span style={{ color: "var(--border)" }}>—</span>}
                    </td>

                    {/* Due date */}
                    <td style={{ padding: "11px 14px", width: 130 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{
                          fontSize: 12.5, fontWeight: overdue || todayT ? 600 : 400,
                          color: overdue ? "#dc2626" : todayT ? "#d97706" : "var(--text-3)",
                          fontVariantNumeric: "tabular-nums",
                        }}>
                          {format(due, "d MMM", { locale: dateLocale })}
                        </span>
                        {overdue && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 4,
                            background: "var(--red-bg)", color: "var(--red)", letterSpacing: "0.02em",
                          }}>
                            {t.overdueBadge}
                          </span>
                        )}
                        {todayT && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 4,
                            background: "var(--amber-bg)", color: "var(--amber)", letterSpacing: "0.02em",
                          }}>
                            {t.todayBadge}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Priority pill */}
                    <td style={{ padding: "11px 14px", width: 100 }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        fontSize: 11.5, fontWeight: 500, color: "var(--text-3)",
                      }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: "50%", background: p.dot, flexShrink: 0,
                        }} />
                        {p.label}
                      </span>
                    </td>

                    {/* Action */}
                    <td style={{ padding: "11px 16px", textAlign: "right", width: 110 }}>
                      <GorevTamamlaButton gorevId={task.id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
