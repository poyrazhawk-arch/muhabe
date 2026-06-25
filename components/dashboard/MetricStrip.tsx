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
    <div className="flex items-end gap-8 flex-wrap">
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
            transition={{ duration: 0.38, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            <AnimatedNumber
              value={m.value}
              duration={800}
              style={{
                display: "block",
                fontSize: "38px",
                fontWeight: 800,
                letterSpacing: "-0.055em",
                lineHeight: 1,
                color: numColor,
                fontVariantNumeric: "tabular-nums",
              }}
            />
            <span
              style={{
                display: "block",
                marginTop: 5,
                fontSize: "11px",
                fontWeight: 500,
                color: "var(--text-3)",
                letterSpacing: "0.015em",
              }}
            >
              {m.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
