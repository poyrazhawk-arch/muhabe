"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "@phosphor-icons/react";
import { useDict } from "@/lib/i18n/LocaleContext";

type Client = { id: string; full_name: string; company_name?: string };

export default function YeniFeeForm({ clients }: { clients: Client[] }) {
  const t = useDict().finans;
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({
    client_id: "", amount: "", period_month: String(new Date().getMonth() + 1),
    period_year: String(new Date().getFullYear()), due_date: "", notes: "",
  });
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/service-fees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        amount: parseFloat(form.amount),
        period_month: parseInt(form.period_month),
        period_year: parseInt(form.period_year),
      }),
    });
    setLoading(false);
    if (res.ok) { setOpen(false); router.refresh(); }
  }

  const months = [
    t.monthJan, t.monthFeb, t.monthMar, t.monthApr, t.monthMay, t.monthJun,
    t.monthJul, t.monthAug, t.monthSep, t.monthOct, t.monthNov, t.monthDec,
  ];

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold text-white active:scale-[0.98] transition-all"
        style={{ background: "var(--accent)", boxShadow: "0 2px 8px rgba(37,99,235,0.28)" }}>
        <Plus size={14} weight="bold" />
        {t.addFee}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-md rounded-2xl p-6"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <h2 className="text-[15px] font-semibold mb-4" style={{ color: "var(--text-1)" }}>
              {t.addServiceFee}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[12px] font-medium mb-1" style={{ color: "var(--text-2)" }}>{t.client}</label>
                <select required value={form.client_id} onChange={e => setForm(p => ({ ...p, client_id: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-[13px] focus:outline-none"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-1)" }}>
                  <option value="">{t.selectClient}</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}{c.company_name ? ` — ${c.company_name}` : ""}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium mb-1" style={{ color: "var(--text-2)" }}>{t.amountGbp}</label>
                  <input required type="number" min="0" step="0.01" value={form.amount}
                    onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                    placeholder="1500"
                    className="w-full px-3 py-2 rounded-lg text-[13px] focus:outline-none"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-1)" }}/>
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-1" style={{ color: "var(--text-2)" }}>{t.dueDate}</label>
                  <input type="date" value={form.due_date}
                    onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-[13px] focus:outline-none"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-1)" }}/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium mb-1" style={{ color: "var(--text-2)" }}>{t.month}</label>
                  <select value={form.period_month} onChange={e => setForm(p => ({ ...p, period_month: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-[13px] focus:outline-none"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-1)" }}>
                    {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-1" style={{ color: "var(--text-2)" }}>{t.year}</label>
                  <input type="number" value={form.period_year}
                    onChange={e => setForm(p => ({ ...p, period_year: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-[13px] focus:outline-none"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-1)" }}/>
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1" style={{ color: "var(--text-2)" }}>{t.notesOptional}</label>
                <input type="text" value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder={t.additionalInfoPlaceholder}
                  className="w-full px-3 py-2 rounded-lg text-[13px] focus:outline-none"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-1)" }}/>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 py-2 rounded-lg text-[13px] font-medium transition-colors"
                  style={{ background: "var(--bg)", color: "var(--text-2)", border: "1px solid var(--border)" }}>
                  {t.cancel}
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2 rounded-lg text-[13px] font-semibold text-white transition-all disabled:opacity-50"
                  style={{ background: "var(--accent)" }}>
                  {loading ? t.saving : t.saveFee}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
