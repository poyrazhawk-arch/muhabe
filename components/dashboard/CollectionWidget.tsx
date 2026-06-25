"use client";

import { motion } from "motion/react";
import Link from "next/link";

interface Props {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
  monthLabel: string;
}

function fmtGBP(n: number) {
  return n.toLocaleString("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });
}

export default function CollectionWidget({ total, paid, pending, overdue, monthLabel }: Props) {
  if (total === 0) return null;

  const paidPct    = total > 0 ? (paid    / total) * 100 : 0;
  const pendingPct = total > 0 ? (pending / total) * 100 : 0;
  const overduePct = total > 0 ? (overdue / total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl p-5"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-3)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>
            Collections · {monthLabel}
          </p>
          <p style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.05em", color: "var(--text-1)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            {fmtGBP(total)}
          </p>
        </div>
        <Link
          href="/dashboard/finans"
          style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-3)", textDecoration: "none", paddingTop: 2 }}
        >
          View all →
        </Link>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, borderRadius: 99, overflow: "hidden", background: "var(--surface-3)", display: "flex", gap: 2, marginBottom: 12 }}>
        {paidPct > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${paidPct}%` }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ height: "100%", background: "#22c55e", borderRadius: 99 }}
          />
        )}
        {pendingPct > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pendingPct}%` }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ height: "100%", background: "#f59e0b", borderRadius: 99 }}
          />
        )}
        {overduePct > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overduePct}%` }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ height: "100%", background: "#ef4444", borderRadius: 99 }}
          />
        )}
      </div>

      {/* Legend row */}
      <div className="flex items-center gap-5">
        {[
          { label: "Paid",    value: paid,    color: "#16a34a" },
          { label: "Pending", value: pending, color: "#d97706" },
          { label: "Overdue", value: overdue, color: "#dc2626" },
        ].filter(s => s.value > 0).map(({ label, value, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
            <span style={{ fontSize: "12px", color: "var(--text-2)", fontWeight: 500 }}>
              {label}
            </span>
            <span style={{ fontSize: "12px", color, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
              {fmtGBP(value)}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
