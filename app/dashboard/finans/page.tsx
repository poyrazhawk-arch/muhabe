import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import OdemeButon from "./OdemeButon";
import YeniFeeForm from "./YeniFeeForm";
import BillAllButton from "./BillAllButton";

const STATUS: Record<string, { label: string; bg: string; color: string; border: string }> = {
  pending:  { label: "Pending", bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  paid:     { label: "Paid",    bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  overdue:  { label: "Overdue", bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
};

export default async function FinansPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: accountant } = await supabase
    .from("accountants").select("id").eq("user_id", user!.id).single();

  const now   = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();

  const [{ data: fees }, { data: clients }] = await Promise.all([
    supabase.from("service_fees")
      .select("*, clients(full_name, company_name)")
      .eq("accountant_id", accountant!.id)
      .order("period_year", { ascending: false })
      .order("period_month", { ascending: false }),
    supabase.from("clients")
      .select("id, full_name, company_name, monthly_fee")
      .eq("accountant_id", accountant!.id)
      .eq("status", "active")
      .order("full_name"),
  ]);

  const thisMonth = fees?.filter(f => f.period_month === month && f.period_year === year) ?? [];
  const toplam    = thisMonth.reduce((s, f) => s + Number(f.amount), 0);
  const odenen    = thisMonth.filter(f => f.status === "paid").reduce((s, f) => s + Number(f.amount), 0);
  const bekleyen  = thisMonth.filter(f => f.status === "pending").reduce((s, f) => s + Number(f.amount), 0);
  const gecikmiş  = thisMonth.filter(f => f.status === "overdue").reduce((s, f) => s + Number(f.amount), 0);

  const fmt = (n: number) => n.toLocaleString("en-GB", { style: "currency", currency: "GBP" });

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-semibold tracking-tight"
            style={{ fontSize: "20px", letterSpacing: "-0.03em", color: "var(--text-1)" }}>
            Finance
          </h1>
          <p className="text-[12.5px] mt-0.5" style={{ color: "var(--text-3)" }}>
            Service fees · {format(new Date(), "MMMM yyyy", { locale: enUS })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BillAllButton clients={clients ?? []} />
          <YeniFeeForm clients={clients ?? []} />
        </div>
      </div>

      {/* Metric strip */}
      <div className="rounded-xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {[
            { label: "This Month",  value: fmt(toplam),   numColor: "var(--text-1)",  bg: "transparent" },
            { label: "Paid",        value: fmt(odenen),   numColor: "#15803d",         bg: "transparent" },
            { label: "Pending",     value: fmt(bekleyen), numColor: "#d97706",         bg: "transparent" },
            { label: "Overdue",     value: fmt(gecikmiş), numColor: gecikmiş > 0 ? "#dc2626" : "var(--text-3)", bg: gecikmiş > 0 ? "var(--red-bg)" : "transparent" },
          ].map(({ label, value, numColor, bg }, i) => (
            <div key={label} className="px-5 py-4"
              style={{
                borderRight: i < 3 ? "1px solid var(--border-2)" : "none",
                background: bg,
              }}>
              <p className="tabular-nums leading-none"
                style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "-0.04em", color: numColor, marginBottom: 6 }}>
                {value}
              </p>
              <p className="text-[11.5px] font-medium" style={{ color: "var(--text-3)" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tablo */}
      <div className="rounded-xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
        {!fees || fees.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[13px] font-medium" style={{ color: "var(--text-1)" }}>No service fees yet</p>
            <p className="text-[12px] mt-1" style={{ color: "var(--text-3)" }}>Use the &quot;Add fee&quot; button above to get started</p>
          </div>
        ) : (
          <table className="w-full">
            <thead style={{ background: "#fafbfc", borderBottom: "1px solid var(--border)" }}>
              <tr>
                {["Client", "Period", "Amount", "Due Date", "Status", ""].map((h, i) => (
                  <th key={i} className={`px-5 py-3 text-[11px] font-semibold uppercase tracking-wider ${i === 5 ? "text-right" : "text-left"}`}
                    style={{ color: "var(--text-3)", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fees.map((fee: any, idx: number) => {
                const s = STATUS[fee.status] ?? STATUS.pending;
                const client = fee.clients;
                const ay = new Date(fee.period_year, fee.period_month - 1, 1);
                return (
                  <tr key={fee.id}
                    className="group transition-colors duration-100 hover:bg-[var(--surface-2)]"
                    style={{ borderTop: idx > 0 ? "1px solid var(--border-2)" : "none" }}>
                    <td className="px-5 py-3">
                      <p className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>
                        {client?.full_name ?? "-"}
                      </p>
                      {client?.company_name && (
                        <p className="text-[11px]" style={{ color: "var(--text-3)" }}>{client.company_name}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-[13px] tabular-nums" style={{ color: "var(--text-2)" }}>
                      {format(ay, "MMMM yyyy", { locale: enUS })}
                    </td>
                    <td className="px-5 py-3 text-[13px] font-semibold tabular-nums" style={{ color: "var(--text-1)" }}>
                      {Number(fee.amount).toLocaleString("en-GB", { style: "currency", currency: "GBP" })}
                    </td>
                    <td className="px-5 py-3 text-[13px] tabular-nums" style={{ color: "var(--text-3)" }}>
                      {fee.due_date ? format(new Date(fee.due_date), "d MMM yyyy", { locale: enUS }) : "-"}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                        style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {fee.status === "pending" && <OdemeButon feeId={fee.id} />}
                      {fee.status === "paid" && fee.paid_at && (
                        <span className="text-[11px]" style={{ color: "var(--text-3)" }}>
                          {format(new Date(fee.paid_at), "d MMM", { locale: enUS })}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
