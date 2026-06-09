import { createClient } from "@/lib/supabase/server";
import { calculateRAG } from "@/lib/utils/rag";
import { format, isToday, isThisWeek, isPast } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";

const RAG: Record<string, { label: string; color: string; bg: string; ring: string }> = {
  red:   { label: "Kritik",  color: "#dc2626", bg: "#fef2f2", ring: "#fecaca" },
  amber: { label: "Dikkat",  color: "#d97706", bg: "#fffbeb", ring: "#fde68a" },
  green: { label: "Tamam",   color: "#16a34a", bg: "#f0fdf4", ring: "#bbf7d0" },
};

const STATS = [
  { key: "clients",  label: "Aktif Müşteri",   color: "#2563eb", bg: "#eff6ff",
    path: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { key: "today",    label: "Bugün Yapılacak", color: "#d97706", bg: "#fffbeb",
    path: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { key: "overdue",  label: "Geciken Görev",   color: "#dc2626", bg: "#fef2f2",
    path: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { key: "docs",     label: "Bekleyen Belge",  color: "#7c3aed", bg: "#f5f3ff",
    path: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: accountant } = await supabase
    .from("accountants").select("id, full_name").eq("user_id", user!.id).single();
  if (!accountant) return <div>Hesap bulunamadı.</div>;

  const [{ data: clients }, { data: allTasks }, { data: pendingDocs }] = await Promise.all([
    supabase.from("clients").select("id, full_name, company_name").eq("accountant_id", accountant.id).eq("status", "active").order("full_name"),
    supabase.from("tasks").select("id, title, due_date, status, priority, client_id, clients(full_name)").eq("accountant_id", accountant.id).neq("status", "completed").neq("status", "cancelled").order("due_date"),
    supabase.from("documents").select("id, client_id").eq("accountant_id", accountant.id).eq("status", "pending"),
  ]);

  const today = new Date();
  const tasksDueToday = allTasks?.filter(t => isToday(new Date(t.due_date))) ?? [];
  const tasksDueWeek  = allTasks?.filter(t => isThisWeek(new Date(t.due_date), { weekStartsOn: 1 })) ?? [];
  const overdueTasks  = allTasks?.filter(t => isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date))) ?? [];

  const clientsWithRAG = (clients ?? []).map(c => {
    const pendingCount = pendingDocs?.filter(d => d.client_id === c.id).length ?? 0;
    const overdueCount = overdueTasks.filter(t => t.client_id === c.id).length;
    const dueSoonCount = tasksDueWeek.filter(t => t.client_id === c.id).length;
    return { ...c, rag: calculateRAG(overdueCount, pendingCount, dueSoonCount), overdueCount, pendingCount };
  }).sort((a, b) => ({ red: 0, amber: 1, green: 2 }[a.rag] - { red: 0, amber: 1, green: 2 }[b.rag]));

  const stats = {
    clients: clients?.length ?? 0,
    today:   tasksDueToday.length,
    overdue: overdueTasks.length,
    docs:    pendingDocs?.length ?? 0,
  };

  const hour = today.getHours();
  const greeting = hour < 12 ? "Günaydın" : hour < 18 ? "İyi günler" : "İyi akşamlar";
  const firstName = accountant.full_name?.split(" ")[0] ?? "";

  return (
    <div className="space-y-6 animate-fade-up">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-medium" style={{ color: "var(--text-3)" }}>
            {format(today, "d MMMM yyyy, EEEE", { locale: tr })}
          </p>
          <h1 className="text-xl font-semibold mt-0.5 tracking-tight" style={{ color: "var(--text-1)" }}>
            {greeting}, {firstName}
          </h1>
        </div>
        <Link
          href="/dashboard/gorevler/yeni"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-all active:scale-[0.98]"
          style={{ background: "var(--accent)", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
          </svg>
          Yeni Görev
        </Link>
      </div>

      {/* Stat kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map(({ key, label, color, bg, path }) => (
          <div
            key={key}
            className="rounded-xl p-4 transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                <svg className="w-4 h-4" style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={path}/>
                </svg>
              </div>
              {key === "overdue" && stats.overdue > 0 && (
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: "#fef2f2", color: "#dc2626" }}>
                  {stats.overdue}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-1)" }}>
              {stats[key as keyof typeof stats]}
            </p>
            <p className="text-[12px] mt-0.5 font-medium" style={{ color: "var(--text-3)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Alt panel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Müşteri RAG */}
        <div className="lg:col-span-3 rounded-xl overflow-hidden"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
          <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-2)" }}>
            <div>
              <h2 className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>Müşteri Durumu</h2>
              <p className="text-[12px] mt-0.5" style={{ color: "var(--text-3)" }}>{clients?.length ?? 0} aktif</p>
            </div>
            <Link href="/dashboard/musteriler"
              className="text-[12px] font-medium px-2.5 py-1.5 rounded-lg transition-colors hover:bg-blue-50"
              style={{ color: "var(--accent)" }}>
              Tümü
            </Link>
          </div>

          <div className="divide-y max-h-64 overflow-auto" style={{ borderColor: "var(--border-2)" }}>
            {clientsWithRAG.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-[13px]" style={{ color: "var(--text-3)" }}>Henüz müşteri eklenmemiş</p>
                <Link href="/dashboard/musteriler/yeni"
                  className="text-[12px] mt-2 inline-block font-medium" style={{ color: "var(--accent)" }}>
                  Müşteri ekle
                </Link>
              </div>
            ) : clientsWithRAG.map(client => {
              const cfg = RAG[client.rag];
              return (
                <Link key={client.id} href={`/dashboard/musteriler/${client.id}`}
                  className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
                      style={{ background: "#f1f5f9", color: "#475569" }}>
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
                      <span className="text-[11px] font-medium" style={{ color: "#ef4444" }}>
                        {client.overdueCount} geciken
                      </span>
                    )}
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.ring}` }}>
                      {cfg.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bu hafta görevler */}
        <div className="lg:col-span-2 rounded-xl overflow-hidden"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
          <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--border-2)" }}>
            <h2 className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>Bu Hafta</h2>
            <p className="text-[12px] mt-0.5" style={{ color: "var(--text-3)" }}>{tasksDueWeek.length} görev</p>
          </div>
          <div className="p-2 space-y-0.5 max-h-64 overflow-auto">
            {tasksDueWeek.length === 0 ? (
              <p className="px-3 py-8 text-center text-[13px]" style={{ color: "var(--text-3)" }}>
                Bu hafta görev yok
              </p>
            ) : tasksDueWeek.map((task: any) => {
              const overdue  = isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));
              const todayT   = isToday(new Date(task.due_date));
              const dotColor = overdue ? "#ef4444" : todayT ? "#f59e0b" : "#d1d5db";
              const dateColor = overdue ? "#ef4444" : todayT ? "#d97706" : "var(--text-3)";
              return (
                <div key={task.id}
                  className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-default">
                  <div className="w-1.5 h-1.5 rounded-full mt-[5px] shrink-0" style={{ background: dotColor }} />
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
                  <span className="text-[11px] shrink-0 font-medium tabular-nums" style={{ color: dateColor }}>
                    {format(new Date(task.due_date), "d MMM", { locale: tr })}
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
