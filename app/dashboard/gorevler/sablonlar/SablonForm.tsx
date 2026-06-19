"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "@phosphor-icons/react";

const RECURRENCE = [
  { value: "monthly",   label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly",    label: "Yearly" },
];

export default function SablonForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", recurrence_type: "monthly",
    due_day: "26", advance_days: "7",
  });
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/gorev-sablonlari", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        due_day: form.due_day ? parseInt(form.due_day) : undefined,
        advance_days: parseInt(form.advance_days),
      }),
    });
    setLoading(false);
    if (res.ok) { setOpen(false); router.refresh(); }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 12px", borderRadius: "8px",
    fontSize: "13px", outline: "none",
    background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-1)",
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold text-white active:scale-[0.98] transition-all"
        style={{ background: "var(--accent)", boxShadow: "0 2px 8px rgba(37,99,235,0.28)" }}
      >
        <Plus size={14} weight="bold" />
        Add Template
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-md rounded-2xl p-6"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <h2 className="text-[15px] font-semibold mb-4" style={{ color: "var(--text-1)" }}>
              Add Task Template
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[12px] font-medium mb-1" style={{ color: "var(--text-2)" }}>Template name</label>
                <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="VAT Return Preparation" style={inputStyle}/>
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1" style={{ color: "var(--text-2)" }}>Description (optional)</label>
                <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Short description…" style={inputStyle}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium mb-1" style={{ color: "var(--text-2)" }}>Recurrence</label>
                  <select value={form.recurrence_type} onChange={e => setForm(p => ({ ...p, recurrence_type: e.target.value }))}
                    style={inputStyle}>
                    {RECURRENCE.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-1" style={{ color: "var(--text-2)" }}>Due day of month</label>
                  <input type="number" min="1" max="31" value={form.due_day}
                    onChange={e => setForm(p => ({ ...p, due_day: e.target.value }))}
                    placeholder="26" style={inputStyle}/>
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1" style={{ color: "var(--text-2)" }}>Days in advance to create</label>
                <input type="number" min="1" max="30" value={form.advance_days}
                  onChange={e => setForm(p => ({ ...p, advance_days: e.target.value }))}
                  style={inputStyle}/>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 py-2 rounded-lg text-[13px] font-medium"
                  style={{ background: "var(--bg)", color: "var(--text-2)", border: "1px solid var(--border)" }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2 rounded-lg text-[13px] font-semibold text-white disabled:opacity-50"
                  style={{ background: "var(--accent)" }}>
                  {loading ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
