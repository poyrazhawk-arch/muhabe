"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CaretLeft, UploadSimple, UserPlus, CheckCircle, Warning, X, DownloadSimple, SealCheck } from "@phosphor-icons/react";
import { useDict, useIsTurkey } from "@/lib/i18n/LocaleContext";
import { classifyTaxId } from "@/lib/utils/gib";

// ── Shared field component ───────────────────────────────────────
function Field({ name, label, required, placeholder, type = "text" }: {
  name: string; label: string; required?: boolean; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
        {label}{required && <span style={{ color: "var(--accent)" }}> *</span>}
      </label>
      <input id={name} name={name} type={type} required={required} placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-lg text-[13px] focus:outline-none transition-colors"
        style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-1)" }}
        onFocus={e => { e.target.style.borderColor = "var(--accent)"; }}
        onBlur={e  => { e.target.style.borderColor = "var(--border)"; }}
      />
    </div>
  );
}

// ── CSV parser ──────────────────────────────────────────────────
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.replace(/^"|"$/g, "").trim().toLowerCase());
  return lines.slice(1).map(line => {
    const cols = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|^(?=,)|(?<=,)$)/g) ?? line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (cols[i] ?? "").replace(/^"|"$/g, "").trim();
    });
    return row;
  }).filter(r => Object.values(r).some(v => v));
}

// ── Column mapping ──────────────────────────────────────────────
const COLUMN_MAP: Record<string, string> = {
  // full_name variants
  "full_name": "full_name", "name": "full_name", "full name": "full_name",
  "ad soyad": "full_name", "isim": "full_name", "müşteri adı": "full_name",
  // company
  "company_name": "company_name", "company": "company_name", "firm": "company_name",
  "şirket": "company_name", "firma": "company_name",
  // email
  "email": "email", "e-mail": "email", "e-posta": "email", "mail": "email",
  // phone
  "phone": "phone", "tel": "phone", "telefon": "phone", "mobile": "phone",
  // tax
  "tax_number": "tax_number", "tax": "tax_number", "vkn": "tax_number",
  "vergi no": "tax_number", "tc kimlik": "tax_number",
};

function normalizeRow(raw: Record<string, string>) {
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(raw)) {
    const mapped = COLUMN_MAP[key.toLowerCase()];
    if (mapped) out[mapped] = val;
  }
  return out;
}

