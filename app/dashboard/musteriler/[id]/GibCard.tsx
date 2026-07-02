"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { SealCheck, Warning, ArrowSquareOut, PencilSimple, Check, X, Bank } from "@phosphor-icons/react";
import {
  classifyTaxId, GIB_LINKS,
  E_INVOICE_LABELS, type EInvoiceStatus,
} from "@/lib/utils/gib";

interface Props {
  clientId: string;
  taxNumber: string | null;
  taxOffice: string | null;
  eInvoiceStatus: EInvoiceStatus;
  gibDebt: number | null;
  gibDebtCheckedAt: string | null;
}

const fmtTRY = (n: number) => n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

export default function GibCard(p: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);

  const [taxNumber, setTaxNumber]   = useState(p.taxNumber ?? "");
  const [taxOffice, setTaxOffice]   = useState(p.taxOffice ?? "");
  const [status, setStatus]         = useState<EInvoiceStatus>(p.eInvoiceStatus ?? "unknown");
  const [debt, setDebt]             = useState(p.gibDebt != null ? String(p.gibDebt) : "");
  const [checkedAt, setCheckedAt]   = useState(p.gibDebtCheckedAt ?? "");

  const kind = classifyTaxId(p.taxNumber ?? "");
  const badge =
    !p.taxNumber ? { label: "VKN/TCKN girilmedi", bg: "#f8fafc", color: "#64748b", border: "#e2e8f0", Icon: Warning }
    : kind === "invalid" ? { label: "Geçersiz VKN/TCKN", bg: "#fef2f2", color: "#dc2626", border: "#fecaca", Icon: Warning }
    : { label: kind === "vkn" ? "Geçerli VKN" : "Geçerli TCKN", bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0", Icon: SealCheck };

  async function save() {
    setSaving(true);
    await fetch("/api/musteriler", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: p.clientId,
        tax_number: taxNumber || null,
        tax_office: taxOffice || null,
        e_invoice_status: status,
        gib_debt: debt ? parseFloat(debt) : null,
        gib_debt_checked_at: debt ? (checkedAt || new Date().toISOString().split("T")[0]) : null,
      }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  const linkBtn = "inline-flex items-center gap-1.5 text-[11.5px] font-medium px-2.5 py-1.5 rounded-lg transition-colors";

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
      <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-2)" }}>
        <h2 className="text-[13px] font-semibold flex items-center gap-2" style={{ color: "var(--text-1)" }}>
          <Bank size={15} weight="fill" style={{ color: "var(--accent)" }} />
          GİB Bilgileri
        </h2>
        {!editing && (
          <button onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 text-[12px] font-medium transition-opacity hover:opacity-70"
            style={{ color: "var(--accent)" }}>
            <PencilSimple size={12} /> Düzenle
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!editing ? (
          <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }} className="p-4 space-y-3">

            {/* Doğrulama rozeti */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                <badge.Icon size={12} weight="fill" /> {badge.label}
              </span>
              {p.taxNumber && (
                <span className="text-[12px] tabular-nums font-medium" style={{ color: "var(--text-2)" }}>{p.taxNumber}</span>
              )}
            </div>

            {/* Alanlar */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Vergi Dairesi" value={p.taxOffice || "—"} />
              <Field label="e-Belge Durumu" value={E_INVOICE_LABELS[p.eInvoiceStatus ?? "unknown"]} />
              <Field label="GİB Borç Durumu"
                value={p.gibDebt != null ? fmtTRY(p.gibDebt) : "Kaydedilmedi"}
                valueColor={p.gibDebt != null && p.gibDebt > 0 ? "#dc2626" : undefined} />
              <Field label="Son Kontrol"
                value={p.gibDebtCheckedAt ? new Date(p.gibDebtCheckedAt).toLocaleDateString("tr-TR") : "—"} />
            </div>

            {/* GİB derin-linkleri */}
            <div className="flex flex-wrap gap-2 pt-1">
              <a href={GIB_LINKS.interaktifVD} target="_blank" rel="noopener noreferrer"
                className={linkBtn} style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-2)" }}>
                <ArrowSquareOut size={13} /> İnteraktif VD (borç sorgula)
              </a>
              <a href={GIB_LINKS.eFaturaKayitliKullanicilar} target="_blank" rel="noopener noreferrer"
                className={linkBtn} style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-2)" }}>
                <ArrowSquareOut size={13} /> e-Fatura Mükellef Listesi
              </a>
            </div>
            <p className="text-[10.5px] leading-relaxed" style={{ color: "var(--text-3)" }}>
              GİB canlı borç sorgusu için açık API yoktur; sorguyu kendi GİB girişinizle yapıp sonucu buraya kaydedin.
            </p>
          </motion.div>
        ) : (
          <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }} className="p-4 space-y-3">

            <div className="grid grid-cols-2 gap-3">
              <EditField label="VKN / TCKN">
                <input value={taxNumber} onChange={e => setTaxNumber(e.target.value)}
                  inputMode="numeric" placeholder="10 veya 11 hane" className="gib-input" />
              </EditField>
              <EditField label="Vergi Dairesi">
                <input value={taxOffice} onChange={e => setTaxOffice(e.target.value)}
                  placeholder="Örn. Boğaziçi VD" className="gib-input" />
              </EditField>
              <EditField label="e-Belge Durumu">
                <select value={status} onChange={e => setStatus(e.target.value as EInvoiceStatus)} className="gib-input">
                  {(Object.keys(E_INVOICE_LABELS) as EInvoiceStatus[]).map(k => (
                    <option key={k} value={k}>{E_INVOICE_LABELS[k]}</option>
                  ))}
                </select>
              </EditField>
              <EditField label="GİB Borç (₺)">
                <input value={debt} onChange={e => setDebt(e.target.value)}
                  type="number" min="0" step="0.01" placeholder="0,00" className="gib-input" />
              </EditField>
              <EditField label="Son Kontrol Tarihi">
                <input value={checkedAt} onChange={e => setCheckedAt(e.target.value)} type="date" className="gib-input" />
              </EditField>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button onClick={save} disabled={saving}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-60"
                style={{ background: "var(--accent)" }}>
                <Check size={13} weight="bold" /> {saving ? "Kaydediliyor…" : "Kaydet"}
              </button>
              <button onClick={() => setEditing(false)} disabled={saving}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-2)" }}>
                <X size={13} /> İptal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .gib-input {
          width: 100%;
          padding: 7px 10px;
          border-radius: 8px;
          font-size: 12.5px;
          background: var(--bg);
          border: 1px solid var(--border);
          color: var(--text-1);
          outline: none;
        }
        .gib-input:focus { border-color: var(--accent); }
      `}</style>
    </div>
  );
}

function Field({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium" style={{ color: "var(--text-3)" }}>{label}</p>
      <p className="text-[12.5px] font-semibold mt-0.5" style={{ color: valueColor ?? "var(--text-1)" }}>{value}</p>
    </div>
  );
}

function EditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--text-3)" }}>{label}</label>
      {children}
    </div>
  );
}
