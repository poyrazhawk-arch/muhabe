import { createClient } from "@/lib/supabase/server";
import { calculateRAG } from "@/lib/utils/rag";
import { format, isToday, isThisWeek, isPast, isBefore } from "date-fns";
import { enUS } from "date-fns/locale";
import { tr } from "date-fns/locale";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import MetricStrip from "@/components/dashboard/MetricStrip";
import CollectionWidget from "@/components/dashboard/CollectionWidget";
import { getLocale } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n/dictionaries";
import { formatMoney } from "@/lib/utils/currency";

type StatKey = "clients" | "today" | "overdue" | "docs";

export default async function DashboardPage() {
  const locale = await getLocale();
  const t = getDict(locale).dashboardHome;
  const dateLocale = locale === "tr" ? tr : enUS;

  const RAG_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    red:   { label: locale === "tr" ? "Kritik" : "Critical", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
    amber: { label: locale === "tr" ? "Uyarı"   : "Warning",  color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
    green: { label: "OK",       color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: accountant } = await supabase
    .from("accountants").select("id, full_name").eq("user_id", user!.id).single();
  if (!accountant) return <div>{t.accountNotFound}</div>;

  const now2   = new Date();
  const month2 = now2.getMonth() + 1;
  const year2  = now2.getFullYear();

  const [{ data: clients }, { data: allTasks }, { data: pendingDocs }, { data: thisMonthFees }] = await Promise.all([
    supabase.from("clients")
      .select("id, full_name, company_name")
      .eq("accountant_id", accountant.id)
      .eq("status", "active")
      .order("full_name"),
    supabase.from("tasks")
      .select("id, title, due_date, status, priority, client_id, clients(full_name)")
      .eq("accountant_id", accountant.id)
      .neq("status", "completed")
      .neq("status", "cancelled")
      .order("due_date"),
    supabase.from("documents")
      .select("id, client_id")
      .eq("accountant_id", accountant.id)
      .eq("status", "pending"),
    supabase.from("service_fees")
      .select("amount, status")
      .eq("accountant_id", accountant.id)
      .eq("period_month", month2)
      .eq("period_year", year2),
  ]);

  const today          = new Date();
  const tasksDueToday  = allTasks?.filter(t => isToday(new Date(t.due_date))) ?? [];
  const overdueTasks   = allTasks?.filter(t => isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date))) ?? [];

  const PRIORITY_ORD: Record<string, number> = { critical: 0, high: 1, normal: 2, low: 3 };
  const tasksDueWeek   = [...(allTasks?.filter(t => isThisWeek(new Date(t.due_date), { weekStartsOn: 1 })) ?? [])].sort((a, b) => {
    const aOverdue = isPast(new Date(a.due_date)) && !isToday(new Date(a.due_date));
    const bOverdue = isPast(new Date(b.due_date)) && !isToday(new Date(b.due_date));
    const pa = PRIORITY_ORD[a.priority] ?? 2;
    const pb = PRIORITY_ORD[b.priority] ?? 2;
    if (pa !== pb) return pa - pb;
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  const clientsWithRAG = (clients ?? []).map(c => {
    const pendingCount = pendingDocs?.filter(d => d.client_id === c.id).length ?? 0;
    const overdueCount = overdueTasks.filter(t => t.client_id === c.id).length;
    const dueSoonCount = tasksDueWeek.filter(t => t.client_id === c.id).length;
    return { ...c, rag: calculateRAG(overdueCount, pendingCount, dueSoonCount), overdueCount, pendingCount };
  }).sort((a, b) => ({ red: 0, amber: 1, green: 2 }[a.rag] - { red: 0, amber: 1, green: 2 }[b.rag]));

  const stats: Record<StatKey, number> = {
    clients: clients?.length ?? 0,
    today:   tasksDueToday.length,
    overdue: overdueTasks.length,
    docs:    pendingDocs?.length ?? 0,
  };

  const feeOdenen   = thisMonthFees?.filter(f => f.status === "paid").reduce((s, f) => s + Number(f.amount), 0) ?? 0;
  const feeBekleyen = thisMonthFees?.filter(f => f.status === "pending").reduce((s, f) => s + Number(f.amount), 0) ?? 0;
  const feeGecikmiş = thisMonthFees?.filter(f => f.status === "overdue").reduce((s, f) => s + Number(f.amount), 0) ?? 0;
  const feeToplam   = feeOdenen + feeBekleyen + feeGecikmiş;
  const fmtTL = (n: number) => formatMoney(n, locale, { maximumFractionDigits: 0 });

  return (
    <div className="space-y-6 animate-fade-up">

      {/* Header — date label + stats + action */}
      <div
        className="flex items-end justify-between pb-6"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-3)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            {format(today, "EEEE, d MMMM yyyy", { locale: dateLocale })}
          </p>
          <MetricStrip metrics={[
            { key: "clients", label: t.activeClients, value: stats.clients },
            { key: "today",   label: t.dueToday,      value: stats.today,   isWarning: stats.today > 0 },
            { key: "overdue", label: t.overdueTasksLabel,  value: stats.overdue, isDanger:  stats.overdue > 0 },
            { key: "docs",    label: t.pendingDocs,   value: stats.docs },
          ]} />
        </div>
        <Link
          href="/dashboard/gorevler/yeni"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-all active:scale-[0.98]"
          style={{
            background: "var(--accent)",
            boxShadow: "0 1px 3px rgba(37,99,235,0.3), 0 2px 10px rgba(37,99,235,0.12)",
            alignSelf: "flex-end",
          }}
        >
          <Plus size={13} weight="bold" />
          {t.newTask}
        </Link>
      </div>

      {/* Collection progress — animated bar */}
      <CollectionWidget
        total={feeToplam}
        paid={feeOdenen}
        pending={feeBekleyen}
        overdue={feeGecikmiş}
        monthLabel={format(today, "MMMM yyyy", { locale: dateLocale })}
        locale={locale}
      />

      {/* Content row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Müşteri RAG */}
        <div
          className="lg:col-span-3 rounded-xl overflow-hidden"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--border-2)" }}
          >
            <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-3)", letterSpacing: "0.07em", textTransform: "uppercase" }}>
              {t.clientsHeader} · {clients?.length ?? 0} {t.active}
            </p>
            <Link
              href="/dashboard/musteriler"
              style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-3)", textDecoration: "none" }}
            >
              {t.viewAll}
            </Link>
          </div>

          <div className="max-h-[280px] overflow-auto">
            {clientsWithRAG.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-[13px]" style={{ color: "var(--text-3)" }}>{t.noClientsYet}</p>
                <Link href="/dashboard/musteriler/yeni"
                  className="text-[12px] mt-2 inline-block font-medium" style={{ color: "var(--accent)" }}>
                  {t.addClient}
                </Link>
              </div>
            ) : clientsWithRAG.map(client => {
              const cfg = RAG_CFG[client.rag];
              return (
                <Link
                  key={client.id}
                  href={`/dashboard/musteriler/${client.id}`}
                  className="px-5 py-2.5 flex items-center justify-between transition-colors"
                  style={{ borderTop: "1px solid var(--border-2)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
                      style={{ background: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border)" }}
                    >
                      {client.full_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium truncate" style={{ color: "var(--text-1)" }}>
                        {client.full_name}
                      </p>
                      {client.company_name && (
                        <p className="text-[11px] truncate" style={{ color: "var(--text-3)" }}>
                          {client.company_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {client.overdueCount > 0 && (
                      <span className="text-[11px] font-medium tabular-nums" style={{ color: "var(--red)" }}>
                        {client.overdueCount} {t.overdueCount}
                      </span>
                    )}
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bu hafta görevler */}
        <div
          className="lg:col-span-2 rounded-xl overflow-hidden"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-2)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-3)", letterSpacing: "0.07em", textTransform: "uppercase" }}>
              {t.thisWeek}
            </p>
            <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 500 }}>
              {tasksDueWeek.length} {t.tasksCount}
            </span>
          </div>
          <div className="max-h-[280px] overflow-auto">
            {tasksDueWeek.length === 0 ? (
              <p style={{ padding: "40px 16px", textAlign: "center", fontSize: 12.5, color: "var(--text-3)" }}>
                {t.clearWeek}
              </p>
            ) : tasksDueWeek.map((task: any, ti: number) => {
              const overdue   = isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));
              const todayTask = isToday(new Date(task.due_date));
              const isCritical = task.priority === "critical";
              const dotColor = overdue ? "var(--red)" : todayTask ? "var(--amber)" : isCritical ? "#dc2626" : "var(--border)";
              return (
                <div
                  key={task.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 14px",
                    borderTop: ti > 0 ? "1px solid var(--border-2)" : "none",
                    background: (isCritical && overdue) ? "rgba(220,38,38,0.02)" : "transparent",
                    transition: "background 0.1s", cursor: "default",
                    position: "relative",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = (isCritical && overdue) ? "rgba(220,38,38,0.05)" : "var(--surface-2)")}
                  onMouseLeave={e => (e.currentTarget.style.background = (isCritical && overdue) ? "rgba(220,38,38,0.02)" : "transparent")}
                >
                  {/* Priority dot */}
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{
                      fontSize: 12.5, fontWeight: isCritical ? 600 : 500,
                      color: "var(--text-1)", letterSpacing: "-0.01em",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {task.title}
                    </p>
                    {task.clients && (
                      <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>
                        {(task.clients as any).full_name}
                      </p>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                    {overdue && (
                      <span style={{
                        fontSize: 9.5, fontWeight: 700, padding: "1px 5px", borderRadius: 4,
                        background: "var(--red-bg)", color: "var(--red)", letterSpacing: "0.04em",
                      }}>
                        {t.late}
                      </span>
                    )}
                    <span style={{
                      fontSize: 11, fontWeight: 500, color: overdue ? "var(--red)" : todayTask ? "var(--amber)" : "var(--text-3)",
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {format(new Date(task.due_date), "d MMM", { locale: dateLocale })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
