import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { format, isPast, isToday } from "date-fns";
import { tr } from "date-fns/locale";
import { ClipboardText, Plus } from "@phosphor-icons/react/dist/ssr";
import GorevTamamlaButton from "./GorevTamamlaButton";

const ONCELIK: Record<string, { label: string; bg: string; color: string; border: string }> = {
  critical: { label: "Kritik",  bg: "var(--red-bg)",   color: "var(--red)",   border: "var(--red-lt)"   },
  high:     { label: "Yüksek", bg: "#fff7ed",          color: "#ea580c",      border: "#fed7aa"          },
  normal:   { label: "Normal", bg: "var(--surface-2)", color: "var(--text-3)", border: "var(--border)"   },
  low:      { label: "Düşük",  bg: "var(--surface-2)", color: "var(--text-3)", border: "var(--border)"   },
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
            {geciken > 0 && <span style={{ color: "var(--red)" }}> · {geciken} gecikmiş</span>}
            {bugun > 0 && <span style={{ color: "var(--amber)" }}> · {bugun} bugün</span>}
          </p>
        </div>
        <Link
          href="/dashboard/gorevler/yeni"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-all active:scale-[0.98]"
          style={{ background: "var(--accent)", boxShadow: "0 2px 8px rgba(37,99,235,0.28)" }}
        >
          <Plus size={14} weight="bold" />
          Yeni Görev
        </Link>
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
      >
        {!tasks || tasks.length === 0 ? (
          <div className="py-16 text-center">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
            >
              <ClipboardText size={22} style={{ color: "var(--text-3)" }} weight="duotone" />
            </div>
            <p className="text-[13px] font-medium" style={{ color: "var(--text-1)" }}>Aktif görev yok</p>
            <p className="text-[12px] mt-1" style={{ color: "var(--text-3)" }}>Yeni görev ekleyerek takibi başlatın</p>
          </div>
        ) : (
          <table className="w-full">
            <thead style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
              <tr>
                {["Görev", "Müşteri", "Son Tarih", "Öncelik", ""].map((h, i) => (
                  <th
                    key={i}
                    className={`px-5 py-3 text-[11px] font-semibold uppercase tracking-wider ${i === 4 ? "text-right" : "text-left"}`}
                    style={{ color: "var(--text-3)", letterSpacing: "0.06em" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map((task: any, idx: number) => {
                const due     = new Date(task.due_date);
                const overdue = isPast(due) && !isToday(due);
                const todayT  = isToday(due);
                const onc     = ONCELIK[task.priority] ?? ONCELIK.normal;
                return (
                  <tr
                    key={task.id}
                    style={{
                      borderTop: idx > 0 ? "1px solid var(--border-2)" : "none",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{
                            background: overdue ? "var(--red)" : todayT ? "var(--amber)" : "var(--border)",
                          }}
                        />
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
                        <span
                          className="text-[13px] font-medium tabular-nums"
                          style={{ color: overdue ? "var(--red)" : todayT ? "var(--amber)" : "var(--text-2)" }}
                        >
                          {format(due, "d MMM yyyy", { locale: tr })}
                        </span>
                        {overdue && (
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{ background: "var(--red-bg)", color: "var(--red)" }}
                          >
                            Gecikti
                          </span>
                        )}
                        {todayT && (
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{ background: "var(--amber-bg)", color: "var(--amber)" }}
                          >
                            Bugün
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                        style={{ background: onc.bg, color: onc.color, border: `1px solid ${onc.border}` }}
                      >
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
