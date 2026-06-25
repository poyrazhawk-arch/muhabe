"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { format, formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { ChatText, Phone, Envelope, FileText, Plus, X, Check } from "@phosphor-icons/react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type Comm = {
  id: string;
  channel: "note" | "email" | "call" | "letter";
  subject: string;
  body?: string | null;
  logged_at: string;
};

const CH = {
  note:   { label: "Note",   Icon: ChatText, dot: "#6d28d9" },
  email:  { label: "Email",  Icon: Envelope, dot: "#2563eb" },
  call:   { label: "Call",   Icon: Phone,    dot: "#16a34a" },
  letter: { label: "Letter", Icon: FileText, dot: "#d97706" },
} as const;

export default function CommsLog({ clientId, initial }: { clientId: string; initial: Comm[] }) {
  const [comms,   setComms]   = useState<Comm[]>(initial);
  const [open,    setOpen]    = useState(false);
  const [channel, setChannel] = useState<Comm["channel"]>("note");
  const [subject, setSubject] = useState("");
  const [body,    setBody]    = useState("");
  const [date,    setDate]    = useState(() => new Date().toISOString().slice(0, 10));
  const [saving,  setSaving]  = useState(false);

  async function save() {
    if (!subject.trim() || saving) return;
    setSaving(true);
    const res = await fetch("/api/comms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, channel, subject, body, logged_at: new Date(date).toISOString() }),
    });
    const item = await res.json();
    setComms(prev => [item, ...prev]);
    setSubject(""); setBody(""); setChannel("note"); setDate(new Date().toISOString().slice(0, 10));
    setSaving(false);
    setOpen(false);
  }

  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 14, overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px",
        borderBottom: open || comms.length > 0 ? "1px solid var(--border-2)" : "none",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-3)" }}>
            Comms
          </p>
          {comms.length > 0 && (
            <span style={{
              fontSize: 10.5, fontWeight: 600, padding: "1px 6px", borderRadius: 20,
              background: "var(--surface-2)", color: "var(--text-3)", border: "1px solid var(--border-2)",
            }}>
              {comms.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setOpen(v => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            fontSize: 12, fontWeight: 500, letterSpacing: "-0.01em",
            color: open ? "var(--text-3)" : "var(--accent)",
            background: open ? "var(--surface-2)" : "var(--accent-bg)",
            border: `1px solid ${open ? "var(--border)" : "var(--accent-lt)"}`,
            borderRadius: 7, padding: "4px 9px", cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {open
              ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.12 }}><X size={11} weight="bold" /></motion.span>
              : <motion.span key="p" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.12 }}><Plus size={11} weight="bold" /></motion.span>
            }
          </AnimatePresence>
          {open ? "Cancel" : "Log"}
        </button>
      </div>

      {/* New entry form */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              padding: "14px 16px",
              background: "var(--surface-2)",
              borderBottom: "1px solid var(--border-2)",
              display: "flex", flexDirection: "column", gap: 10,
            }}>
              {/* Channel tabs */}
              <div style={{ display: "flex", gap: 4 }}>
                {(Object.keys(CH) as Comm["channel"][]).map(ch => {
                  const c = CH[ch];
                  const active = channel === ch;
                  return (
                    <button
                      key={ch}
                      onClick={() => setChannel(ch)}
                      style={{
                        display: "flex", alignItems: "center", gap: 5,
                        fontSize: 11.5, fontWeight: active ? 600 : 500,
                        padding: "4px 9px", borderRadius: 6,
                        background: active ? "var(--surface)" : "transparent",
                        border: active ? "1px solid var(--border)" : "1px solid transparent",
                        color: active ? "var(--text-1)" : "var(--text-3)",
                        cursor: "pointer", transition: "all 0.12s",
                        boxShadow: active ? "var(--shadow-xs)" : "none",
                      }}
                    >
                      <span style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: active ? c.dot : "var(--border)",
                        flexShrink: 0, transition: "background 0.12s",
                      }} />
                      {c.label}
                    </button>
                  );
                })}
              </div>

              {/* Subject */}
              <input
                autoFocus
                type="text" value={subject}
                onChange={e => setSubject(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && subject.trim()) save(); }}
                placeholder="Subject / summary"
                className="input-base"
                style={{ fontSize: 13, padding: "8px 12px", background: "var(--surface)" }}
              />

              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="date" value={date}
                  onChange={e => setDate(e.target.value)}
                  className="input-base"
                  style={{ fontSize: 12.5, padding: "8px 12px", background: "var(--surface)", flex: "0 0 150px" }}
                />
                <textarea
                  value={body} onChange={e => setBody(e.target.value)}
                  placeholder="Details (optional)"
                  rows={2} className="input-base"
                  style={{ fontSize: 12.5, resize: "none", padding: "8px 12px", background: "var(--surface)", flex: 1 }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={save}
                  disabled={saving || !subject.trim()}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    fontSize: 12.5, fontWeight: 600, padding: "7px 14px", borderRadius: 8,
                    background: saving || !subject.trim() ? "var(--border)" : "var(--accent)",
                    color: saving || !subject.trim() ? "var(--text-3)" : "#fff",
                    border: "none", cursor: saving || !subject.trim() ? "not-allowed" : "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <Check size={12} weight="bold" />
                  {saving ? "Saving…" : "Save log"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Log entries */}
      {comms.length === 0 && !open ? (
        <p style={{ padding: "28px 16px", textAlign: "center", fontSize: 12.5, color: "var(--text-3)" }}>
          No communications logged
        </p>
      ) : (
        <div style={{ position: "relative" }}>
          {/* Vertical timeline line */}
          {comms.length > 1 && (
            <div style={{
              position: "absolute", left: 27, top: 20, bottom: 20,
              width: 1, background: "var(--border-2)", pointerEvents: "none",
            }} />
          )}
          {comms.map((comm, i) => {
            const c = CH[comm.channel] ?? CH.note;
            const d = new Date(comm.logged_at);
            const ago = formatDistanceToNow(d, { addSuffix: true, locale: enUS });
            return (
              <motion.div
                key={comm.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04, ease: EASE }}
                style={{
                  display: "flex", gap: 12, padding: "12px 16px",
                  borderTop: i > 0 ? "1px solid var(--border-2)" : "none",
                  position: "relative",
                }}
              >
                {/* Channel dot */}
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                  background: "var(--surface)", border: "1.5px solid var(--border-2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative", zIndex: 1,
                }}>
                  <c.Icon size={11} weight="fill" style={{ color: c.dot }} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", letterSpacing: "-0.01em" }}>
                      {comm.subject}
                    </p>
                    <time
                      dateTime={comm.logged_at}
                      title={format(d, "d MMM yyyy, HH:mm", { locale: enUS })}
                      style={{ fontSize: 11, color: "var(--text-3)", flexShrink: 0, whiteSpace: "nowrap" }}
                    >
                      {ago}
                    </time>
                  </div>
                  {comm.body && (
                    <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 3, lineHeight: 1.55 }}>
                      {comm.body}
                    </p>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                    <span style={{
                      fontSize: 10.5, fontWeight: 600, letterSpacing: "0.04em",
                      textTransform: "uppercase", color: c.dot, opacity: 0.8,
                    }}>
                      {c.label}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
