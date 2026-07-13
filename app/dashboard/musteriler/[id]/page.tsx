import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { enUS, tr } from "date-fns/locale";
import Link from "next/link";
import BelgeIsteButton from "./BelgeIsteButton";
import { calculateRAG } from "@/lib/utils/rag";
import { getLocale, isTurkey } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n/dictionaries";
import { formatMoney } from "@/lib/utils/currency";

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

export default async function MusteriDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale = await getLocale();
  const showGib = await isTurkey();
  const t = getDict(locale).musteriler;
  const dfLocale = locale === "tr" ? tr : enUS;
  const DOC_DURUM: Record<string, string> = {
    pending:  t.docPending,
    received: t.docReceived,
    approved: t.docApproved,
    rejected: t.docRejected,
  };
  const RAG_LABEL: Record<string, string> = { red: t.ragCritical, amber: t.ragAtRisk, green: t.ragGood };
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
          {t.backToClients}
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
          client.email      && { label: t.email,    value: client.email },
          client.phone      && { label: t.phone,    value: client.phone },
          client.tax_number && { label: t.taxNoLabel, value: client.tax_number },
          { label: t.statusLabel, value: client.status === "active" ? t.statusActiveLong : t.statusInactiveLong },
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
          <p className="text-[11px] font-medium mb-1" style={{ color: "var(--text-3)" }}>{t.monthlyFee}</p>
          <MonthlyFeeEdit clientId={id} current={client.monthly_fee ?? null} />
        </div>
      </div>

      {/* GİB Bilgileri — yalnızca Türkiye konumlu kullanıcılara */}
      {showGib && (
        <GibCard
          clientId={id}
          taxNumber={client.tax_number ?? null}
          taxOffice={client.tax_office ?? null}
          eInvoiceStatus={client.e_invoice_status ?? "unknown"}
          gibDebt={client.gib_debt != null ? Number(client.gib_debt) : null}
          gibDebtCheckedAt={client.gib_debt_checked_at ?? null}
        />
      )}

      {/* Belge Talebi */}
      <div className="rounded-xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
        <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-2)" }}>
          <h2 className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>{t.documentRequest}</h2>
          <BelgeIsteButton clientId={id} clientName={client.full_name} clientEmail={client.email ?? null} />
        </div>
        <div className="p-4">
          {tokens && tokens.length > 0 ? (
            <div className="space-y-2">
              {tokens.map((tok: any) => {
                const expired = new Date(tok.expires_at) < new Date();
                const url = `${process.env.NEXT_PUBLIC_APP_URL}/yukle?token=${tok.token}`;
                return (
                  <div key={tok.id} className="flex items-center justify-between p-3 rounded-lg"
                    style={{
                      background: expired ? "var(--bg)" : "var(--accent-bg)",
                      border: `1px solid ${expired ? "var(--border)" : "var(--border)"}`,
                      opacity: expired ? 0.6 : 1,
                    }}>
                    <div>
                      <p className="text-[12px] font-semibold" style={{ color: "var(--text-1)" }}>
                        {tok.document_types.join(", ")}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>
                        {expired ? t.expired : t.validUntil.replace("{date}", format(new Date(tok.expires_at), "d MMM HH:mm", { locale: dfLocale }))}
                        {" · "}{tok.used_count}/{tok.max_uses} {t.uses}
                      </p>
                    </div>
                    {!expired && (
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <WhatsAppLink
                          phone={client.phone}
                          message={`Merhaba ${client.full_name}, beyanname hazırlığı için belgelerinizi bekliyorum (${tok.document_types.join(", ")}). Şu bağlantıdan birkaç dakikada yükleyebilirsiniz: ${url}`}
                        />
                        <BelgeHatirlatmaButton tokenId={tok.id} clientEmail={client.email} />
                        <CopyButton url={url} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[13px] text-center py-4" style={{ color: "var(--text-3)" }}>
              {t.noDocumentRequestsYet}
            </p>
          )}
        </div>
      </div>

      {/* Belgeler */}
      <div className="rounded-xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
        <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--border-2)" }}>
          <h2 className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>
            {t.documents} <span style={{ color: "var(--text-3)" }}>({documents?.length ?? 0})</span>
          </h2>
        </div>
        {!documents || documents.length === 0 ? (
          <p className="px-5 py-8 text-center text-[13px]" style={{ color: "var(--text-3)" }}>{t.noDocumentsYet}</p>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border-2)" }}>
            {documents.map((doc) => (
              <div key={doc.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium" style={{ color: "var(--text-1)" }}>{doc.file_name}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>
                    {doc.document_type} · {format(new Date(doc.created_at), "d MMM yyyy", { locale: dfLocale })}
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
                    {t.download}
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
            {t.serviceFees} <span style={{ color: "var(--text-3)" }}>({fees?.length ?? 0})</span>
          </h2>
          <Link href="/dashboard/finans" className="text-[12px] font-medium px-2.5 py-1.5 rounded-lg"
            style={{ color: "var(--accent)", background: "var(--accent-bg)" }}>
            {t.finance}
          </Link>
        </div>
        {!fees || fees.length === 0 ? (
          <p className="px-5 py-8 text-center text-[13px]" style={{ color: "var(--text-3)" }}>
            {t.noServiceFeesYet}
          </p>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border-2)" }}>
            {fees.map((fee: any) => {
              const STATUS_STYLE: Record<string, React.CSSProperties> = {
                pending: { background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" },
                paid:    { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" },
                overdue: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" },
              };
              const STATUS_LABEL: Record<string, string> = { pending: t.feePending, paid: t.feePaid, overdue: t.feeOverdue };
              const ay = format(new Date(fee.period_year, fee.period_month - 1, 1), "MMMM yyyy", { locale: dfLocale });
              return (
                <div key={fee.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium" style={{ color: "var(--text-1)" }}>{ay}</p>
                    {fee.notes && <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>{fee.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[13px] font-semibold tabular-nums" style={{ color: "var(--text-1)" }}>
                      {formatMoney(Number(fee.amount), locale)}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                      style={STATUS_STYLE[fee.status] ?? STATUS_STYLE.pending}>
                      {STATUS_LABEL[fee.status] ?? t.feePending}
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
            {t.activeTasks} <span style={{ color: "var(--text-3)" }}>({tasks?.length ?? 0})</span>
          </h2>
        </div>
        {!tasks || tasks.length === 0 ? (
          <p className="px-5 py-8 text-center text-[13px]" style={{ color: "var(--text-3)" }}>{t.noActiveTasks}</p>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border-2)" }}>
            {tasks.map((task) => {
              const overdue = new Date(task.due_date) < new Date();
              return (
                <div key={task.id} className="px-5 py-3 flex items-center justify-between">
                  <p className="text-[13px] font-medium" style={{ color: "var(--text-1)" }}>{task.title}</p>
                  <span className="text-[12px] font-medium tabular-nums"
                    style={{ color: overdue ? "#dc2626" : "var(--text-3)" }}>
                    {format(new Date(task.due_date), "d MMM yyyy", { locale: dfLocale })}
                    {overdue && t.overdueSuffix}
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
import GibCard from "./GibCard";
import WhatsAppLink from "@/components/WhatsAppLink";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
