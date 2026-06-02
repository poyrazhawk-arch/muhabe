import { createClient } from "@/lib/supabase/server";
import { calculateRAG } from "@/lib/utils/rag";
import { format, isToday, isThisWeek, isPast } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";

const RAG_CONFIG = {
  red:   { label: "Kritik",  bg: "#fef2f2", text: "#dc2626", dot: "#ef4444", border: "#fecaca" },
  amber: { label: "Dikkat",  bg: "#fffbeb", text: "#d97706", dot: "#f59e0b", border: "#fde68a" },
  green: { label: "İyi",     bg: "#f0fdf4", text: "#16a34a", dot: "#22c55e", border: "#bbf7d0" },
};

const STAT_CONFIG = [
  { key: "clients",  label: "Aktif Müşteri",  icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", color: "#3b82f6", bg: "#eff6ff" },
  { key: "today",    label: "Bugün",          icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", color: "#f59e0b", bg: "#fffbeb" },
  { key: "overdue",  label: "Geciken",        icon: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "#ef4444", bg: "#fef2f2" },
  { key: "docs",     label: "Bekleyen Belge", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "#8b5cf6", bg: "#f5f3ff" },
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
  const tasksDueToday   = allTasks?.filter(t => isToday(new Date(t.due_date))) ?? [];
  const tasksDueWeek    = allTasks?.filter(t => isThisWeek(new Date(t.due_date), { weekStartsOn: 1 })) ?? [];
  const overdueTasks    = allTasks?.filter(t => isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date))) ?? [];

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

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: "#94a3b8" }}>
            {format(today, "d MMMM yyyy, EEEE", { locale: tr })}
          </p>
          <h1 className="text-2xl font-bold mt-0.5" style={{ color: "#0f172a" }}>
            {greeting}, {accountant.full_name?.split(" ")[0]} 👋
          </h1>
        </div>
        <Link href="/dashboard/gorevler/yeni"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: "linear-gradient(135deg,#3b82f6,#2563eb)", boxShadow: "0 4px 14px rgba(59,130,246,0.35)" }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          Yeni Görev
        </Link>
      </div>

      {/* Stat kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CONFIG.map(({ key, label, icon, color, bg }) => (
          <div key={key} className="rounded-2xl p-5 transition-all hover:-translate-y-0.5"
            style={{ background: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <svg className="w-5 h-5" style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon}/>
                </svg>
              </div>
              {key === "overdue" && stats.overdue > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#fef2f2", color: "#dc2626" }}>!</span>
              )}
            </div>
            <p className="text-3xl font-bold" style={{ color: "#0f172a" }}>{stats[key as keyof typeof stats]}</p>
            <p className="text-xs mt-1 font-medium" style={{ color: "#94a3b8" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Alt panel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Müşteri RAG — geniş */}
        <div className="lg:col-span-3 rounded-2xl overflow-hidden"
          style={{ background: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #f8fafc" }}>
            <div>
              <h2 className="font-semibold text-sm" style={{ color: "#0f172a" }}>Müşteri Durumu</h2>
              <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>{clients?.length ?? 0} aktif müşteri</p>
            </div>
            <Link href="/dashboard/musteriler" className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: "#3b82f6", background: "#eff6ff" }}>
              Tümünü gör →
            </Link>
          </div>
          <div className="divide-y max-h-72 overflow-auto" style={{ borderColor: "#f8fafc" }}>
            {clientsWithRAG.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm" style={{ color: "#94a3b8" }}>Henüz müşteri eklenmemiş</p>
                <Link href="/dashboard/musteriler/yeni" className="text-xs mt-2 inline-block font-medium" style={{ color: "#3b82f6" }}>
                  İlk müşteriyi ekle →
                </Link>
              </div>
            ) : clientsWithRAG.map(client => {
              const cfg = RAG_CONFIG[client.rag];
              return (
                <Link key={client.id} href={`/dashboard/musteriler/${client.id}`}
                  className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors block">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                      style={{ background: "#f1f5f9", color: "#475569" }}>
                      {client.full_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#0f172a" }}>{client.full_name}</p>
                      {client.company_name && <p className="text-xs truncate" style={{ color: "#94a3b8" }}>{client.company_name}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {client.overdueCount > 0 && (
                      <span className="text-xs" style={{ color: "#ef4444" }}>{client.overdueCount} geciken</span>
                    )}
                    <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                      {cfg.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bu hafta görevler — dar */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden"
          style={{ background: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid #f8fafc" }}>
            <h2 className="font-semibold text-sm" style={{ color: "#0f172a" }}>Bu Hafta</h2>
            <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>{tasksDueWeek.length} görev</p>
          </div>
          <div className="p-3 space-y-1 max-h-72 overflow-auto">
            {tasksDueWeek.length === 0 ? (
              <p className="px-2 py-8 text-center text-sm" style={{ color: "#94a3b8" }}>Bu hafta görev yok 🎉</p>
            ) : tasksDueWeek.map((task: any) => {
              const overdue = isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));
              const todayTask = isToday(new Date(task.due_date));
              return (
                <div key={task.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                    style={{ background: overdue ? "#ef4444" : todayTask ? "#f59e0b" : "#e2e8f0" }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" style={{ color: "#0f172a" }}>{task.title}</p>
                    {task.clients && <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>{(task.clients as any).full_name}</p>}
                  </div>
                  <span className="text-xs shrink-0 font-medium"
                    style={{ color: overdue ? "#ef4444" : todayTask ? "#f59e0b" : "#94a3b8" }}>
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
