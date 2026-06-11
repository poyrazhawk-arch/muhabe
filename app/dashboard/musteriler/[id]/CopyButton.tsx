"use client";
import { useState } from "react";

export default function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button onClick={handleCopy}
      className="text-[12px] font-semibold px-2.5 py-1 rounded-lg transition-colors shrink-0"
      style={copied
        ? { color: "#15803d", background: "#f0fdf4", border: "1px solid #bbf7d0" }
        : { color: "var(--accent)", background: "var(--accent-bg)", border: "1px solid var(--accent-lt)" }}>
      {copied ? "Kopyalandı" : "Linki kopyala"}
    </button>
  );
}
