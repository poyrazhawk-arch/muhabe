"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
      style={done
        ? { background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }
        : { background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
      </svg>
      {loading ? "..." : done ? "Tamamlandı!" : "Tamamla"}
    </button>
  );
}
