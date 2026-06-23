import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { format, isPast, isToday } from "date-fns";
import { enUS } from "date-fns/locale";

const DOC_STATUS: Record<string, { label: string; bg: string; color: string; border: string }> = {
  pending:  { label: "Pending",  bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  received: { label: "Received", bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  approved: { label: "Approved", bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  rejected: { label: "Rejected", bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
};

export default async function ClientPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase  = await createServiceClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, full_name, company_name, accountants(full_name, email)")
    .eq("portal_token", token)
    .eq("status", "active")
    .single();

  if (!client) notFound();

  const [{ data: documents }, { data: tasks }] = await Promise.all([
    supabase.from("documents")
      .select("id, file_name, document_type, status, created_at")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false }),
    supabase.from("tasks")
      .select("id, title, due_date, status, priority")
      .eq("client_id", client.id)
      .neq("status", "completed")
      .neq("status", "cancelled")
      .order("due_date"),
  ]);

  const accountant = client.accountants as any;
  const overdueTasks  = tasks?.filter(t => isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date))) ?? [];

  return (
    <div style={{ minHeight: "100dvh", background: "#f8fafc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ background: "#0c1524", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, background: "#2563eb", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>L</span>
            </div>
            <span style={{ color: "#93c5fd", fontSize: 13, fontWeight: 600 }}>Ledger</span>
          </div>
          {accountant?.email && (
            <a href={`mailto:${accountant.email}`}
              style={{ color: "#4b80b8", fontSize: 12, textDecoration: "none" }}>
              Contact accountant
            </a>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px" }}>

        {/* Welcome */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: "0 0 4px", letterSpacing: "-0.03em" }}>
            {client.full_name}
          </h1>
          {client.company_name && (
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>{client.company_name}</p>
          )}
          {accountant?.full_name && (
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "#6b7280" }}>
              Accountant: <strong style={{ color: "#374151" }}>{accountant.full_name}</strong>
            </p>
          )}
        </div>

        {/* Alert strip — overdue tasks */}
        {overdueTasks.length > 0 && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10,
            padding: "12px 16px", marginBottom: 20,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#dc2626", flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: 13, color: "#b91c1c", fontWeight: 500 }}>
              {overdueTasks.length} overdue item{overdueTasks.length > 1 ? "s" : ""} — please contact your accountant.
            </p>
          </div>
        )}

        {/* Documents */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: 16 }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6" }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111827" }}>
              Documents
              <span style={{ marginLeft: 8, fontSize: 12, color: "#9ca3af", fontWeight: 400 }}>
                ({documents?.length ?? 0})
              </span>
            </h2>
          </div>
          {!documents?.length ? (
            <p style={{ margin: 0, padding: "24px 20px", fontSize: 13, color: "#9ca3af", textAlign: "center" }}>
              No documents yet
            </p>
          ) : documents.map((doc, i) => {
            const st = DOC_STATUS[doc.status] ?? DOC_STATUS.pending;
            return (
              <div key={doc.id} style={{
                padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
                borderTop: i > 0 ? "1px solid #f3f4f6" : "none",
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "#1f2937" }}>{doc.file_name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9ca3af" }}>
                    {doc.document_type} · {format(new Date(doc.created_at), "d MMM yyyy", { locale: enUS })}
                  </p>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6,
                  background: st.bg, color: st.color, border: `1px solid ${st.border}`,
                }}>
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Active tasks */}
        {tasks && tasks.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6" }}>
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111827" }}>
                Open items
                <span style={{ marginLeft: 8, fontSize: 12, color: "#9ca3af", fontWeight: 400 }}>
                  ({tasks.length})
                </span>
              </h2>
            </div>
            {tasks.map((task, i) => {
              const overdue = isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));
              const today   = isToday(new Date(task.due_date));
              return (
                <div key={task.id} style={{
                  padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
                  borderTop: i > 0 ? "1px solid #f3f4f6" : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                      background: overdue ? "#dc2626" : today ? "#f59e0b" : "#d1d5db",
                    }} />
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "#1f2937" }}>{task.title}</p>
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 500,
                    color: overdue ? "#dc2626" : today ? "#d97706" : "#9ca3af",
                  }}>
                    {format(new Date(task.due_date), "d MMM", { locale: enUS })}
                    {overdue && " · Overdue"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <p style={{ marginTop: 32, fontSize: 11, color: "#d1d5db", textAlign: "center" }}>
          This is a read-only view. Contact your accountant for changes.
        </p>
      </div>
    </div>
  );
}
