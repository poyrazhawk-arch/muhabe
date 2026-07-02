"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, Hash, TextAlignLeft, CalendarBlank } from "@phosphor-icons/react";
import { useDict } from "@/lib/i18n/LocaleContext";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function GorevTamamlaButton({ gorevId }: { gorevId: string }) {
  const t = useDict().gorevler;
  const [open,    setOpen]    = useState(false);
  const [ref,     setRef]     = useState("");
  const [notes,   setNotes]   = useState("");
  const [date,    setDate]    = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => firstRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
    };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, [open, ref, notes, date]);

  async function submit() {
    if (loading) return;
    setLoading(true);
    await fetch(`/api/gorevler/${gorevId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status:        "completed",
        outcome_ref:   ref   || undefined,
        outcome_notes: notes || undefined,
      }),
    });
    setOpen(false);
    setTimeout(() => router.refresh(), 260);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 transition-all active:scale-[0.96]"
        style={{
          fontSize: 12, fontWeight: 600, letterSpacing: "-0.01em",
          padding: "5px 10px", borderRadius: 7,
          color: "#15803d", background: "#f0fdf4",
          border: "1px solid #bbf7d0",
        }}
      >
        <Check size={12} weight="bold" />
        {t.complete}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="bd"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => !loading && setOpen(false)}
              style={{
                position: "fixed", inset: 0, zIndex: 60,
                background: "rgba(7,16,29,0.5)",
                backdropFilter: "blur(6px)",
              }}
            />

            {/* Modal */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.22, ease: EASE }}
              style={{
                position: "fixed", top: "50%", left: "50%",
                transform: "translate(-50%,-50%)",
                zIndex: 61, width: "100%", maxWidth: 400,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                boxShadow: "0 2px 6px rgba(7,16,29,0.06), 0 12px 40px rgba(7,16,29,0.18), 0 40px 80px rgba(7,16,29,0.1)",
                overflow: "hidden",
              }}
            >
              {/* Header strip */}
              <div style={{
                padding: "14px 16px 12px",
                borderBottom: "1px solid var(--border-2)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: "#f0fdf4", border: "1px solid #bbf7d0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Check size={13} weight="bold" style={{ color: "#15803d" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.025em", lineHeight: 1 }}>
                      {t.markAsComplete}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                      {t.logOutcomeForRecords}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    width: 24, height: 24, borderRadius: 6, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--text-3)",
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Fields */}
              <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Date */}
                <div>
                  <label style={{
                    display: "flex", alignItems: "center", gap: 5,
                    fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em",
                    textTransform: "uppercase", color: "var(--text-3)", marginBottom: 6,
                  }}>
                    <CalendarBlank size={10} />
                    {t.completedOn}
                  </label>
                  <input
                    ref={firstRef}
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="input-base"
                    style={{ fontSize: 13, padding: "8px 12px" }}
                  />
                </div>

                {/* Ref */}
                <div>
                  <label style={{
                    display: "flex", alignItems: "center", gap: 5,
                    fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em",
                    textTransform: "uppercase", color: "var(--text-3)", marginBottom: 6,
                  }}>
                    <Hash size={10} />
                    {t.referenceId}
                    <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "var(--border)", marginLeft: 2 }}>
                      — {t.optional}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={ref}
                    onChange={e => setRef(e.target.value)}
                    placeholder={t.referenceIdPlaceholder}
                    className="input-base"
                    style={{ fontSize: 13, padding: "8px 12px" }}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label style={{
                    display: "flex", alignItems: "center", gap: 5,
                    fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em",
                    textTransform: "uppercase", color: "var(--text-3)", marginBottom: 6,
                  }}>
                    <TextAlignLeft size={10} />
                    {t.notes}
                    <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "var(--border)", marginLeft: 2 }}>
                      — {t.optional}
                    </span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder={t.notesPlaceholder}
                    rows={3}
                    className="input-base"
                    style={{ fontSize: 13, resize: "none", padding: "8px 12px", lineHeight: 1.55 }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div style={{
                padding: "10px 16px 14px",
                borderTop: "1px solid var(--border-2)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 8,
              }}>
                <span style={{ fontSize: 11, color: "var(--text-3)" }}>
                  <kbd style={{
                    fontSize: 10, padding: "2px 5px", borderRadius: 4,
                    background: "var(--surface-2)", border: "1px solid var(--border)",
                    color: "var(--text-3)", fontFamily: "var(--font-mono)",
                  }}>⌘</kbd>
                  {" + "}
                  <kbd style={{
                    fontSize: 10, padding: "2px 5px", borderRadius: 4,
                    background: "var(--surface-2)", border: "1px solid var(--border)",
                    color: "var(--text-3)", fontFamily: "var(--font-mono)",
                  }}>↵</kbd>
                  {" "}{t.toConfirm}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => setOpen(false)}
                    disabled={loading}
                    style={{
                      fontSize: 12.5, fontWeight: 500, padding: "7px 14px", borderRadius: 8,
                      background: "var(--surface-2)", color: "var(--text-2)",
                      border: "1px solid var(--border)", cursor: "pointer",
                    }}
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={submit}
                    disabled={loading}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      fontSize: 12.5, fontWeight: 600, padding: "7px 16px", borderRadius: 8,
                      background: loading ? "#86efac" : "#16a34a", color: "#fff",
                      border: "none", cursor: loading ? "not-allowed" : "pointer",
                      boxShadow: loading ? "none" : "0 1px 4px rgba(22,163,74,0.28)",
                      transition: "all 0.15s",
                    }}
                  >
                    {loading ? (
                      <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                        {t.saving}
                      </motion.span>
                    ) : (
                      <>
                        <Check size={13} weight="bold" />
                        {t.markComplete}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
