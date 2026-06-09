"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OdemeButon({ feeId }: { feeId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleOde() {
    if (!confirm("Bu ödemeyi alındı olarak işaretlemek istiyor musunuz?")) return;
    setLoading(true);
    await fetch("/api/service-fees", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: feeId, status: "paid" }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button onClick={handleOde} disabled={loading}
      className="inline-flex items-center gap-1 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
      style={{ color: "#15803d", background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
      {loading ? "..." : "Ödendi"}
    </button>
  );
}
