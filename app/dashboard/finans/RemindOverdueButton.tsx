"use client";

import { useState } from "react";
import { BellRinging, CheckCircle, Warning } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
type OverdueFee = { id: string; email: string };

export default function RemindOverdueButton({ overdueFees }: { overdueFees: OverdueFee[] }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function remindAll() {
    if (state !== "idle") return;
    setState("sending");
    try {
      await Promise.all(
        overdueFees.map(fee =>
          fetch("/api/service-fees/send-invoice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fee_id: fee.id }),
          })
        )
      );
      setState("sent");
      setTimeout(() => setState("idle"), 4000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }

  return (
    <AnimatePresence mode="wait">
      {state === "idle" && (
        <motion.button
          key="idle"
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.15, ease: EASE }}
          onClick={remindAll}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 12.5, fontWeight: 600, letterSpacing: "-0.01em",
            padding: "7px 13px", borderRadius: 9,
            background: "var(--red-bg)", color: "var(--red)",
            border: "1px solid var(--red-lt)", cursor: "pointer",
          }}
        >
          <BellRinging size={13} weight="bold" />
          Remind overdue · {overdueFees.length}
        </motion.button>
      )}

      {state === "sending" && (
        <motion.div
          key="sending"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 2px", fontSize: 12.5, color: "var(--text-3)" }}
        >
          <motion.span
            style={{ display: "inline-block", width: 12, height: 12, borderRadius: "50%", borderWidth: 2, borderStyle: "solid", borderColor: "var(--text-3) var(--text-3) var(--text-3) transparent" }}
            animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
          />
          Sending {overdueFees.length} reminders…
        </motion.div>
      )}

      {state === "sent" && (
        <motion.div
          key="sent"
          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: EASE }}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 2px", fontSize: 12.5, fontWeight: 600, color: "#15803d" }}
        >
          <CheckCircle size={14} weight="fill" />
          {overdueFees.length} sent
        </motion.div>
      )}

      {state === "error" && (
        <motion.div
          key="error"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 2px", fontSize: 12.5, color: "var(--red)" }}
        >
          <Warning size={13} weight="fill" />
          Failed
        </motion.div>
      )}
    </AnimatePresence>
  );
}
