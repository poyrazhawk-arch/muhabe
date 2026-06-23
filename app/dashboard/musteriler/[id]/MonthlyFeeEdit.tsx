"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PencilSimple, Check, X } from "@phosphor-icons/react";

export default function MonthlyFeeEdit({
  clientId, current,
}: { clientId: string; current: number | null }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue]     = useState(current != null ? String(current) : "");
  const [saving, setSaving]   = useState(false);
  const router = useRouter();

  async function save() {
    setSaving(true);
    await fetch("/api/musteriler", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: clientId, monthly_fee: value ? parseFloat(value) : null }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <p className="text-[12px] font-semibold" style={{ color: "var(--text-1)" }}>
          {current != null
            ? current.toLocaleString("en-GB", { style: "currency", currency: "GBP" }) + "/mo"
            : "—"}
        </p>
        <button onClick={() => setEditing(true)}
          className="p-1 rounded transition-colors"
          style={{ color: "var(--text-3)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text-1)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}>
          <PencilSimple size={11} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[12px]" style={{ color: "var(--text-3)" }}>£</span>
      <input
        autoFocus type="number" min="0" step="0.01"
        value={value} onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
        className="w-20 px-2 py-0.5 rounded text-[12px] focus:outline-none tabular-nums"
        style={{ background: "var(--bg)", border: "1px solid var(--accent)", color: "var(--text-1)" }}
      />
      <button onClick={save} disabled={saving}
        className="p-1 rounded" style={{ color: "#15803d" }}>
        <Check size={12} weight="bold" />
      </button>
      <button onClick={() => setEditing(false)}
        className="p-1 rounded" style={{ color: "var(--text-3)" }}>
        <X size={12} weight="bold" />
      </button>
    </div>
  );
}
