"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PaperPlaneTilt, CheckCircle } from "@phosphor-icons/react";
import { useDict } from "@/lib/i18n/LocaleContext";

export default function SendInvoiceButton({ feeId, clientEmail, isOverdue }: { feeId: string; clientEmail?: string | null; isOverdue?: boolean }) {
  const t = useDict().finans;
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  if (!clientEmail) return null;

  async function send() {
    setState("sending");
    await fetch("/api/service-fees/send-invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fee_id: feeId }),
    });
    setState("sent");
    setTimeout(() => setState("idle"), 3000);
  }

  return (
    <AnimatePresence mode="wait">
      {state === "idle" && (
        <motion.button key="idle"
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
          onClick={send}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-1 text-[11.5px] font-medium px-2.5 py-1.5 rounded-lg"
          style={isOverdue
            ? { color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca" }
            : { color: "var(--text-3)", background: "var(--surface-2)", border: "1px solid var(--border)" }
          }>
          <PaperPlaneTilt size={12} />
          {t.invoice}
        </motion.button>
      )}
      {state === "sending" && (
        <motion.span key="sending" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-[11px] font-medium" style={{ color: "var(--text-3)" }}>
          {t.sendingInvoice}
        </motion.span>
      )}
      {state === "sent" && (
        <motion.span key="sent" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1 text-[11.5px] font-medium"
          style={{ color: "#15803d" }}>
          <CheckCircle size={12} weight="fill" /> {t.invoiceSent}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
