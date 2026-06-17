import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import Link from "next/link";
import BelgeIsteButton from "./BelgeIsteButton";
import { calculateRAG } from "@/lib/utils/rag";

const DOC_DURUM: Record<string, string> = {
  pending:  "Bekliyor",
  received: "Alındı",
  approved: "Onaylandı",
  rejected: "Reddedildi",
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
const RAG_LABEL: Record<string, string> = { red: "Kritik", amber: "Dikkat", green: "Tamam" };

export default async function MusteriDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: accountant } = await supabase
    .from("accountants").select("id").eq("user_id", user!.id).single();

  const { data: client } = await supabase
    .from("clients").select("*").eq("id", id).eq("accountant_id", accountant!.id).single();
  if (!client) notFound();

  const [{ data: documents }, { data: tasks }, { data: tokens }, { data: fees }] = await Promise.all([
    supabase.from("documents").select("*").eq("client_id", id).order("created_at", { ascending: false }),
    supabase.from("tasks").select("*").eq("client_id", id).neq("status", "completed").order("due_date"),
    supabase.from("upload_tokens").select("*").eq("client_id", id).eq("is_active", true)
      .order("created_at", { ascending: false }).limit(3),
    supabase.from("service_fees").select("*").eq("client_id", id).order("period_year", { ascending: false }).order("period_month", { ascending: false }).limit(12),
  ]);

  const pendingDocs   = documents?.filter(d => d.status === "pending").length ?? 0;
  const overdueTasks  = tasks?.filter(t => new Date(t.due_date) < new Date()).length ?? 0;
  const rag           = calculateRAG(overdueTasks, pendingDocs, 0);

  return (
    <div className="space-y-5 max-w-3xl animate-fade-up">

      {/* Breadcrumb + Başlık */}
      <div>
        <Link href="/dashboard/musteriler" className="inline-flex items-center gap-1 text-[12px] font-medium mb-3"
          style={{ color: "var(--text-3)" }}>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
          </svg>
          Müşteriler
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-1)" }}>
              {client.full_name}
            </h1>
            {client.company_name && (
              <p className="text-[13px] mt-0.5" style={{ color: "var(--text-3)" }}>{client.company_name}</p>
            )}
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg"
            style={RAG_STYLE[rag]}>
            {RAG_LABEL[rag]}
          </span>
        </div>
      </div>

      {/* Bilgi kartları */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          client.email      && { label: "E-posta",     value: client.email },
          client.phone      && { label: "Telefon",     value: client.phone },
          client.tax_number && { label: "Vergi No",    value: client.tax_number },
          { label: "Durum", value: client.status === "active" ? "Aktif" : "Pasif" },
        ].filter(Boolean).map((item: any) => (
          <div key={item.label} className="rounded-lg p-3"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <p className="text-[11px] font-medium" style={{ color: "var(--text-3)" }}>{item.label}</p>
            <p className="text-[12px] font-semibold mt-0.5 truncate" style={{ color: "var(--text-1)" }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Belge Talebi */}
      <div className="rounded-xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
        <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-2)" }}>
          <h2 className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>Belge Talebi</h2>
          <BelgeIsteButton clientId={id} clientName={client.full_name} />
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
                      background: expired ? "var(--bg)" : "#eff6ff",
                      border: `1px solid ${expired ? "var(--border)" : "#bfdbfe"}`,
                      opacity: expired ? 0.6 : 1,
                    }}>
                    <div>
                      <p className="text-[12px] font-semibold" style={{ color: "var(--text-1)" }}>
                        {t.document_types.join(", ")}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>
                        {expired ? "Süresi doldu" : `${format(new Date(t.expires_at), "d MMM HH:mm", { locale: tr })}'e kadar`}
                        {" · "}{t.used_count}/{t.max_uses} kullanım
                      </p>
                    </div>
                    {!expired && (
                      <CopyButton url={url} />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[13px] text-center py-4" style={{ color: "var(--text-3)" }}>
              Henüz belge talebi oluşturulmamış
            </p>
          )}
        </div>
      </div>

      {/* Belgeler */}
      <div className="rounded-xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
        <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--border-2)" }}>
          <h2 className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>
            Belgeler <span style={{ color: "var(--text-3)" }}>({documents?.length ?? 0})</span>
          </h2>
        </div>
        {!documents || documents.length === 0 ? (
          <p className="px-5 py-8 text-center text-[13px]" style={{ color: "var(--text-3)" }}>Belge yok</p>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border-2)" }}>
            {documents.map((doc) => (
              <div key={doc.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium" style={{ color: "var(--text-1)" }}>{doc.file_name}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>
                    {doc.document_type} · {format(new Date(doc.created_at), "d MMM yyyy", { locale: tr })}
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
                    İndir
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
            Hizmet Bedelleri <span style={{ color: "var(--text-3)" }}>({fees?.length ?? 0})</span>
          </h2>
          <Link href="/dashboard/finans" className="text-[12px] font-medium px-2.5 py-1.5 rounded-lg"
            style={{ color: "var(--accent)", background: "var(--accent-bg)" }}>
            Finans
          </Link>
        </div>
        {!fees || fees.length === 0 ? (
          <p className="px-5 py-8 text-center text-[13px]" style={{ color: "var(--text-3)" }}>
            Bu müşteri için hizmet bedeli eklenmemiş
          </p>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border-2)" }}>
            {fees.map((fee: any) => {
              const STATUS_STYLE: Record<string, React.CSSProperties> = {
                pending: { background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" },
                paid:    { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" },
                overdue: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" },
              };
              const STATUS_LABEL: Record<string, string> = { pending: "Bekliyor", paid: "Ödendi", overdue: "Gecikmiş" };
              const ay = format(new Date(fee.period_year, fee.period_month - 1, 1), "MMMM yyyy", { locale: tr });
              return (
                <div key={fee.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium" style={{ color: "var(--text-1)" }}>{ay}</p>
                    {fee.notes && <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>{fee.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[13px] font-semibold tabular-nums" style={{ color: "var(--text-1)" }}>
                      {Number(fee.amount).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                      style={STATUS_STYLE[fee.status] ?? STATUS_STYLE.pending}>
                      {STATUS_LABEL[fee.status] ?? "Bekliyor"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Görevler */}
      <div className="rounded-xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
        <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--border-2)" }}>
          <h2 className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>
            Aktif Görevler <span style={{ color: "var(--text-3)" }}>({tasks?.length ?? 0})</span>
          </h2>
        </div>
        {!tasks || tasks.length === 0 ? (
          <p className="px-5 py-8 text-center text-[13px]" style={{ color: "var(--text-3)" }}>Aktif görev yok</p>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border-2)" }}>
            {tasks.map((task) => {
              const overdue = new Date(task.due_date) < new Date();
              return (
                <div key={task.id} className="px-5 py-3 flex items-center justify-between">
                  <p className="text-[13px] font-medium" style={{ color: "var(--text-1)" }}>{task.title}</p>
                  <span className="text-[12px] font-medium tabular-nums"
                    style={{ color: overdue ? "#dc2626" : "var(--text-3)" }}>
                    {format(new Date(task.due_date), "d MMM yyyy", { locale: tr })}
                    {overdue && " · Gecikti"}
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

// Client component for clipboard
import CopyButton from "./CopyButton";
