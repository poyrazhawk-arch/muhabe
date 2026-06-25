import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import Link from "next/link";
import BelgeIsteButton from "./BelgeIsteButton";
import { calculateRAG } from "@/lib/utils/rag";

const DOC_DURUM: Record<string, string> = {
  pending:  "Pending",
  received: "Received",
  approved: "Approved",
  rejected: "Rejected",
};
const DOC_STYLE: Record<string, React.CSSProperties> = {
  pending:  { background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" },
  received: { background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" },
  approved: { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" },
  rejected: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" },
};

const RAG_STYLE: Record<string, React.CSSProperties> = {
  red:   { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" },
  amber: { background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" },
  green: { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" },
};
const RAG_LABEL: Record<string, string> = { red: "Critical", amber: "At Risk", green: "Good" };

export default async function MusteriDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: accountant } = await supabase
    .from("accountants").select("id").eq("user_id", user!.id).single();

  const { data: client } = await supabase
    .from("clients").select("*, monthly_fee, portal_token").eq("id", id).eq("accountant_id", accountant!.id).single();
  if (!client) notFound();

  const [{ data: documents }, { data: tasks }, { data: tokens }, { data: fees }, { data: comms }] = await Promise.all([
    supabase.from("documents").select("*").eq("client_id", id).order("created_at", { ascending: false }),
    supabase.from("tasks").select("*").eq("client_id", id).neq("status", "completed").order("due_date"),
    supabase.from("upload_tokens").select("*").eq("client_id", id).eq("is_active", true)
      .order("created_at", { ascending: false }).limit(3),
    supabase.from("service_fees").select("*").eq("client_id", id).order("period_year", { ascending: false }).order("period_month", { ascending: false }).limit(12),
    supabase.from("client_comms").select("id, channel, subject, body, logged_at").eq("client_id", id).order("logged_at", { ascending: false }).limit(50),
  ]);

  const pendingDocs   = documents?.filter(d => d.status === "pending").length ?? 0;
  const overdueTasks  = tasks?.filter(t => new Date(t.due_date) < new Date()).length ?? 0;
  const rag           = calculateRAG(overdueTasks, pendingDocs, 0);

  return (
    <div className="space-y-5 max-w-3xl animate-fade-up">

      {/* Breadcrumb + Başlık */}
      <div>
        <Link href="/dashboard/musteriler" className="inline-flex items-center gap-1.5 text-[12px] font-medium mb-3 transition-opacity hover:opacity-70"
          style={{ color: "var(--text-3)" }}>
          <ArrowLeft size={12} weight="bold" />
          Clients
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-semibold" style={{ fontSize: "22px", letterSpacing: "-0.03em", lineHeight: 1.2, color: "var(--text-1)" }}>
              {client.full_name}
            </h1>
            {client.company_name && (
              <p className="text-[13px] mt-0.5" style={{ color: "var(--text-3)" }}>{client.company_name}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {client.portal_token && <PortalLinkButton portalToken={client.portal_token} />}
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg"
              style={RAG_STYLE[rag]}>
              {RAG_LABEL[rag]}
            </span>
          </div>
        </div>
      </div>

      {/* Bilgi kartları */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          client.email      && { label: "Email",    value: client.email },
          client.phone      && { label: "Phone",    value: client.phone },
          client.tax_number && { label: "Tax No.", value: client.tax_number },
          { label: "Status", value: client.status === "active" ? "Active" : "Inactive" },
        ].filter(Boolean).map((item: any) => (
          <div key={item.label} className="rounded-lg p-3"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <p className="text-[11px] font-medium" style={{ color: "var(--text-3)" }}>{item.label}</p>
            <p className="text-[12px] font-semibold mt-0.5 truncate" style={{ color: "var(--text-1)" }}>
              {item.value}
            </p>
          </div>
        ))}
        <div className="rounded-lg p-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-[11px] font-medium mb-1" style={{ color: "var(--text-3)" }}>Monthly fee</p>
          <MonthlyFeeEdit clientId={id} current={client.monthly_fee ?? null} />
        </div>
      </div>

      {/* Belge Talebi */}
      <div className="rounded-xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
        <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-2)" }}>
          <h2 className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>Document Request</h2>
          <BelgeIsteButton clientId={id} clientName={client.full_name} clientEmail={client.email ?? null} />
        </div>
        <div className="p-4">
          {tokens && tokens.length > 0 ? (
            <div className="space-y-2">
              {tokens.map((t: any) => {
                const expired = new Date(t.expires_at) < new Date();
                const url = `${process.env.NEXT_PUBLIC_APP_URL}/yukle?token=${t.token}`;
                return (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-lg"
                    style={{
                      background: expired ? "var(--bg)" : "var(--accent-bg)",
                      border: `1px solid ${expired ? "var(--border)" : "var(--border)"}`,
                      opacity: expired ? 0.6 : 1,
                    }}>
                    <div>
                      <p className="text-[12px] font-semibold" style={{ color: "var(--text-1)" }}>
                        {t.document_types.join(", ")}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>
                        {expired ? "Expired" : `Valid until ${format(new Date(t.expires_at), "d MMM HH:mm", { locale: enUS })}`}
                        {" · "}{t.used_count}/{t.max_uses} uses
                      </p>
                    </div>
                    {!expired && (
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <BelgeHatirlatmaButton tokenId={t.id} clientEmail={client.email} />
                        <CopyButton url={url} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[13px] text-center py-4" style={{ color: "var(--text-3)" }}>
              No document requests yet
            </p>
          )}
        </div>
      </div>

      {/* Belgeler */}
      <div className="rounded-xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
        <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--border-2)" }}>
          <h2 className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>
            Documents <span style={{ color: "var(--text-3)" }}>({documents?.length ?? 0})</span>
          </h2>
        </div>
        {!documents || documents.length === 0 ? (
          <p className="px-5 py-8 text-center text-[13px]" style={{ color: "var(--text-3)" }}>No documents yet</p>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border-2)" }}>
            {documents.map((doc) => (
              <div key={doc.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium" style={{ color: "var(--text-1)" }}>{doc.file_name}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>
                    {doc.document_type} · {format(new Date(doc.created_at), "d MMM yyyy", { locale: enUS })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                    style={DOC_STYLE[doc.status] ?? DOC_STYLE.pending}>
                    {DOC_DURUM[doc.status]}
                  </span>
                  <a href={`/api/belgeler/indir/${doc.id}`} target="_blank" rel="noopener noreferrer"
                    className="text-[12px] font-medium px-2.5 py-1 rounded-lg transition-colors"
                    style={{ color: "var(--accent)", background: "var(--accent-bg)" }}>
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hizmet Bedelleri */}
      <div className="rounded-xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
        <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-2)" }}>
          <h2 className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>
            Service Fees <span style={{ color: "var(--text-3)" }}>({fees?.length ?? 0})</span>
          </h2>
          <Link href="/dashboard/finans" className="text-[12px] font-medium px-2.5 py-1.5 rounded-lg"
            style={{ color: "var(--accent)", background: "var(--accent-bg)" }}>
            Finance
          </Link>
        </div>
        {!fees || fees.length === 0 ? (
          <p className="px-5 py-8 text-center text-[13px]" style={{ color: "var(--text-3)" }}>
            No service fees added for this client yet
          </p>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border-2)" }}>
            {fees.map((fee: any) => {
              const STATUS_STYLE: Record<string, React.CSSProperties> = {
                pending: { background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" },
                paid:    { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" },
                overdue: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" },
              };
              const STATUS_LABEL: Record<string, string> = { pending: "Pending", paid: "Paid", overdue: "Overdue" };
              const ay = format(new Date(fee.period_year, fee.period_month - 1, 1), "MMMM yyyy", { locale: enUS });
              return (
                <div key={fee.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium" style={{ color: "var(--text-1)" }}>{ay}</p>
                    {fee.notes && <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>{fee.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[13px] font-semibold tabular-nums" style={{ color: "var(--text-1)" }}>
                      {Number(fee.amount).toLocaleString("en-GB", { style: "currency", currency: "GBP" })}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                      style={STATUS_STYLE[fee.status] ?? STATUS_STYLE.pending}>
                      {STATUS_LABEL[fee.status] ?? "Pending"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* İletişim Logu */}
      <CommsLog clientId={id} initial={comms ?? []} />

      {/* Görevler */}
      <div className="rounded-xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
        <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--border-2)" }}>
          <h2 className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>
            Active Tasks <span style={{ color: "var(--text-3)" }}>({tasks?.length ?? 0})</span>
          </h2>
        </div>
        {!tasks || tasks.length === 0 ? (
          <p className="px-5 py-8 text-center text-[13px]" style={{ color: "var(--text-3)" }}>No active tasks</p>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border-2)" }}>
            {tasks.map((task) => {
              const overdue = new Date(task.due_date) < new Date();
              return (
                <div key={task.id} className="px-5 py-3 flex items-center justify-between">
                  <p className="text-[13px] font-medium" style={{ color: "var(--text-1)" }}>{task.title}</p>
                  <span className="text-[12px] font-medium tabular-nums"
                    style={{ color: overdue ? "#dc2626" : "var(--text-3)" }}>
                    {format(new Date(task.due_date), "d MMM yyyy", { locale: enUS })}
                    {overdue && " · Overdue"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Client components
import CopyButton from "./CopyButton";
import MonthlyFeeEdit from "./MonthlyFeeEdit";
import PortalLinkButton from "./PortalLinkButton";
import BelgeHatirlatmaButton from "./BelgeHatirlatmaButton";
import CommsLog from "./CommsLog";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
