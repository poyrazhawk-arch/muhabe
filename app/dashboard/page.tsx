import { createClient } from "@/lib/supabase/server";
import { calculateRAG } from "@/lib/utils/rag";
import { format, isToday, isThisWeek, isPast } from "date-fns";
import { enUS } from "date-fns/locale";
import Link from "next/link";

const RAG_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  red:   { label: "Critical", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  amber: { label: "Warning",  color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  green: { label: "OK",       color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
};

type StatKey = "clients" | "today" | "overdue" | "docs";

const STAT_DEFS: Array<{
  key: StatKey;
  label: string;
  dotColor: string;
}> = [
  { key: "clients", label: "Active clients",  dotColor: "#3b82f6" },
  { key: "today",   label: "Due today",       dotColor: "#f59e0b" },
  { key: "overdue", label: "Overdue tasks",   dotColor: "#ef4444" },
  { key: "docs",    label: "Pending docs",    dotColor: "#8b5cf6" },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: accountant } = await supabase
    .from("accountants").select("id, full_name").eq("user_id", user!.id).single();
  if (!accountant) return <div>Account not found.</div>;

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
  const tasksDueWeek   = allTasks?.filter(t => isThisWeek(new Date(t.due_date), { weekStartsOn: 1 })) ?? [];
  const overdueTasks   = allTasks?.filter(t => isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date))) ?? [];

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
  const fmtTL = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const hour      = today.getHours();
  const greeting  = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = accountant.full_name?.split(" ")[0] ?? "";

  return (
    <div className="space-y-5 animate-fade-up">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[12px] font-medium" style={{ color: "var(--text-3)" }}>
            {format(today, "EEEE, d MMMM yyyy", { locale: enUS })}
          </p>
          <h1 className="mt-1 tracking-[-0.025em] font-bold" style={{ fontSize: "26px", color: "var(--text-1)", lineHeight: 1.2 }}>
            {greeting}, {firstName}
          </h1>
        </div>
        <Link
          href="/dashboard/gorevler/yeni"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-all active:scale-[0.98]"
          style={{
            background: "var(--accent)",
            boxShadow: "0 1px 3px rgba(37,99,235,0.3), 0 2px 10px rgba(37,99,235,0.12)",
          }}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
          </svg>
          New Task
        </Link>
      </div>

      {/* Stat cards — metric-forward, no decorative borders */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
        {STAT_DEFS.map(({ key, label, dotColor }) => (
          <div
            key={key}
            className="rounded-xl px-5 py-4 transition-all duration-150 hover:-translate-y-px hover:shadow-md"
            style={{
              background: key === "overdue" && stats[key] > 0 ? "var(--red-bg)" : "var(--surface)",
              border: `1px solid ${key === "overdue" && stats[key] > 0 ? "var(--red-lt)" : "var(--border)"}`,
            }}
          >
            <p className="text-[11px] font-medium mb-3" style={{ color: "var(--text-3)" }}>
              {label}
            </p>
            <p
              className="tabular-nums leading-none"
              style={{
                fontSize: "36px",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                color: stats[key] > 0 && (key === "overdue") ? "var(--red)"
                     : stats[key] > 0 && (key === "today") ? "var(--amber)"
                     : "var(--text-1)",
              }}
            >
              {stats[key]}
            </p>
            <div className="flex items-center gap-1.5 mt-3 pt-3" style={{ borderTop: "1px solid var(--border-2)" }}>
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dotColor }} />
              <p className="text-[11px]" style={{ color: "var(--text-3)" }}>
                {key === "clients" ? "total active" : key === "today" ? "due today" : key === "overdue" ? "action required" : "needs review"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Tahsilat widget */}
      {feeToplam > 0 && (
        <div
          className="rounded-xl p-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>This Month's Collections</h2>
              <p className="text-[12px]" style={{ color: "var(--text-3)" }}>
                {format(today, "MMMM yyyy", { locale: enUS })}
              </p>
            </div>
            <Link
              href="/dashboard/finans"
              className="text-[12px] font-medium px-2.5 py-1.5 rounded-lg"
              style={{ color: "var(--accent)", background: "var(--accent-bg)" }}
            >
              Details
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Total",   value: fmtTL(feeToplam),   color: "#2563eb" },
              { label: "Paid",    value: fmtTL(feeOdenen),   color: "#15803d" },
              { label: "Pending", value: fmtTL(feeBekleyen), color: "#d97706" },
              { label: "Overdue", value: fmtTL(feeGecikmiş), color: "#dc2626" },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <p className="text-[18px] font-bold tabular-nums" style={{ color }}>{value}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>{label}</p>
              </div>
            ))}
          </div>
          {feeToplam > 0 && (
            <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.round((feeOdenen / feeToplam) * 100)}%`,
                  background: "linear-gradient(90deg, #15803d, #22c55e)",
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Content row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Müşteri RAG */}
        <div
          className="lg:col-span-3 rounded-xl overflow-hidden"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
        >
          <div
            className="px-5 py-3.5 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--border-2)" }}
          >
            <div>
              <h2 className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>Client Status</h2>
              <p className="text-[12px] mt-0.5" style={{ color: "var(--text-3)" }}>
                {clients?.length ?? 0} active clients
              </p>
            </div>
            <Link
              href="/dashboard/musteriler"
              className="text-[12px] font-medium px-2.5 py-1.5 rounded-lg transition-colors"
              style={{ color: "var(--accent)", background: "var(--accent-bg)" }}
            >
              All
            </Link>
          </div>

          <div className="divide-y max-h-[280px] overflow-auto" style={{ borderColor: "var(--border-2)" }}>
            {clientsWithRAG.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-[13px]" style={{ color: "var(--text-3)" }}>No clients yet</p>
                <Link href="/dashboard/musteriler/yeni"
                  className="text-[12px] mt-2 inline-block font-medium" style={{ color: "var(--accent)" }}>
                  Add client
                </Link>
              </div>
            ) : clientsWithRAG.map(client => {
              const cfg = RAG_CFG[client.rag];
              return (
                <Link
                  key={client.id}
                  href={`/dashboard/musteriler/${client.id}`}
                  className="px-5 py-2.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
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
                        {client.overdueCount} overdue
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
          style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--border-2)" }}>
            <h2 className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>This Week</h2>
            <p className="text-[12px] mt-0.5" style={{ color: "var(--text-3)" }}>
              {tasksDueWeek.length} tasks
            </p>
          </div>
          <div className="p-2 space-y-px max-h-[280px] overflow-auto">
            {tasksDueWeek.length === 0 ? (
              <p className="px-3 py-8 text-center text-[13px]" style={{ color: "var(--text-3)" }}>
                No tasks this week
              </p>
            ) : tasksDueWeek.map((task: any) => {
              const overdue   = isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));
              const todayTask = isToday(new Date(task.due_date));
              return (
                <div
                  key={task.id}
                  className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg hover:bg-slate-50/70 transition-colors"
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-[5px] shrink-0"
                    style={{ background: overdue ? "var(--red)" : todayTask ? "var(--amber)" : "var(--border)" }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium truncate" style={{ color: "var(--text-1)" }}>
                      {task.title}
                    </p>
                    {task.clients && (
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>
                        {(task.clients as any).full_name}
                      </p>
                    )}
                  </div>
                  <span
                    className="text-[11px] shrink-0 font-medium tabular-nums"
                    style={{ color: overdue ? "var(--red)" : todayTask ? "var(--amber)" : "var(--text-3)" }}
                  >
                    {format(new Date(task.due_date), "d MMM", { locale: enUS })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
