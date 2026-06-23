"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Users, Warning, CheckCircle, ArrowRight, X } from "@phosphor-icons/react";

type Client = { id: string; full_name: string; company_name?: string | null; monthly_fee?: number | null };

const SPRING = { type: "spring" as const, stiffness: 380, damping: 32 };
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function BillAllButton({ clients }: { clients: Client[] }) {
  const [open, setOpen]             = useState(false);
  const [loading, setLoading]       = useState(false);
  const [overdueLoading, setOL]     = useState(false);
  const [result, setResult]         = useState<{ created: number; skipped: number } | null>(null);
  const [amounts, setAmounts]       = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    clients.forEach(c => { m[c.id] = c.monthly_fee ? String(c.monthly_fee) : ""; });
    return m;
  });
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear]   = useState(String(new Date().getFullYear()));
  const [dueDate, setDueDate] = useState("");
  const router = useRouter();

  const readyCount = clients.filter(c => amounts[c.id] && parseFloat(amounts[c.id]) > 0).length;
  const totalAmount = clients
    .filter(c => amounts[c.id] && parseFloat(amounts[c.id]) > 0)
    .reduce((s, c) => s + parseFloat(amounts[c.id]), 0);

  async function handleBillAll() {
    setLoading(true);
    setResult(null);
    const items = clients
      .filter(c => amounts[c.id] && parseFloat(amounts[c.id]) > 0)
      .map(c => ({ client_id: c.id, amount: parseFloat(amounts[c.id]) }));

    const res = await fetch("/api/service-fees/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        period_month: parseInt(month),
        period_year:  parseInt(year),
        due_date:     dueDate || undefined,
        items,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) { setResult(data); router.refresh(); }
  }

  async function handleMarkOverdue() {
    setOL(true);
    await fetch("/api/service-fees/mark-overdue", { method: "POST" });
    setOL(false);
    router.refresh();
  }

  function closeModal() {
    if (loading) return;
    setOpen(false);
    setResult(null);
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Mark overdue */}
        <motion.button
          onClick={handleMarkOverdue}
          disabled={overdueLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all disabled:opacity-50"
          style={{ background: "var(--red-bg)", color: "var(--red)", border: "1px solid var(--red-border)" }}
        >
          <Warning size={12} weight="fill" />
          {overdueLoading ? "Updating…" : "Mark overdue"}
        </motion.button>

        {/* Bill all */}
        <motion.button
          onClick={() => setOpen(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all"
          style={{ background: "var(--surface-2)", color: "var(--text-1)", border: "1px solid var(--border)" }}
        >
          <Users size={13} weight="bold" />
          Bill all clients
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeModal}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.48)", backdropFilter: "blur(2px)" }}
            />

            {/* Panel */}
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={SPRING}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="w-full max-w-lg rounded-2xl flex flex-col pointer-events-auto"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 24px 64px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.12)",
                  maxHeight: "90vh",
                }}
              >
                {/* Header */}
                <div className="px-6 pt-5 pb-4 shrink-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-[15px] font-semibold tracking-tight" style={{ color: "var(--text-1)", letterSpacing: "-0.02em" }}>
                        Bill all clients
                      </h2>
                      <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "var(--text-3)" }}>
                        Creates a pending fee per client. Already-billed clients are skipped.
                      </p>
                    </div>
                    <motion.button
                      onClick={closeModal}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg shrink-0 ml-3"
                      style={{ background: "var(--surface-2)", color: "var(--text-3)", border: "1px solid var(--border)" }}
                    >
                      <X size={13} weight="bold" />
                    </motion.button>
                  </div>

                  {/* Period row */}
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {[
                      {
                        label: "Month",
                        el: (
                          <select value={month} onChange={e => setMonth(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg text-[12.5px] focus:outline-none"
                            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-1)" }}>
                            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                          </select>
                        ),
                      },
                      {
                        label: "Year",
                        el: (
                          <input type="number" value={year} onChange={e => setYear(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg text-[12.5px] focus:outline-none tabular-nums"
                            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-1)" }} />
                        ),
                      },
                      {
                        label: "Due date",
                        el: (
                          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg text-[12.5px] focus:outline-none"
                            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-1)" }} />
                        ),
                      },
                    ].map(({ label, el }) => (
                      <div key={label}>
                        <label className="block text-[10.5px] font-medium mb-1.5"
                          style={{ color: "var(--text-3)" }}>{label}</label>
                        {el}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Divider + column headers */}
                <div className="px-6 py-2 shrink-0 flex items-center justify-between"
                  style={{ borderTop: "1px solid var(--border-2)", background: "var(--bg)" }}>
                  <span className="text-[10.5px] font-medium" style={{ color: "var(--text-3)" }}>Client</span>
                  <span className="text-[10.5px] font-medium" style={{ color: "var(--text-3)" }}>Amount (GBP)</span>
                </div>

                {/* Client list */}
                <div className="flex-1 overflow-auto px-6 py-3 space-y-2">
                  {clients.length === 0 ? (
                    <p className="text-[13px] text-center py-8" style={{ color: "var(--text-3)" }}>No active clients</p>
                  ) : clients.map((c, i) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.025, duration: 0.2 }}
                      className="flex items-center gap-3 py-1"
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold"
                        style={{ background: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border)" }}>
                        {c.full_name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-medium truncate" style={{ color: "var(--text-1)" }}>{c.full_name}</p>
                        {c.company_name && (
                          <p className="text-[11px] truncate" style={{ color: "var(--text-3)" }}>{c.company_name}</p>
                        )}
                      </div>
                      <div className="relative shrink-0">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] font-medium pointer-events-none"
                          style={{ color: "var(--text-3)" }}>£</span>
                        <input
                          type="number" min="0" step="0.01" placeholder="—"
                          value={amounts[c.id] ?? ""}
                          onChange={e => setAmounts(p => ({ ...p, [c.id]: e.target.value }))}
                          className="w-28 pl-6 pr-2.5 py-1.5 rounded-lg text-[12.5px] text-right focus:outline-none tabular-nums transition-all"
                          style={{
                            background: "var(--bg)",
                            border: `1px solid ${amounts[c.id] ? "var(--accent)" : "var(--border)"}`,
                            color: "var(--text-1)",
                          }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Result banner */}
                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mx-6 mb-1 overflow-hidden"
                    >
                      <div className="px-4 py-2.5 rounded-xl flex items-center gap-2"
                        style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                        <CheckCircle size={14} weight="fill" className="shrink-0" style={{ color: "#16a34a" }} />
                        <p className="text-[12px] font-medium" style={{ color: "#15803d" }}>
                          {result.created} fees created
                          {result.skipped > 0 && `, ${result.skipped} already billed`}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Footer */}
                <div className="px-6 py-4 shrink-0 flex items-center gap-3"
                  style={{ borderTop: "1px solid var(--border-2)" }}>
                  {/* Summary */}
                  <div className="flex-1">
                    {readyCount > 0 && (
                      <p className="text-[12px]" style={{ color: "var(--text-3)" }}>
                        <span className="font-semibold tabular-nums" style={{ color: "var(--text-1)" }}>{readyCount}</span> clients ·{" "}
                        <span className="font-semibold tabular-nums" style={{ color: "var(--text-1)" }}>
                          {totalAmount.toLocaleString("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 })}
                        </span>
                      </p>
                    )}
                  </div>
                  <motion.button
                    onClick={closeModal}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="px-4 py-2 rounded-xl text-[13px] font-medium"
                    style={{ background: "var(--bg)", color: "var(--text-2)", border: "1px solid var(--border)" }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleBillAll}
                    disabled={loading || readyCount === 0}
                    whileHover={readyCount > 0 ? { scale: 1.02 } : {}}
                    whileTap={readyCount > 0 ? { scale: 0.97 } : {}}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white disabled:opacity-40 transition-all"
                    style={{ background: "var(--accent)", boxShadow: readyCount > 0 ? "0 2px 8px rgba(37,99,235,0.28)" : "none" }}
                  >
                    {loading ? (
                      <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                        Creating…
                      </motion.span>
                    ) : (
                      <>
                        Generate bills
                        <ArrowRight size={13} weight="bold" />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
