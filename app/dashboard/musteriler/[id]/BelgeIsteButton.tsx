"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  PaperPlaneTilt, Link as LinkIcon, CheckCircle,
  X, ClipboardText, CaretDown,
} from "@phosphor-icons/react";
import { useDict } from "@/lib/i18n/LocaleContext";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type Props = {
  clientId:    string;
  clientName:  string;
  clientEmail?: string | null;
};

type Step = "idle" | "form" | "sending" | "done";
type DonePayload = { url: string; emailSent: boolean; to?: string };

export default function BelgeIsteButton({ clientId, clientName, clientEmail }: Props) {
  const t = useDict().musteriler;
  const DOC_TYPES = [
    t.docInvoice, t.docBankStatement, t.docPayroll, t.docContract,
    t.docTaxCertificate, t.docHmrcDocument, t.docExpenses, t.docOther,
  ];
  const [step,     setStep]     = useState<Step>("idle");
  const [selected, setSelected] = useState<string[]>([t.docInvoice]);
  const [message,  setMessage]  = useState("");
  const [sendEmail, setSendEmail] = useState(!!clientEmail);
  const [done,     setDone]     = useState<DonePayload | null>(null);
  const [copied,   setCopied]   = useState(false);
  const firstInputRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (step !== "form") return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  function close() {
    setStep("idle");
    setDone(null);
    setSelected([t.docInvoice]);
    setMessage("");
    setSendEmail(!!clientEmail);
    setCopied(false);
  }

  function toggle(type: string) {
    setSelected(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  }

  async function send() {
    if (selected.length === 0) return;
    setStep("sending");
    const res = await fetch("/api/upload-tokens", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id:      clientId,
        document_types: selected,
        message:        message || undefined,
        send_email:     sendEmail,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setDone({ url: data.upload_url, emailSent: data.email_sent, to: clientEmail ?? undefined });
      setStep("done");
    } else {
      setStep("form");
    }
  }

  function copy() {
    if (!done) return;
    navigator.clipboard.writeText(done.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <>
      {/* Trigger button */}
      <button
        ref={firstInputRef}
        onClick={() => setStep("form")}
        className="inline-flex items-center gap-1.5 transition-all active:scale-[0.97]"
        style={{
          fontSize: 12, fontWeight: 600, letterSpacing: "-0.01em",
          padding: "6px 11px", borderRadius: 8,
          color: "var(--accent)", background: "var(--accent-bg)",
          border: "1px solid var(--accent-lt)", cursor: "pointer",
        }}
      >
        <PaperPlaneTilt size={12} weight="bold" />
        {t.requestDocs}
      </button>

      {/* Backdrop + modal */}
      <AnimatePresence>
        {step !== "idle" && (
          <>
            <motion.div
              key="bd"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              onClick={close}
              style={{
                position: "fixed", inset: 0, zIndex: 60,
                background: "rgba(7,16,29,0.48)",
                backdropFilter: "blur(5px)",
              }}
            />

            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.2, ease: EASE }}
              style={{
                position: "fixed", top: "50%", left: "50%",
                transform: "translate(-50%,-50%)",
                zIndex: 61, width: "100%", maxWidth: 420,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                boxShadow: "0 2px 6px rgba(7,16,29,0.06), 0 16px 48px rgba(7,16,29,0.2)",
                overflow: "hidden",
              }}
            >
              <AnimatePresence mode="wait">

                {/* ── FORM ── */}
                {(step === "form" || step === "sending") && (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {/* Header */}
                    <div style={{
                      padding: "14px 16px 12px",
                      borderBottom: "1px solid var(--border-2)",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 8,
                          background: "var(--accent-bg)", border: "1px solid var(--accent-lt)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <PaperPlaneTilt size={13} weight="bold" style={{ color: "var(--accent)" }} />
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.025em", lineHeight: 1 }}>
                            {t.requestDocuments}
                          </p>
                          <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                            {clientName}
                          </p>
                        </div>
                      </div>
                      <button onClick={close} style={{ width: 24, height: 24, borderRadius: 6, background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <X size={14} />
                      </button>
                    </div>

                    {/* Body */}
                    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
                      {/* Doc type chips */}
                      <div>
                        <p style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 8 }}>
                          {t.documentTypes}
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                          {DOC_TYPES.map(t => {
                            const on = selected.includes(t);
                            return (
                              <button
                                key={t}
                                onClick={() => toggle(t)}
                                style={{
                                  fontSize: 12, fontWeight: on ? 600 : 400, padding: "4px 10px",
                                  borderRadius: 20, cursor: "pointer", transition: "all 0.12s",
                                  background: on ? "var(--accent)" : "var(--surface-2)",
                                  color: on ? "#fff" : "var(--text-2)",
                                  border: `1px solid ${on ? "var(--accent)" : "var(--border)"}`,
                                }}
                              >
                                {t}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Message */}
                      <div>
                        <p style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 6 }}>
                          {t.noteToClient} <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "var(--border)" }}>— {t.optionalLabel}</span>
                        </p>
                        <textarea
                          value={message}
                          onChange={e => setMessage(e.target.value)}
                          placeholder={t.notePlaceholder.replace("{month}", new Date().toLocaleString("en-GB", { month: "long" }))}
                          rows={2}
                          className="input-base"
                          style={{ fontSize: 12.5, resize: "none", padding: "8px 12px", lineHeight: 1.55 }}
                        />
                      </div>

                      {/* Send method toggle */}
                      {clientEmail ? (
                        <button
                          onClick={() => setSendEmail(v => !v)}
                          style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "10px 12px", borderRadius: 9, cursor: "pointer",
                            background: sendEmail ? "var(--accent-bg)" : "var(--surface-2)",
                            border: `1px solid ${sendEmail ? "var(--accent-lt)" : "var(--border)"}`,
                            transition: "all 0.15s", width: "100%", textAlign: "left",
                          }}
                        >
                          <div style={{
                            width: 16, height: 16, borderRadius: 5, flexShrink: 0,
                            background: sendEmail ? "var(--accent)" : "var(--surface)",
                            border: `1.5px solid ${sendEmail ? "var(--accent)" : "var(--border)"}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.12s",
                          }}>
                            {sendEmail && <CheckCircle size={10} weight="fill" style={{ color: "#fff" }} />}
                          </div>
                          <div>
                            <p style={{ fontSize: 12.5, fontWeight: 600, color: sendEmail ? "var(--accent)" : "var(--text-2)", lineHeight: 1 }}>
                              {t.sendEmailToClient}
                            </p>
                            <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                              {clientEmail}
                            </p>
                          </div>
                        </button>
                      ) : (
                        <div style={{
                          display: "flex", alignItems: "center", gap: 8,
                          padding: "10px 12px", borderRadius: 9,
                          background: "var(--surface-2)", border: "1px solid var(--border)",
                        }}>
                          <ClipboardText size={14} style={{ color: "var(--text-3)", flexShrink: 0 }} />
                          <p style={{ fontSize: 12, color: "var(--text-3)" }}>
                            {t.noEmailOnFile}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div style={{
                      padding: "10px 16px 14px",
                      borderTop: "1px solid var(--border-2)",
                      display: "flex", gap: 6, justifyContent: "flex-end",
                    }}>
                      <button onClick={close} style={{ fontSize: 12.5, fontWeight: 500, padding: "7px 14px", borderRadius: 8, background: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border)", cursor: "pointer" }}>
                        {t.cancel}
                      </button>
                      <button
                        onClick={send}
                        disabled={step === "sending" || selected.length === 0}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          fontSize: 12.5, fontWeight: 600, padding: "7px 16px", borderRadius: 8,
                          background: step === "sending" ? "var(--accent-bg)" : "var(--accent)",
                          color: step === "sending" ? "var(--accent)" : "#fff",
                          border: "none", cursor: step === "sending" ? "not-allowed" : "pointer",
                          boxShadow: step === "sending" ? "none" : "0 1px 4px rgba(37,99,235,0.28)",
                          transition: "all 0.15s", opacity: selected.length === 0 ? 0.5 : 1,
                        }}
                      >
                        {step === "sending" ? (
                          <>
                            <motion.span
                              style={{ display: "inline-block", width: 12, height: 12, borderRadius: "50%", border: "2px solid var(--accent)", borderTopColor: "transparent" }}
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                            />
                            {t.sending}
                          </>
                        ) : sendEmail && clientEmail ? (
                          <>
                            <PaperPlaneTilt size={13} weight="bold" />
                            {t.sendRequest}
                          </>
                        ) : (
                          <>
                            <LinkIcon size={13} weight="bold" />
                            {t.createLink}
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── DONE ── */}
                {step === "done" && done && (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, ease: EASE }}
                  >
                    <div style={{ padding: "28px 24px", textAlign: "center" }}>
                      {/* Success icon */}
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 380, damping: 22, delay: 0.05 }}
                        style={{
                          width: 48, height: 48, borderRadius: 14, margin: "0 auto 16px",
                          background: done.emailSent ? "var(--accent-bg)" : "var(--surface-2)",
                          border: `1px solid ${done.emailSent ? "var(--accent-lt)" : "var(--border)"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        {done.emailSent
                          ? <PaperPlaneTilt size={22} weight="bold" style={{ color: "var(--accent)" }} />
                          : <LinkIcon size={22} weight="bold" style={{ color: "var(--text-2)" }} />
                        }
                      </motion.div>

                      <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.025em", marginBottom: 6 }}>
                        {done.emailSent ? t.requestSent : t.linkReady}
                      </p>
                      <p style={{ fontSize: 12.5, color: "var(--text-3)", marginBottom: 20 }}>
                        {done.emailSent && done.to
                          ? t.emailDeliveredTo.replace("{email}", done.to)
                          : t.copyLinkBelow}
                      </p>

                      {/* URL row */}
                      <div style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "8px 10px",
                        background: "var(--surface-2)", border: "1px solid var(--border)",
                        borderRadius: 9, marginBottom: 16, textAlign: "left",
                      }}>
                        <p style={{ fontSize: 11.5, color: "var(--text-3)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {done.url}
                        </p>
                        <button
                          onClick={copy}
                          style={{
                            display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
                            fontSize: 11.5, fontWeight: 600, padding: "4px 10px", borderRadius: 6,
                            background: copied ? "var(--accent)" : "var(--surface)",
                            color: copied ? "#fff" : "var(--text-2)",
                            border: "1px solid var(--border)", cursor: "pointer", transition: "all 0.15s",
                          }}
                        >
                          {copied ? <><CheckCircle size={11} weight="fill" /> {t.copied}</> : t.copy}
                        </button>
                      </div>

                      <button
                        onClick={close}
                        style={{ fontSize: 12.5, fontWeight: 500, padding: "8px 20px", borderRadius: 8, background: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border)", cursor: "pointer", width: "100%" }}
                      >
                        {t.done}
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
