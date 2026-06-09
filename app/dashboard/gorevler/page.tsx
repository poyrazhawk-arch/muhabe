import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { format, isPast, isToday } from "date-fns";
import { tr } from "date-fns/locale";
import GorevTamamlaButton from "./GorevTamamlaButton";

const ONCELIK: Record<string, { label: string; bg: string; color: string; border: string }> = {
  critical: { label: "Kritik",  bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  high:     { label: "Yüksek", bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" },
  normal:   { label: "Normal", bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" },
  low:      { label: "Düşük",  bg: "#f8fafc", color: "#94a3b8", border: "#e2e8f0" },
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
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-1)" }}>Görevler</h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--text-3)" }}>
            {tasks?.length ?? 0} aktif
            {geciken > 0 && <span style={{ color: "#ef4444" }}> · {geciken} gecikmiş</span>}
            {bugun > 0 && <span style={{ color: "#d97706" }}> · {bugun} bugün</span>}
          </p>
        </div>
        <Link href="/dashboard/gorevler/yeni"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-all active:scale-[0.98]"
          style={{ background: "var(--accent)", boxShadow: "0 2px 8px rgba(37,99,235,0.28)" }}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
          </svg>
          Yeni Görev
        </Link>
      </div>

      <div className="rounded-xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
        {!tasks || tasks.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: "#f1f5f9" }}>
              <svg className="w-5 h-5" style={{ color: "var(--text-3)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
            </div>
            <p className="text-[13px] font-medium" style={{ color: "var(--text-1)" }}>Aktif görev yok</p>
            <p className="text-[12px] mt-1" style={{ color: "var(--text-3)" }}>Yeni görev ekleyerek takibi başlatın</p>
          </div>
        ) : (
          <table className="w-full">
            <thead style={{ background: "#fafbfc", borderBottom: "1px solid var(--border)" }}>
              <tr>
                {["Görev", "Müşteri", "Son Tarih", "Öncelik", ""].map((h, i) => (
                  <th key={i}
                    className={`px-5 py-3 text-[11px] font-semibold uppercase tracking-wider ${i === 4 ? "text-right" : "text-left"}`}
                    style={{ color: "var(--text-3)", letterSpacing: "0.06em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map((task: any, idx: number) => {
                const due      = new Date(task.due_date);
                const overdue  = isPast(due) && !isToday(due);
                const todayT   = isToday(due);
                const onc      = ONCELIK[task.priority] ?? ONCELIK.normal;
                return (
                  <tr key={task.id}
                    className="transition-colors hover:bg-slate-50/60"
                    style={{ borderTop: idx > 0 ? "1px solid var(--border-2)" : "none" }}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: overdue ? "#ef4444" : todayT ? "#f59e0b" : "#d1d5db" }} />
                        <span className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>
                          {task.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[13px]" style={{ color: "var(--text-2)" }}>
                      {task.clients ? (task.clients as any).full_name : "-"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-medium tabular-nums"
                          style={{ color: overdue ? "#dc2626" : todayT ? "#d97706" : "var(--text-2)" }}>
                          {format(due, "d MMM yyyy", { locale: tr })}
                        </span>
                        {overdue && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{ background: "#fef2f2", color: "#dc2626" }}>Gecikti</span>
                        )}
                        {todayT && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{ background: "#fffbeb", color: "#d97706" }}>Bugün</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                        style={{ background: onc.bg, color: onc.color, border: `1px solid ${onc.border}` }}>
                        {onc.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
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
