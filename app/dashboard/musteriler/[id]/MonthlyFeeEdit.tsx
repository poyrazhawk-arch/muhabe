"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { PencilSimple, Check, X } from "@phosphor-icons/react";

export default function MonthlyFeeEdit({
  clientId, current,
}: { clientId: string; current: number | null }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue]     = useState(current != null ? String(current) : "");
  const [saving, setSaving]   = useState(false);
  const router = useRouter();

  async function save() {
    setSaving(true);
    await fetch("/api/musteriler", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: clientId, monthly_fee: value ? parseFloat(value) : null }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  return (
    <AnimatePresence mode="wait">
      {!editing ? (
        <motion.div
          key="view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="flex items-center gap-1.5 group"
        >
          <p className="text-[12px] font-semibold tabular-nums" style={{ color: "var(--text-1)" }}>
            {current != null
              ? current.toLocaleString("en-GB", { style: "currency", currency: "GBP" }) + "/mo"
              : <span style={{ color: "var(--text-3)" }}>Not set</span>
            }
          </p>
          <motion.button
            onClick={() => setEditing(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: "var(--text-3)" }}
          >
            <PencilSimple size={11} />
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          key="edit"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="flex items-center gap-1"
        >
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] font-medium pointer-events-none"
              style={{ color: "var(--text-3)" }}>£</span>
            <input
              autoFocus type="number" min="0" step="0.01"
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
              className="w-24 pl-5 pr-2 py-1 rounded-md text-[12px] tabular-nums focus:outline-none"
              style={{
                background: "var(--bg)",
                border: "1.5px solid var(--accent)",
                color: "var(--text-1)",
                boxShadow: "0 0 0 3px var(--accent-bg)",
              }}
            />
          </div>
          <motion.button
            onClick={save} disabled={saving}
            whileTap={{ scale: 0.9 }}
            className="flex items-center justify-center w-6 h-6 rounded-md transition-all disabled:opacity-50"
            style={{ background: "#16a34a", color: "#fff" }}
          >
            <Check size={11} weight="bold" />
          </motion.button>
          <motion.button
            onClick={() => setEditing(false)}
            whileTap={{ scale: 0.9 }}
            className="flex items-center justify-center w-6 h-6 rounded-md"
            style={{ background: "var(--surface-2)", color: "var(--text-3)", border: "1px solid var(--border)" }}
          >
            <X size={11} weight="bold" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
