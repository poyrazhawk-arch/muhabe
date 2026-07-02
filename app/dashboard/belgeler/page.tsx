import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { enUS, tr as trLocale } from "date-fns/locale";
import {
  Files,
  FileText,
  FilePdf,
  FileXls,
  FileImage,
  DownloadSimple,
} from "@phosphor-icons/react/dist/ssr";
import BelgeOnayButton from "./BelgeOnayButton";
import { getLocale } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n/dictionaries";

function DocIcon({ mime }: { mime: string }) {
  if (mime === "application/pdf") return <FilePdf size={14} weight="duotone" />;
  if (mime?.startsWith("image/"))  return <FileImage size={14} weight="duotone" />;
  if (mime?.includes("spreadsheet") || mime?.includes("excel")) return <FileXls size={14} weight="duotone" />;
  return <FileText size={14} weight="duotone" />;
}

function docColor(mime: string): string {
  if (mime === "application/pdf") return "#ef4444";
  if (mime?.startsWith("image/"))  return "#8b5cf6";
  if (mime?.includes("spreadsheet") || mime?.includes("excel")) return "#16a34a";
  return "#64748b";
}

export default async function BelgelerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: accountant } = await supabase
    .from("accountants").select("id").eq("user_id", user!.id).single();

  const { data: documents } = await supabase
    .from("documents").select("*, clients(full_name)")
    .eq("accountant_id", accountant!.id)
    .order("created_at", { ascending: false });

  const locale = await getLocale();
  const t = getDict(locale).belgeler;
  const dateLocale = locale === "tr" ? trLocale : enUS;

  const DURUM: Record<string, { label: string; bg: string; color: string; border: string }> = {
    pending:  { label: t.statusPending,  bg: "var(--amber-bg)", color: "var(--amber)", border: "var(--amber-lt)" },
    received: { label: t.statusReceived, bg: "var(--accent-bg)", color: "var(--accent)", border: "var(--accent-lt)" },
    approved: { label: t.statusApproved, bg: "var(--green-bg)", color: "var(--green)", border: "var(--green-lt)" },
    rejected: { label: t.statusRejected, bg: "var(--red-bg)", color: "var(--red)", border: "var(--red-lt)" },
  };

  const bekleyen  = documents?.filter(d => d.status === "pending" || d.status === "received").length ?? 0;
  const onaylanan = documents?.filter(d => d.status === "approved").length ?? 0;

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-1)" }}>{t.title}</h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--text-3)" }}>
            {t.summaryCount
              .replace("{count}", String(documents?.length ?? 0))
              .replace("{pending}", String(bekleyen))
              .replace("{approved}", String(onaylanan))}
          </p>
        </div>
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
      >
        {!documents || documents.length === 0 ? (
          <div className="py-16 text-center">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
            >
              <Files size={22} style={{ color: "var(--text-3)" }} weight="duotone" />
            </div>
            <p className="text-[13px] font-medium" style={{ color: "var(--text-1)" }}>{t.noDocumentsYet}</p>
            <p className="text-[12px] mt-1" style={{ color: "var(--text-3)" }}>{t.noDocumentsSub}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
              <tr>
                {[t.colFile, t.colClient, t.colType, t.colDate, t.colStatus, ""].map((h, i) => (
                  <th
                    key={i}
                    className={`px-5 py-3 text-[11px] font-semibold uppercase tracking-wider ${i === 5 ? "text-right" : "text-left"}`}
                    style={{ color: "var(--text-3)", letterSpacing: "0.06em" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {documents.map((doc: any, idx: number) => {
                const d = DURUM[doc.status] ?? DURUM.pending;
                const color = docColor(doc.mime_type);
                return (
                  <tr
                    key={doc.id}
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
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: `${color}18`, color }}
                        >
                          <DocIcon mime={doc.mime_type} />
                        </div>
                        <span className="text-[13px] font-medium truncate max-w-[160px]" style={{ color: "var(--text-1)" }}>
                          {doc.file_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[13px]" style={{ color: "var(--text-2)" }}>
                      {doc.clients ? (doc.clients as any).full_name : t.noClient}
                    </td>
                    <td className="px-5 py-3 text-[13px]" style={{ color: "var(--text-2)" }}>
                      {doc.document_type}
                    </td>
                    <td className="px-5 py-3 text-[13px] tabular-nums" style={{ color: "var(--text-3)" }}>
                      {format(new Date(doc.created_at), "d MMM yyyy", { locale: dateLocale })}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                        style={{ background: d.bg, color: d.color, border: `1px solid ${d.border}` }}
                      >
                        {d.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <a
                          href={`/api/belgeler/indir/${doc.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
                          style={{ color: "var(--accent)", background: "var(--accent-bg)", border: "1px solid var(--accent-lt)" }}
                        >
                          <DownloadSimple size={12} weight="bold" />
                          {t.download}
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
