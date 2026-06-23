"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Warning } from "@phosphor-icons/react";

type Client = { id: string; full_name: string; company_name?: string | null; monthly_fee?: number | null };

export default function BillAllButton({ clients }: { clients: Client[] }) {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [overdueLoading, setOverdueLoading] = useState(false);
  const [amounts, setAmounts] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    clients.forEach(c => { m[c.id] = c.monthly_fee ? String(c.monthly_fee) : ""; });
    return m;
  });
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear]   = useState(String(new Date().getFullYear()));
  const [dueDate, setDueDate] = useState("");
  const [result, setResult]  = useState<{ created: number; skipped: number } | null>(null);
  const router = useRouter();

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  async function handleBillAll() {
    setLoading(true);
    setResult(null);
    const items = clients
      .filter(c => amounts[c.id] && parseFloat(amounts[c.id]) > 0)
      .map(c => ({ client_id: c.id, amount: parseFloat(amounts[c.id]) }));

    if (items.length === 0) { setLoading(false); return; }

    const res = await fetch("/api/service-fees/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ period_month: parseInt(month), period_year: parseInt(year), due_date: dueDate || undefined, items }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setResult(data);
      router.refresh();
    }
  }

  async function handleMarkOverdue() {
    setOverdueLoading(true);
    const res = await fetch("/api/service-fees/mark-overdue", { method: "POST" });
    setOverdueLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button onClick={handleMarkOverdue} disabled={overdueLoading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all active:scale-[0.98] disabled:opacity-50"
          style={{ background: "var(--red-bg)", color: "var(--red)", border: "1px solid var(--red-border)" }}>
          <Warning size={13} weight="fill" />
          {overdueLoading ? "Updating…" : "Mark overdue"}
        </button>
        <button onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all active:scale-[0.98]"
          style={{ background: "var(--surface-2)", color: "var(--text-1)", border: "1px solid var(--border)" }}>
          <Users size={13} weight="bold" />
          Bill all clients
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)" }}>
          <div className="w-full max-w-lg rounded-2xl flex flex-col max-h-[90vh]"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>

            <div className="px-6 py-4 shrink-0" style={{ borderBottom: "1px solid var(--border-2)" }}>
              <h2 className="text-[15px] font-semibold" style={{ color: "var(--text-1)" }}>Bill all clients</h2>
              <p className="text-[12px] mt-0.5" style={{ color: "var(--text-3)" }}>
                Creates a pending fee for each client. Clients already billed for this period are skipped.
              </p>
            </div>

            <div className="px-6 py-4 space-y-3 shrink-0">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-3)" }}>Month</label>
                  <select value={month} onChange={e => setMonth(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg text-[12.5px] focus:outline-none"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-1)" }}>
                    {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-3)" }}>Year</label>
                  <input type="number" value={year} onChange={e => setYear(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg text-[12.5px] focus:outline-none"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-1)" }} />
                </div>
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-3)" }}>Due date</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg text-[12.5px] focus:outline-none"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-1)" }} />
                </div>
              </div>
            </div>

            {/* Client list */}
            <div className="flex-1 overflow-auto px-6 pb-2 space-y-1.5">
              {clients.length === 0 ? (
                <p className="text-[13px] text-center py-8" style={{ color: "var(--text-3)" }}>No active clients</p>
              ) : clients.map(c => (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-medium truncate" style={{ color: "var(--text-1)" }}>{c.full_name}</p>
                    {c.company_name && <p className="text-[11px] truncate" style={{ color: "var(--text-3)" }}>{c.company_name}</p>}
                  </div>
                  <div className="relative shrink-0">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] font-medium" style={{ color: "var(--text-3)" }}>£</span>
                    <input
                      type="number" min="0" step="0.01"
                      placeholder="0.00"
                      value={amounts[c.id] ?? ""}
                      onChange={e => setAmounts(p => ({ ...p, [c.id]: e.target.value }))}
                      className="w-28 pl-6 pr-2 py-1.5 rounded-lg text-[12.5px] text-right focus:outline-none tabular-nums"
                      style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-1)" }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {result && (
              <div className="mx-6 mb-1 px-3 py-2 rounded-lg text-[12px] font-medium"
                style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}>
                Created {result.created} fees{result.skipped > 0 ? `, ${result.skipped} already billed` : ""}.
              </div>
            )}

            <div className="px-6 py-4 shrink-0 flex gap-2" style={{ borderTop: "1px solid var(--border-2)" }}>
              <button onClick={() => { setOpen(false); setResult(null); }}
                className="flex-1 py-2 rounded-lg text-[13px] font-medium"
                style={{ background: "var(--bg)", color: "var(--text-2)", border: "1px solid var(--border)" }}>
                Close
              </button>
              <button onClick={handleBillAll} disabled={loading}
                className="flex-1 py-2 rounded-lg text-[13px] font-semibold text-white disabled:opacity-50"
                style={{ background: "var(--accent)" }}>
                {loading ? "Creating…" : `Bill ${clients.filter(c => amounts[c.id] && parseFloat(amounts[c.id]) > 0).length} clients`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
