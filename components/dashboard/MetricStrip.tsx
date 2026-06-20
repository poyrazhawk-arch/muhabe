"use client";

import { motion } from "motion/react";
import AnimatedNumber from "@/components/ui/AnimatedNumber";

interface Metric {
  key: string;
  label: string;
  value: number;
  isWarning?: boolean;
  isDanger?: boolean;
}

export default function MetricStrip({ metrics }: { metrics: Metric[] }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => {
          const numColor = m.isDanger
            ? "var(--red)"
            : m.isWarning
            ? "var(--amber)"
            : "var(--text-1)";

          return (
            <motion.div
              key={m.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              className="px-5 py-4"
              style={{
                borderRight: i < 3 ? "1px solid var(--border-2)" : "none",
                background: m.isDanger ? "var(--red-bg)" : "transparent",
              }}
            >
              <AnimatedNumber
                value={m.value}
                duration={900}
                style={{
                  display: "block",
                  fontSize: "30px",
                  fontWeight: 700,
                  letterSpacing: "-0.045em",
                  lineHeight: 1,
                  color: numColor,
                  marginBottom: 6,
                  fontVariantNumeric: "tabular-nums",
                }}
              />
              <p className="text-[11.5px] font-medium" style={{ color: "var(--text-3)" }}>
                {m.label}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
