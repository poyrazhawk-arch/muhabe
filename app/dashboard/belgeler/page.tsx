import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import BelgeOnayButton from "./BelgeOnayButton";

const DURUM: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  pending:  { label: "Bekliyor",   bg: "#fffbeb", text: "#d97706", border: "#fde68a", dot: "#f59e0b" },
  received: { label: "Alındı",     bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe", dot: "#3b82f6" },
  approved: { label: "Onaylandı",  bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0", dot: "#22c55e" },
  rejected: { label: "Reddedildi", bg: "#fef2f2", text: "#dc2626", border: "#fecaca", dot: "#ef4444" },
};

const FILE_ICON: Record<string, string> = {
  "application/pdf": "#ef4444",
  "image/jpeg": "#8b5cf6",
  "image/png": "#8b5cf6",
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

  const bekleyen = documents?.filter(d => d.status === "pending" || d.status === "received").length ?? 0;
  const onaylanan = documents?.filter(d => d.status === "approved").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>Belgeler</h1>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
            {documents?.length ?? 0} belge · {bekleyen} bekleyen · {onaylanan} onaylı
          </p>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden"
        style={{ background: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        {!documents || documents.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#f1f5f9" }}>
              <svg className="w-7 h-7" style={{ color: "#94a3b8" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: "#0f172a" }}>Henüz belge yüklenmemiş</p>
            <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>Müşteri sayfasından belge talebi oluşturun</p>
          </div>
        ) : (
          <table className="w-full">
            <thead style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
              <tr>
                {["Belge", "Müşteri", "Tür", "Tarih", "Durum", ""].map((h, i) => (
                  <th key={i} className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wide ${i === 5 ? "text-right" : "text-left"}`}
                    style={{ color: "#94a3b8" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {documents.map((doc: any, idx: number) => {
                const d = DURUM[doc.status] ?? DURUM.pending;
                const iconColor = FILE_ICON[doc.mime_type] ?? "#64748b";
                return (
                  <tr key={doc.id} style={{ borderTop: idx > 0 ? "1px solid #f8fafc" : "none" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: `${iconColor}15` }}>
                          <svg className="w-4 h-4" style={{ color: iconColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                          </svg>
                        </div>
                        <span className="text-sm font-medium truncate max-w-[180px]" style={{ color: "#0f172a" }}>
                          {doc.file_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "#64748b" }}>
                      {doc.clients ? (doc.clients as any).full_name : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "#64748b" }}>{doc.document_type}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "#94a3b8" }}>
                      {format(new Date(doc.created_at), "d MMM yyyy", { locale: tr })}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: d.bg, color: d.text, border: `1px solid ${d.border}` }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: d.dot }} />
                        {d.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <a href={`/api/belgeler/indir/${doc.id}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg"
                          style={{ color: "#3b82f6", background: "#eff6ff" }}>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
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
