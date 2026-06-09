import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import BelgeOnayButton from "./BelgeOnayButton";

const DURUM: Record<string, { label: string; bg: string; color: string; border: string }> = {
  pending:  { label: "Bekliyor",   bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  received: { label: "Alındı",     bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  approved: { label: "Onaylandı",  bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  rejected: { label: "Reddedildi", bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
};

const MIME_COLOR: Record<string, string> = {
  "application/pdf": "#ef4444",
  "image/jpeg":      "#8b5cf6",
  "image/png":       "#8b5cf6",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "#16a34a",
};

export default async function BelgelerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: accountant } = await supabase
    .from("accountants").select("id").eq("user_id", user!.id).single();

  const { data: documents } = await supabase
    .from("documents").select("*, clients(full_name)")
    .eq("accountant_id", accountant!.id)
    .order("created_at", { ascending: false });

  const bekleyen  = documents?.filter(d => d.status === "pending" || d.status === "received").length ?? 0;
  const onaylanan = documents?.filter(d => d.status === "approved").length ?? 0;

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-1)" }}>Belgeler</h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--text-3)" }}>
            {documents?.length ?? 0} belge · {bekleyen} bekleyen · {onaylanan} onaylı
          </p>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>

        {!documents || documents.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: "#f1f5f9" }}>
              <svg className="w-5 h-5" style={{ color: "var(--text-3)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <p className="text-[13px] font-medium" style={{ color: "var(--text-1)" }}>Henüz belge yüklenmemiş</p>
            <p className="text-[12px] mt-1" style={{ color: "var(--text-3)" }}>Müşteri sayfasından belge talebi oluşturun</p>
          </div>
        ) : (
          <table className="w-full">
            <thead style={{ background: "#fafbfc", borderBottom: "1px solid var(--border)" }}>
              <tr>
                {["Dosya", "Müşteri", "Tür", "Tarih", "Durum", ""].map((h, i) => (
                  <th key={i}
                    className={`px-5 py-3 text-[11px] font-semibold uppercase tracking-wider ${i === 5 ? "text-right" : "text-left"}`}
                    style={{ color: "var(--text-3)", letterSpacing: "0.06em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {documents.map((doc: any, idx: number) => {
                const d = DURUM[doc.status] ?? DURUM.pending;
                const iconColor = MIME_COLOR[doc.mime_type] ?? "#64748b";
                return (
                  <tr key={doc.id}
                    className="transition-colors hover:bg-slate-50/60"
                    style={{ borderTop: idx > 0 ? "1px solid var(--border-2)" : "none" }}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: `${iconColor}18` }}>
                          <svg className="w-3.5 h-3.5" style={{ color: iconColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                          </svg>
                        </div>
                        <span className="text-[13px] font-medium truncate max-w-[160px]" style={{ color: "var(--text-1)" }}>
                          {doc.file_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[13px]" style={{ color: "var(--text-2)" }}>
                      {doc.clients ? (doc.clients as any).full_name : "-"}
                    </td>
                    <td className="px-5 py-3 text-[13px]" style={{ color: "var(--text-2)" }}>
                      {doc.document_type}
                    </td>
                    <td className="px-5 py-3 text-[13px] tabular-nums" style={{ color: "var(--text-3)" }}>
                      {format(new Date(doc.created_at), "d MMM yyyy", { locale: tr })}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                        style={{ background: d.bg, color: d.color, border: `1px solid ${d.border}` }}>
                        {d.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <a href={`/api/belgeler/indir/${doc.id}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
                          style={{ color: "var(--accent)", background: "var(--accent-bg)" }}>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                          </svg>
                          İndir
                        </a>
                        {doc.status === "received" && <BelgeOnayButton belgeId={doc.id} />}
                      </div>
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
