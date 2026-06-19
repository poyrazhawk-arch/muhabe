"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "@phosphor-icons/react";

export default function GorevTamamlaButton({ gorevId }: { gorevId: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function handleTamamla() {
    setLoading(true);
    await fetch(`/api/gorevler/${gorevId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });
    setDone(true);
    setTimeout(() => router.refresh(), 500);
  }

  return (
    <button onClick={handleTamamla} disabled={loading || done}
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all active:scale-[0.97] disabled:opacity-50"
      style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>
      <Check size={14} weight="bold" />
      {loading ? "…" : done ? "Done!" : "Complete"}
    </button>
  );
}