// ── Main page ───────────────────────────────────────────────────
export default function YeniMusteriPage() {
  const t = useDict().musteriler;
  const router = useRouter();
  const [tab, setTab] = useState<"single" | "bulk">("single");

  // Single form state
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [taxNo, setTaxNo]     = useState("");
  const isTurkey = useIsTurkey();
  const taxKind = isTurkey && taxNo.replace(/\D/g, "").length >= 10 ? classifyTaxId(taxNo) : null;

  // Bulk import state
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview]     = useState<Record<string, string>[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; errors: { row: number; reason: string }[] } | null>(null);
  const [fileError, setFileError] = useState("");

  async function handleSingleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const res = await fetch("/api/musteriler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) { router.push("/dashboard/musteriler"); router.refresh(); }
    else {
      const json = await res.json();
      setError(json.hata ?? t.errSomethingWrong);
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError(""); setPreview([]); setImportResult(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) { setFileError(t.errCsvOnly); return; }

    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text).map(normalizeRow);
      const valid = rows.filter(r => r.full_name);
      if (valid.length === 0) { setFileError(t.errNoValidRows); return; }
      setPreview(valid);
    };
    reader.readAsText(file, "utf-8");
  }

  async function handleBulkImport() {
    if (!preview.length) return;
    setImporting(true); setImportResult(null);
    const res = await fetch("/api/musteriler/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preview),
    });
    const json = await res.json();
    setImportResult(json);
    setImporting(false);
    if (json.imported > 0) {
      setTimeout(() => { router.push("/dashboard/musteriler"); router.refresh(); }, 1500);
    }
  }

  function downloadTemplate() {
    const csv = "full_name,company_name,email,phone,tax_number\nJane Smith,ABC Ltd,jane@abc.com,+44 7700 900000,1234567890\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ledger_clients_template.csv";
    a.click();
  }

  return (
    <div className="max-w-2xl animate-fade-up">
      {/* Header */}
      <div className="mb-5">
        <Link href="/dashboard/musteriler" className="inline-flex items-center gap-1 text-[12px] font-medium mb-3"
          style={{ color: "var(--text-3)" }}>
          <CaretLeft size={12} weight="bold" /> {t.backToClients}
        </Link>
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-1)" }}>{t.addClientsTitle}</h1>
        <p className="text-[13px] mt-0.5" style={{ color: "var(--text-3)" }}>{t.addClientsSub}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-1 rounded-xl w-fit"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        {([
          { key: "single", label: t.tabSingle, Icon: UserPlus },
          { key: "bulk",   label: t.tabBulk, Icon: UploadSimple },
        ] as const).map(({ key, label, Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all"
            style={{
              background: tab === key ? "var(--accent)" : "transparent",
              color:      tab === key ? "#fff" : "var(--text-2)",
            }}>
            <Icon size={13} weight="bold" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Single client form ── */}
      {tab === "single" && (
        <div className="rounded-xl p-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <form onSubmit={handleSingleSubmit} className="space-y-4">
            <Field name="full_name"    label={t.fullName}     required placeholder="Jane Smith" />
            <Field name="company_name" label={t.companyName}           placeholder="ABC Ltd." />
            <div>
              <label htmlFor="tax_number" className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
                {t.taxNumber}
              </label>
              <input id="tax_number" name="tax_number" inputMode="numeric"
                placeholder={isTurkey ? "VKN (10) veya TCKN (11)" : "1234567890"}
                value={taxNo} onChange={e => setTaxNo(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-[13px] focus:outline-none transition-colors"
                style={{
                  background: "var(--bg)", color: "var(--text-1)",
                  border: `1px solid ${taxKind === "invalid" ? "var(--red)" : taxKind ? "#16a34a" : "var(--border)"}`,
                }} />
              {taxKind === "invalid" && (
                <p className="flex items-center gap-1 text-[11px] mt-1" style={{ color: "var(--red)" }}>
                  <Warning size={12} weight="fill" /> Geçersiz VKN/TCKN — kontrol edin.
                </p>
              )}
              {taxKind && taxKind !== "invalid" && (
                <p className="flex items-center gap-1 text-[11px] mt-1" style={{ color: "#16a34a" }}>
                  <SealCheck size={12} weight="fill" /> Geçerli {taxKind === "vkn" ? "VKN" : "TCKN"}
                </p>
              )}
            </div>
            <Field name="email"        label={t.email}         type="email" placeholder="jane@company.com" />
            <Field name="phone"        label={t.phone}                  placeholder="+44 7700 900000" />
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>{t.notes}</label>
              <textarea name="notes" rows={3} placeholder={t.notesPlaceholder}
                className="w-full px-3 py-2.5 rounded-lg text-[13px] focus:outline-none resize-none transition-colors"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-1)" }}
                onFocus={e => { e.target.style.borderColor = "var(--accent)"; }}
                onBlur={e  => { e.target.style.borderColor = "var(--border)"; }}
              />
            </div>
            {error && (
              <div className="px-3 py-2.5 rounded-lg text-[12px]"
                style={{ background: "var(--red-bg)", border: "1px solid var(--red-lt)", color: "var(--red)" }}>
                {error}
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={loading}
                className="px-5 py-2 rounded-lg text-[13px] font-semibold text-white disabled:opacity-50"
                style={{ background: "var(--accent)" }}>
                {loading ? t.saving : t.saveClient}
              </button>
              <button type="button" onClick={() => router.back()}
                className="px-5 py-2 rounded-lg text-[13px] font-medium transition-colors"
                style={{ color: "var(--text-2)", background: "var(--bg)", border: "1px solid var(--border)" }}>
                {t.cancel}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Bulk import ── */}
      {tab === "bulk" && (
        <div className="space-y-4">
          {/* Upload zone */}
          <div className="rounded-xl p-6"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>{t.uploadCsvFile}</p>
                <p className="text-[12px] mt-0.5" style={{ color: "var(--text-3)" }}>
                  {t.uploadCsvColumns}
                </p>
              </div>
              <button onClick={downloadTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium"
                style={{ color: "var(--accent)", background: "var(--accent-bg)", border: "1px solid var(--accent-bg)" }}>
                <DownloadSimple size={12} weight="bold" />
                {t.template}
              </button>
            </div>

            {/* Drop zone */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-xl border-2 border-dashed py-10 flex flex-col items-center gap-2 transition-colors"
              style={{ borderColor: "var(--border)", background: "var(--bg)" }}
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = "var(--accent)"; }}
              onDragLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; }}
              onDrop={e => {
                e.preventDefault();
                e.currentTarget.style.borderColor = "var(--border)";
                const file = e.dataTransfer.files[0];
                if (file) {
                  const dt = new DataTransfer(); dt.items.add(file);
                  if (fileRef.current) { fileRef.current.files = dt.files; handleFileChange({ target: fileRef.current } as any); }
                }
              }}
            >
              <UploadSimple size={24} weight="duotone" style={{ color: "var(--text-3)" }} />
              <p className="text-[13px] font-medium" style={{ color: "var(--text-2)" }}>
                {t.clickToUploadOrDrop}
              </p>
              <p className="text-[11px]" style={{ color: "var(--text-3)" }}>{t.csvFilesOnly}</p>
            </button>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />

            {fileError && (
              <div className="flex items-center gap-2 mt-3 px-3 py-2.5 rounded-lg text-[12px]"
                style={{ background: "var(--red-bg)", color: "var(--red)" }}>
                <Warning size={13} /> {fileError}
              </div>
            )}
          </div>

          {/* Preview table */}
          {preview.length > 0 && !importResult && (
            <div className="rounded-xl overflow-hidden"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="px-5 py-3.5 flex items-center justify-between"
                style={{ borderBottom: "1px solid var(--border-2)" }}>
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>
                    {t.previewCount.replace("{count}", String(preview.length))}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>
                    {t.reviewBeforeImport}
                  </p>
                </div>
                <button onClick={() => { setPreview([]); if (fileRef.current) fileRef.current.value = ""; }}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: "var(--text-3)", background: "var(--bg)" }}>
                  <X size={13} />
                </button>
              </div>

              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-2)", background: "var(--bg)" }}>
                      {[t.colName, t.colCompany, t.colEmail, t.colPhone, t.colTaxNo].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left font-semibold" style={{ color: "var(--text-3)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 50).map((row, i) => (
                      <tr key={i} style={{ borderTop: "1px solid var(--border-2)" }}>
                        <td className="px-4 py-2 font-medium" style={{ color: "var(--text-1)" }}>{row.full_name || "—"}</td>
                        <td className="px-4 py-2" style={{ color: "var(--text-2)" }}>{row.company_name || "—"}</td>
                        <td className="px-4 py-2" style={{ color: "var(--text-2)" }}>{row.email || "—"}</td>
                        <td className="px-4 py-2" style={{ color: "var(--text-2)" }}>{row.phone || "—"}</td>
                        <td className="px-4 py-2" style={{ color: "var(--text-2)" }}>{row.tax_number || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.length > 50 && (
                  <p className="px-4 py-2 text-[11px]" style={{ color: "var(--text-3)" }}>
                    {t.moreRowsNotShown.replace("{count}", String(preview.length - 50))}
                  </p>
                )}
              </div>

              <div className="px-5 py-3.5" style={{ borderTop: "1px solid var(--border-2)" }}>
                <button onClick={handleBulkImport} disabled={importing}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold text-white disabled:opacity-50"
                  style={{ background: "var(--accent)" }}>
                  <UploadSimple size={13} weight="bold" />
                  {importing ? t.importing : t.importClients.replace("{count}", String(preview.length))}
                </button>
              </div>
            </div>
          )}

          {/* Result */}
          {importResult && (
            <div className="rounded-xl p-5"
              style={{
                background: importResult.imported > 0 ? "var(--green-bg, #f0fdf4)" : "var(--red-bg)",
                border: `1px solid ${importResult.imported > 0 ? "#bbf7d0" : "var(--red-lt)"}`,
              }}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={16} weight="fill" style={{ color: importResult.imported > 0 ? "#16a34a" : "var(--red)" }} />
                <p className="text-[13px] font-semibold" style={{ color: importResult.imported > 0 ? "#15803d" : "var(--red)" }}>
                  {t.clientsImportedSuccessfully.replace("{count}", String(importResult.imported)).replace("{plural}", importResult.imported !== 1 ? "s" : "")}
                </p>
              </div>
              {importResult.errors.length > 0 && (
                <p className="text-[12px]" style={{ color: "var(--text-3)" }}>
                  {t.rowsSkipped.replace("{count}", String(importResult.errors.length))}
                </p>
              )}
              {importResult.imported > 0 && (
                <p className="text-[12px] mt-1" style={{ color: "var(--text-3)" }}>{t.redirectingToClients}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
