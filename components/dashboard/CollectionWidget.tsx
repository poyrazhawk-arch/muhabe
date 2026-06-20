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

  const paidPct    = Math.round((paid    / total) * 100);
  const pendingPct = Math.round((pending / total) * 100);
  const overduePct = Math.round((overdue / total) * 100);

  const segments = [
    { pct: paidPct,    color: "#22c55e", label: "Paid"    },
    { pct: pendingPct, color: "#f59e0b", label: "Pending" },
    { pct: overduePct, color: "#ef4444", label: "Overdue" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl p-4"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>
            This Month's Collections
          </h2>
          <p className="text-[12px] mt-0.5" style={{ color: "var(--text-3)" }}>{monthLabel}</p>
        </div>
        <Link
          href="/dashboard/finans"
          className="text-[12px] font-medium px-2.5 py-1.5 rounded-lg transition-colors"
          style={{ color: "var(--accent)", background: "var(--accent-bg)" }}
        >
          Details
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-3">
        {[
          { label: "Total",   value: fmtGBP(total),   color: "#2563eb" },
          { label: "Paid",    value: fmtGBP(paid),    color: "#15803d" },
          { label: "Pending", value: fmtGBP(pending), color: "#d97706" },
          { label: "Overdue", value: fmtGBP(overdue), color: "#dc2626" },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <p className="text-[18px] font-bold tabular-nums" style={{ color }}>{value}</p>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Segmented progress bar */}
      <div className="h-1.5 rounded-full overflow-hidden flex gap-px" style={{ background: "var(--border)" }}>
        {segments.filter(s => s.pct > 0).map(({ pct, color, label }) => (
          <motion.div
            key={label}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full"
            style={{ background: color }}
          />
        ))}
      </div>
    </motion.div>
  );
}
