import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function MusterilerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: accountant } = await supabase
    .from("accountants").select("id").eq("user_id", user!.id).single();

  const { data: clients } = await supabase
    .from("clients").select("*").eq("accountant_id", accountant!.id)
    .neq("status", "archived").order("full_name");

  const aktif = clients?.filter(c => c.status === "active").length ?? 0;
  const pasif = clients?.filter(c => c.status === "passive").length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>Müşteriler</h1>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
            {aktif} aktif{pasif > 0 ? `, ${pasif} pasif` : ""}
          </p>
        </div>
        <Link href="/dashboard/musteriler/yeni"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#3b82f6,#2563eb)", boxShadow: "0 4px 14px rgba(59,130,246,0.35)" }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          Yeni Müşteri
        </Link>
      </div>

      {/* Tablo */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        {!clients || clients.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "#f1f5f9" }}>
              <svg className="w-7 h-7" style={{ color: "#94a3b8" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: "#0f172a" }}>Henüz müşteri eklenmemiş</p>
            <p className="text-xs mt-1 mb-4" style={{ color: "#94a3b8" }}>İlk müşterinizi ekleyerek başlayın</p>
            <Link href="/dashboard/musteriler/yeni"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg,#3b82f6,#2563eb)" }}>
              Müşteri Ekle
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
              <tr>
                {["Müşteri", "Firma", "İletişim", "Durum", ""].map((h, i) => (
                  <th key={i} className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wide ${i === 4 ? "text-right" : "text-left"}`}
                    style={{ color: "#94a3b8", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((client, idx) => (
                <tr key={client.id} className="group transition-colors"
                  style={{ borderTop: idx > 0 ? "1px solid #f8fafc" : "none" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ background: "#eff6ff", color: "#3b82f6" }}>
                        {client.full_name.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold" style={{ color: "#0f172a" }}>{client.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: "#64748b" }}>{client.company_name ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <div className="text-sm" style={{ color: "#64748b" }}>{client.email ?? "—"}</div>
                    {client.phone && <div className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>{client.phone}</div>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={client.status === "active"
                        ? { background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }
                        : { background: "#f8fafc", color: "#94a3b8", border: "1px solid #e2e8f0" }}>
                      <span className="w-1.5 h-1.5 rounded-full"
                        style={{ background: client.status === "active" ? "#22c55e" : "#cbd5e1" }} />
                      {client.status === "active" ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/dashboard/musteriler/${client.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      style={{ color: "#3b82f6", background: "#eff6ff" }}>
                      Detay
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
