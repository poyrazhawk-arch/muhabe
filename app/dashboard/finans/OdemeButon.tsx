"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, X } from "@phosphor-icons/react";

type State = "idle" | "confirming" | "loading";

export default function OdemeButon({ feeId }: { feeId: string }) {
  const [state, setState] = useState<State>("idle");
  const router = useRouter();

  async function confirm() {
    setState("loading");
    await fetch("/api/service-fees", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: feeId, status: "paid" }),
    });
    router.refresh();
  }

  return (
    <AnimatePresence mode="wait">
      {state === "idle" && (
        <motion.button
          key="idle"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.88 }}
          transition={{ duration: 0.15 }}
          onClick={() => setState("confirming")}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-3 py-1.5 rounded-lg"
          style={{ color: "#15803d", background: "#f0fdf4", border: "1px solid #bbf7d0" }}
        >
          <CheckCircle size={13} weight="fill" />
          Mark paid
        </motion.button>
      )}

      {state === "confirming" && (
        <motion.div
          key="confirm"
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.88 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className="inline-flex items-center gap-1.5"
        >
          <span className="text-[11px] font-medium" style={{ color: "var(--text-3)" }}>Confirm?</span>
          <motion.button onClick={confirm}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.93 }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }}
            className="inline-flex items-center gap-1 text-[11.5px] font-semibold px-2.5 py-1 rounded-lg"
            style={{ color: "#fff", background: "#16a34a" }}>
            <CheckCircle size={12} weight="fill" /> Yes
          </motion.button>
          <motion.button onClick={() => setState("idle")}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }}
            className="inline-flex items-center justify-center w-6 h-6 rounded-lg"
            style={{ background: "var(--surface-2)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
            <X size={10} weight="bold" />
          </motion.button>
        </motion.div>
      )}

      {state === "loading" && (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="inline-flex items-center gap-1.5 text-[11.5px] font-medium px-3 py-1.5 rounded-lg"
          style={{ color: "var(--text-3)", background: "var(--surface-2)" }}
        >
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          >
            Saving…
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
