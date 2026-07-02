"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LinkSimple, CheckCircle } from "@phosphor-icons/react";
import { useDict } from "@/lib/i18n/LocaleContext";

export default function PortalLinkButton({ portalToken }: { portalToken: string }) {
  const t = useDict().musteriler;
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}/portal/${portalToken}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <motion.button
      onClick={copy}
      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
      style={{ background: "var(--accent-bg)", color: "var(--accent)", border: "1px solid var(--accent-border, var(--border))" }}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span key="copied" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1" style={{ color: "#15803d" }}>
            <CheckCircle size={13} weight="fill" /> {t.copiedExcl}
          </motion.span>
        ) : (
          <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-1.5">
            <LinkSimple size={13} /> {t.clientPortalLink}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
