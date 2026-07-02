"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDict } from "@/lib/i18n/LocaleContext";

export default function BelgeOnayButton({ belgeId }: { belgeId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useDict().belgeler;

  async function handleOnayla() {
    setLoading(true);
    await fetch(`/api/belgeler/${belgeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved" }),
    });
    router.refresh();
  }

  return (
    <button onClick={handleOnayla} disabled={loading}
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
      style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
      </svg>
      {loading ? t.approving : t.approve}
    </button>
  );
}
