"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PaperPlaneTilt, CheckCircle } from "@phosphor-icons/react";

export default function BelgeHatirlatmaButton({ tokenId, clientEmail }: { tokenId: string; clientEmail?: string | null }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  if (!clientEmail) return (
    <span className="text-[11px]" style={{ color: "var(--text-3)" }}>No email</span>
  );

  async function send() {
    setState("sending");
    const res = await fetch("/api/belge-hatirlatma", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token_id: tokenId }),
    });
    setState(res.ok ? "sent" : "error");
    if (res.ok) setTimeout(() => setState("idle"), 3000);
  }

  return (
    <AnimatePresence mode="wait">
      {state === "idle" && (
        <motion.button key="idle"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={send}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-1.5 text-[11.5px] font-medium px-2.5 py-1 rounded-lg transition-all"
          style={{ color: "var(--accent)", background: "var(--accent-bg)", border: "1px solid var(--border)" }}>
          <PaperPlaneTilt size={12} />
          Send reminder
        </motion.button>
      )}
      {state === "sending" && (
        <motion.span key="sending" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-[11px]" style={{ color: "var(--text-3)" }}>Sending…</motion.span>
      )}
      {state === "sent" && (
        <motion.span key="sent" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1 text-[11.5px] font-medium" style={{ color: "#15803d" }}>
          <CheckCircle size={12} weight="fill" /> Sent to {clientEmail}
        </motion.span>
      )}
      {state === "error" && (
        <motion.button key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onClick={() => setState("idle")}
          className="text-[11px] font-medium" style={{ color: "#dc2626" }}>
          Failed — retry
        </motion.button>
      )}
    </AnimatePresence>
  );
}
