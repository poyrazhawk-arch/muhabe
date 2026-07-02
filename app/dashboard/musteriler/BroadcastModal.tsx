"use client";
import { useState } from "react";
import { useDict } from "@/lib/i18n/LocaleContext";

type Client = { id: string; full_name: string; email?: string };

export default function BroadcastModal({ clients }: { clients: Client[] }) {
  const t = useDict().musteriler;
  const TEMPLATES = [
    {
      key: "document_reminder",
      label: t.templateDocumentReminder,
      subject: t.subjectDocumentReminder,
      message: t.messageDocumentReminder,
    },
    {
      key: "filing_deadline",
      label: t.templateFilingDeadline,
      subject: t.subjectFilingDeadline,
      message: t.messageFilingDeadline,
    },
    {
      key: "custom",
      label: t.templateCustom,
      subject: "",
      message: "",
    },
  ];
  const [open, setOpen]             = useState(false);
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState<{ sent: number; failed: number } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [template, setTemplate]     = useState(TEMPLATES[0].key);
  const [subject, setSubject]       = useState(TEMPLATES[0].subject);
  const [message, setMessage]       = useState(TEMPLATES[0].message);

  function selectTemplate(key: string) {
    setTemplate(key);
    const tpl = TEMPLATES.find(t => t.key === key)!;
    setSubject(tpl.subject);
    setMessage(tpl.message);
  }

  function toggleClient(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedIds.size === clients.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(clients.map(c => c.id)));
  }

  async function handleSend() {
    if (selectedIds.size === 0 || !subject || !message) return;
    setLoading(true);
    const res = await fetch("/api/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_ids: Array.from(selectedIds),
        subject,
        message,
        template,
      }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  const emailCount = clients.filter(c => c.email && selectedIds.has(c.id)).length;

  return (
    <>
      <button onClick={() => { setOpen(true); setResult(null); }}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all active:scale-[0.98]"
        style={{ color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ddd6fe" }}>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
        {t.bulkEmail}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>

            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
              <h2 className="text-[15px] font-semibold" style={{ color: "var(--text-1)" }}>{t.sendBulkEmail}</h2>
              <button onClick={() => setOpen(false)} className="text-[13px]" style={{ color: "var(--text-3)" }}>{t.close}</button>
            </div>

            {result ? (
              <div className="p-8 text-center flex-1">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                  <svg className="w-7 h-7" style={{ color: "#15803d" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <p className="text-[16px] font-semibold" style={{ color: "var(--text-1)" }}>{t.sent}</p>
                <p className="text-[13px] mt-1" style={{ color: "var(--text-3)" }}>
                  {t.emailsSent.replace("{count}", String(result.sent)).replace("{failedSuffix}", result.failed > 0 ? t.failedSuffix.replace("{count}", String(result.failed)) : "")}
                </p>
                <button onClick={() => setOpen(false)} className="mt-4 px-4 py-2 rounded-lg text-[13px] font-semibold text-white"
                  style={{ background: "var(--accent)" }}>
                  {t.close}
                </button>
              </div>
            ) : (
              <div className="flex flex-1 overflow-hidden">
                {/* Sol — müşteri listesi */}
                <div className="w-56 flex flex-col" style={{ borderRight: "1px solid var(--border)" }}>
                  <div className="px-3 py-2.5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-2)" }}>
                    <span className="text-[12px] font-medium" style={{ color: "var(--text-3)" }}>
                      {selectedIds.size} / {clients.length}
                    </span>
                    <button onClick={toggleAll} className="text-[12px] font-medium" style={{ color: "var(--accent)" }}>
                      {selectedIds.size === clients.length ? t.deselectAll : t.selectAll}
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto p-2 space-y-0.5">
                    {clients.map(c => (
                      <label key={c.id}
                        className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                        <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleClient(c.id)}
                          className="w-3.5 h-3.5 accent-blue-600"/>
                        <div className="min-w-0">
                          <p className="text-[12px] font-medium truncate" style={{ color: "var(--text-1)" }}>{c.full_name}</p>
                          {!c.email && <p className="text-[10px]" style={{ color: "#ef4444" }}>{t.noEmail}</p>}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sağ — içerik */}
                <div className="flex-1 flex flex-col overflow-auto p-5 space-y-4">
                  <div>
                    <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>{t.templateLabel}</label>
                    <div className="flex gap-2 flex-wrap">
                      {TEMPLATES.map(tpl => (
                        <button key={tpl.key} onClick={() => selectTemplate(tpl.key)}
                          className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
                          style={template === tpl.key
                            ? { background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" }
                            : { background: "var(--bg)", color: "var(--text-2)", border: "1px solid var(--border)" }}>
                          {tpl.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium mb-1" style={{ color: "var(--text-2)" }}>{t.subjectLabel}</label>
                    <input value={subject} onChange={e => setSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-[13px] focus:outline-none"
                      style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-1)" }}/>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[12px] font-medium mb-1" style={{ color: "var(--text-2)" }}>{t.messageLabel}</label>
                    <textarea value={message} onChange={e => setMessage(e.target.value)} rows={7}
                      className="w-full px-3 py-2 rounded-lg text-[13px] focus:outline-none resize-none"
                      style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-1)" }}/>
                  </div>
                  <button onClick={handleSend} disabled={loading || selectedIds.size === 0 || !subject || !message}
                    className="w-full py-2.5 rounded-lg text-[13px] font-semibold text-white transition-all disabled:opacity-50 active:scale-[0.99]"
                    style={{ background: "var(--accent)" }}>
                    {loading ? t.sending : t.sendToClients.replace("{count}", String(emailCount)).replace("{plural}", emailCount !== 1 ? "s" : "")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
