import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { format, isPast, isToday } from "date-fns";
import { tr } from "date-fns/locale";
import GorevTamamlaButton from "./GorevTamamlaButton";

const ONCELIK: Record<string, { label: string; bg: string; text: string; border: string }> = {
  critical: { label: "Kritik",  bg: "#fef2f2", text: "#dc2626", border: "#fecaca" },
  high:     { label: "Yüksek", bg: "#fff7ed", text: "#ea580c", border: "#fed7aa" },
  normal:   { label: "Normal", bg: "#f8fafc", text: "#64748b", border: "#e2e8f0" },
  low:      { label: "Düşük",  bg: "#f8fafc", text: "#94a3b8", border: "#e2e8f0" },
};

export default async function GorevlerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: accountant } = await supabase
    .from("accountants").select("id").eq("user_id", user!.id).single();

  const { data: tasks } = await supabase
    .from("tasks").select("*, clients(full_name)")
    .eq("accountant_id", accountant!.id)
    .neq("status", "completed").neq("status", "cancelled")
    .order("due_date");

  const geciken = tasks?.filter(t => isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date))).length ?? 0;
  const bugun   = tasks?.filter(t => isToday(new Date(t.due_date))).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>Görevler</h1>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
            {tasks?.length ?? 0} aktif
            {geciken > 0 && <span style={{ color: "#ef4444" }}> · {geciken} gecikmiş</span>}
            {bugun > 0 && <span style={{ color: "#f59e0b" }}> · {bugun} bugün</span>}
          </p>
        </div>
        <Link href="/dashboard/gorevler/yeni"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#3b82f6,#2563eb)", boxShadow: "0 4px 14px rgba(59,130,246,0.35)" }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          Yeni Görev
        </Link>
      </div>

      <div className="rounded-2xl overflow-hidden"
        style={{ background: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        {!tasks || tasks.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#f1f5f9" }}>
              <svg className="w-7 h-7" style={{ color: "#94a3b8" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: "#0f172a" }}>Aktif görev yok 🎉</p>
            <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>Yeni görev ekleyerek takibi başlatın</p>
          </div>
        ) : (
          <table className="w-full">
            <thead style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
              <tr>
                {["Görev", "Müşteri", "Son Tarih", "Öncelik", ""].map((h, i) => (
                  <th key={i} className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wide ${i === 4 ? "text-right" : "text-left"}`}
                    style={{ color: "#94a3b8" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map((task: any, idx: number) => {
                const due = new Date(task.due_date);
                const overdue = isPast(due) && !isToday(due);
                const todayTask = isToday(due);
                const onc = ONCELIK[task.priority] ?? ONCELIK.normal;
                return (
                  <tr key={task.id} style={{ borderTop: idx > 0 ? "1px solid #f8fafc" : "none" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: overdue ? "#ef4444" : todayTask ? "#f59e0b" : "#e2e8f0" }} />
                        <span className="text-sm font-semibold" style={{ color: "#0f172a" }}>{task.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "#64748b" }}>
                      {task.clients ? (task.clients as any).full_name : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-semibold"
                        style={{ color: overdue ? "#dc2626" : todayTask ? "#d97706" : "#64748b" }}>
                        {format(due, "d MMM yyyy", { locale: tr })}
                      </span>
                      {overdue && (
                        <span className="ml-2 text-xs font-semibold px-1.5 py-0.5 rounded"
                          style={{ background: "#fef2f2", color: "#dc2626" }}>Gecikti</span>
                      )}
                      {todayTask && (
                        <span className="ml-2 text-xs font-semibold px-1.5 py-0.5 rounded"
                          style={{ background: "#fffbeb", color: "#d97706" }}>Bugün</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: onc.bg, color: onc.text, border: `1px solid ${onc.border}` }}>
                        {onc.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
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
