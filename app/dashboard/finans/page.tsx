import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import OdemeButon from "./OdemeButon";
import YeniFeeForm from "./YeniFeeForm";
import BillAllButton from "./BillAllButton";
import SendInvoiceButton from "./SendInvoiceButton";
import RemindOverdueButton from "./RemindOverdueButton";

const S: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending: { label: "Pending", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  paid:    { label: "Paid",    color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
  overdue: { label: "Overdue", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
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
      .select("*, clients(full_name, company_name, email, portal_token)")
      .eq("accountant_id", accountant!.id)
      .order("status")
      .order("period_year", { ascending: false })
      .order("period_month", { ascending: false }),
    supabase.from("clients")
      .select("id, full_name, company_name, monthly_fee")
      .eq("accountant_id", accountant!.id)
      .eq("status", "active")
      .order("full_name"),
  ]);

  const thisMonth   = fees?.filter(f => f.period_month === month && f.period_year === year) ?? [];
  const toplam      = thisMonth.reduce((s, f) => s + Number(f.amount), 0);
  const odenen      = thisMonth.filter(f => f.status === "paid").reduce((s, f) => s + Number(f.amount), 0);
  const bekleyen    = thisMonth.filter(f => f.status === "pending").reduce((s, f) => s + Number(f.amount), 0);
  const gecikmiş    = thisMonth.filter(f => f.status === "overdue").reduce((s, f) => s + Number(f.amount), 0);
  const overdueFees = (fees ?? []).filter((f: any) => f.status === "overdue" && f.clients?.email)
    .map((f: any) => ({ id: f.id, email: f.clients.email }));

  const fmt = (n: number) => n.toLocaleString("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });

  return (
    <div className="space-y-5 animate-fade-up">

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 6 }}>
            Finance · {format(now, "MMMM yyyy", { locale: enUS })}
          </p>
          <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.055em", color: "var(--text-1)", lineHeight: 1 }}>
            {fmt(toplam)}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, alignSelf: "flex-end" }}>
          {overdueFees.length > 0 && <RemindOverdueButton overdueFees={overdueFees} />}
          <BillAllButton clients={clients ?? []} />
          <YeniFeeForm clients={clients ?? []} />
        </div>
      </div>

      {/* Metric strip — naked stats, Linear style */}
      <div style={{
        display: "flex", gap: 0,
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 12, overflow: "hidden",
      }}>
        {[
          { label: "Paid",    value: fmt(odenen),   color: "#15803d", pct: toplam > 0 ? (odened: number) => odened / toplam : null },
          { label: "Pending", value: fmt(bekleyen), color: "#d97706" },
          { label: "Overdue", value: fmt(gecikmiş), color: gecikmiş > 0 ? "#dc2626" : "var(--text-3)", alert: gecikmiş > 0 },
        ].map(({ label, value, color, alert }, i) => (
          <div key={label} style={{
            flex: 1, padding: "16px 20px",
            borderLeft: i > 0 ? "1px solid var(--border-2)" : "none",
            background: alert ? "rgba(220,38,38,0.025)" : "transparent",
          }}>
            <p style={{
              fontSize: 22, fontWeight: 800, letterSpacing: "-0.045em",
              color, lineHeight: 1, marginBottom: 5, fontVariantNumeric: "tabular-nums",
            }}>
              {value}
            </p>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-3)" }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {toplam > 0 && (
        <div style={{ height: 3, borderRadius: 99, background: "var(--surface-3)", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 99,
            background: "#16a34a",
            width: `${(odenen / toplam) * 100}%`,
            transition: "width 0.6s cubic-bezier(0.22,1,0.36,1)",
          }} />
        </div>
      )}

      {/* Table */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow-sm)",
      }}>
        {!fees || fees.length === 0 ? (
          <div style={{ padding: "56px 20px", textAlign: "center" }}>
            <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-1)" }}>No service fees yet</p>
            <p style={{ fontSize: 12.5, marginTop: 4, color: "var(--text-3)" }}>
              Use &quot;Add fee&quot; above to get started
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
                {["", "Client", "Period", "Amount", "Status", ""].map((h, i) => (
                  <th key={i}
                    style={{
                      padding: "9px 14px",
                      fontSize: 10.5, fontWeight: 600, letterSpacing: "0.07em",
                      textTransform: "uppercase", color: "var(--text-3)",
                      textAlign: i === 5 ? "right" : "left",
                      width: i === 0 ? 3 : undefined,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fees.map((fee: any, idx: number) => {
                const s      = S[fee.status] ?? S.pending;
                const client = fee.clients;
                const ay     = new Date(fee.period_year, fee.period_month - 1, 1);
                const isOverdue = fee.status === "overdue";

                return (
                  <tr
                    key={fee.id}
                    className="group"
                    style={{
                      borderTop: idx > 0 ? "1px solid var(--border-2)" : "none",
                      background: isOverdue ? "rgba(220,38,38,0.025)" : "transparent",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = isOverdue ? "rgba(220,38,38,0.055)" : "var(--surface-2)")}
                    onMouseLeave={e => (e.currentTarget.style.background = isOverdue ? "rgba(220,38,38,0.025)" : "transparent")}
                  >
                    {/* Status stripe */}
                    <td style={{ padding: 0, width: 3 }}>
                      <div style={{
                        width: 3, minHeight: 44, height: "100%",
                        background: isOverdue ? "#dc2626" : fee.status === "paid" ? "#16a34a44" : "transparent",
                      }} />
                    </td>

                    {/* Client */}
                    <td style={{ padding: "11px 14px" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", letterSpacing: "-0.01em" }}>
                        {client?.full_name ?? "—"}
                      </p>
                      {client?.company_name && (
                        <p style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 1 }}>
                          {client.company_name}
                        </p>
                      )}
                    </td>

                    {/* Period */}
                    <td style={{ padding: "11px 14px", fontSize: 12.5, color: "var(--text-3)", fontVariantNumeric: "tabular-nums" }}>
                      {format(ay, "MMM yyyy", { locale: enUS })}
                    </td>

                    {/* Amount */}
                    <td style={{
                      padding: "11px 14px",
                      fontSize: 13.5, fontWeight: 700, letterSpacing: "-0.03em",
                      color: "var(--text-1)", fontVariantNumeric: "tabular-nums",
                    }}>
                      {Number(fee.amount).toLocaleString("en-GB", { style: "currency", currency: "GBP" })}
                    </td>

                    {/* Status */}
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        fontSize: 11, fontWeight: 600,
                        padding: "3px 8px", borderRadius: 20,
                        background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                      }}>
                        <span style={{
                          width: 5, height: 5, borderRadius: "50%",
                          background: s.color, flexShrink: 0,
                        }} />
                        {s.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "11px 16px" }}>
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6,
                        opacity: isOverdue ? 1 : undefined,
                      }}
                        className={isOverdue ? undefined : "opacity-0 group-hover:opacity-100 transition-opacity"}
                      >
                        {fee.status === "paid" && fee.paid_at && (
                          <span style={{ fontSize: 11, color: "var(--text-3)", fontVariantNumeric: "tabular-nums" }}>
                            {format(new Date(fee.paid_at), "d MMM", { locale: enUS })}
                          </span>
                        )}
                        {fee.status !== "paid" && (
                          <>
                            <SendInvoiceButton feeId={fee.id} clientEmail={client?.email} isOverdue={isOverdue} />
                            {fee.status === "pending" && <OdemeButon feeId={fee.id} />}
                          </>
                        )}
                      </div>
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
