import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import OdemeButon from "./OdemeButon";
import YeniFeeForm from "./YeniFeeForm";

const STATUS: Record<string, { label: string; bg: string; color: string; border: string }> = {
  pending:  { label: "Bekliyor", bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  paid:     { label: "Ödendi",   bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  overdue:  { label: "Gecikmiş", bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
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
      .select("id, full_name, company_name")
      .eq("accountant_id", accountant!.id)
      .eq("status", "active")
      .order("full_name"),
  ]);

  const thisMonth = fees?.filter(f => f.period_month === month && f.period_year === year) ?? [];
  const toplam    = thisMonth.reduce((s, f) => s + Number(f.amount), 0);
  const odenen    = thisMonth.filter(f => f.status === "paid").reduce((s, f) => s + Number(f.amount), 0);
  const bekleyen  = thisMonth.filter(f => f.status === "pending").reduce((s, f) => s + Number(f.amount), 0);
  const gecikmiş  = thisMonth.filter(f => f.status === "overdue").reduce((s, f) => s + Number(f.amount), 0);

  const fmt = (n: number) => n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-1)" }}>Finans</h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--text-3)" }}>
            Hizmet bedeli ve tahsilat takibi
          </p>
        </div>
        <YeniFeeForm clients={clients ?? []} />
      </div>

      {/* Özet kartlar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Bu Ay Toplam",  value: fmt(toplam),   color: "#2563eb", bg: "#eff6ff" },
          { label: "Ödenen",        value: fmt(odenen),   color: "#15803d", bg: "#f0fdf4" },
          { label: "Bekleyen",      value: fmt(bekleyen), color: "#d97706", bg: "#fffbeb" },
          { label: "Gecikmiş",      value: fmt(gecikmiş), color: "#dc2626", bg: "#fef2f2" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="rounded-xl p-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
            <p className="text-[20px] font-bold tracking-tight" style={{ color }}>{value}</p>
            <p className="text-[12px] mt-0.5 font-medium" style={{ color: "var(--text-3)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Tablo */}
      <div className="rounded-xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
        {!fees || fees.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[13px] font-medium" style={{ color: "var(--text-1)" }}>Henüz hizmet bedeli eklenmemiş</p>
            <p className="text-[12px] mt-1" style={{ color: "var(--text-3)" }}>Sağ üstteki "Ekle" butonunu kullanın</p>
          </div>
        ) : (
          <table className="w-full">
            <thead style={{ background: "#fafbfc", borderBottom: "1px solid var(--border)" }}>
              <tr>
                {["Müşteri", "Dönem", "Tutar", "Son Tarih", "Durum", ""].map((h, i) => (
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
                  <tr key={fee.id} className="transition-colors hover:bg-slate-50/60"
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
                      {format(ay, "MMMM yyyy", { locale: tr })}
                    </td>
                    <td className="px-5 py-3 text-[13px] font-semibold tabular-nums" style={{ color: "var(--text-1)" }}>
                      {Number(fee.amount).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                    </td>
                    <td className="px-5 py-3 text-[13px] tabular-nums" style={{ color: "var(--text-3)" }}>
                      {fee.due_date ? format(new Date(fee.due_date), "d MMM yyyy", { locale: tr }) : "-"}
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
                          {format(new Date(fee.paid_at), "d MMM", { locale: tr })}
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
