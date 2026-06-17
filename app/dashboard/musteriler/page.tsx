import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import BroadcastModal from "./BroadcastModal";
import { calculateRAG, RAG_LABELS } from "@/lib/utils/rag";
import type { RAGStatus } from "@/types";
import { isToday, isThisWeek, isPast } from "date-fns";

const RAG_CFG: Record<RAGStatus, { bg: string; color: string; border: string }> = {
  red:   { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  amber: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  green: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
};

export default async function MusterilerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: accountant } = await supabase
    .from("accountants").select("id").eq("user_id", user!.id).single();

  const [{ data: clients }, { data: allTasks }, { data: pendingDocs }] = await Promise.all([
    supabase.from("clients").select("*").eq("accountant_id", accountant!.id)
      .neq("status", "archived").order("full_name"),
    supabase.from("tasks").select("id, due_date, client_id")
      .eq("accountant_id", accountant!.id)
      .neq("status", "completed").neq("status", "cancelled"),
    supabase.from("documents").select("id, client_id")
      .eq("accountant_id", accountant!.id).eq("status", "pending"),
  ]);

  const overdueTasks = allTasks?.filter(t => isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date))) ?? [];
  const tasksDueWeek  = allTasks?.filter(t => isThisWeek(new Date(t.due_date), { weekStartsOn: 1 })) ?? [];

  const clientsWithRAG = (clients ?? []).map(c => {
    const pendingCount = pendingDocs?.filter(d => d.client_id === c.id).length ?? 0;
    const overdueCount = overdueTasks.filter(t => t.client_id === c.id).length;
    const dueSoonCount = tasksDueWeek.filter(t => t.client_id === c.id).length;
    return { ...c, rag: calculateRAG(overdueCount, pendingCount, dueSoonCount) };
  });

  const aktif = clients?.filter(c => c.status === "active").length ?? 0;
  const pasif  = clients?.filter(c => c.status === "passive").length ?? 0;

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-1)" }}>Clients</h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--text-3)" }}>
            {aktif} active{pasif > 0 ? ` · ${pasif} passive` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BroadcastModal clients={(clients ?? []).map(c => ({ id: c.id, full_name: c.full_name, email: c.email }))} />
          <Link href="/dashboard/musteriler/yeni"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-all active:scale-[0.98]"
            style={{ background: "var(--accent)", boxShadow: "0 2px 8px rgba(37,99,235,0.28)" }}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
            </svg>
            New Client
          </Link>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>

        {!clients || clients.length === 0 ? (
          <div className="py-20 text-center">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "var(--surface-3)", border: "1px solid var(--border)" }}
            >
              <svg className="w-5 h-5" style={{ color: "var(--text-3)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <p className="text-[13px] font-semibold mb-1" style={{ color: "var(--text-1)" }}>No clients yet</p>
            <p className="text-[12px] mb-5" style={{ color: "var(--text-3)" }}>Add your first client to get started</p>
            <Link href="/dashboard/musteriler/yeni"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-white"
              style={{ background: "var(--accent)", boxShadow: "0 2px 8px rgba(37,99,235,0.28)" }}>
              Add client
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead style={{ borderBottom: "1px solid var(--border)" }}>
              <tr style={{ background: "var(--surface-2)" }}>
                {["Client", "Company", "Contact", "Status", "RAG", ""].map((h, i) => (
                  <th key={i}
                    className={`px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.07em] ${i === 5 ? "text-right" : "text-left"}`}
                    style={{ color: "var(--text-3)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clientsWithRAG.map((client, idx) => (
                <tr key={client.id}
                  className="group transition-colors"
                  style={{
                    borderTop: "1px solid var(--border-2)",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0"
                        style={{
                          background: "var(--accent-bg)",
                          color: "var(--accent)",
                          border: "1px solid var(--accent-lt)",
                        }}
                      >
                        {client.full_name.charAt(0)}
                      </div>
                      <span className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>
                        {client.full_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[13px]" style={{ color: "var(--text-2)" }}>
                    {client.company_name ?? <span style={{ color: "var(--text-3)" }}>—</span>}
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-[13px]" style={{ color: "var(--text-2)" }}>{client.email ?? "—"}</p>
                    {client.phone && (
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>{client.phone}</p>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: client.status === "active" ? "var(--green)" : "var(--text-3)" }}
                      />
                      <span className="text-[12px] font-medium" style={{ color: client.status === "active" ? "var(--green)" : "var(--text-3)" }}>
                        {client.status === "active" ? "Active" : "Passive"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {(() => {
                      const rag = client.rag as RAGStatus;
                      const dot = RAG_CFG[rag];
                      return (
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: dot.color }} />
                          <span className="text-[12px] font-medium" style={{ color: dot.color }}>
                            {RAG_LABELS[rag]}
                          </span>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/dashboard/musteriler/${client.id}`}
                      className="inline-flex items-center gap-1 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      style={{ color: "var(--accent)", background: "var(--accent-bg)" }}>
                      View
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
