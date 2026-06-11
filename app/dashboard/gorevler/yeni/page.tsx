"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";

const inputStyle = {
  background: "var(--bg)",
  border: "1px solid var(--border)",
  color: "var(--text-1)",
} as React.CSSProperties;

export default function YeniGorevPage() {
  const router  = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    fetch("/api/musteriler").then(r => r.json()).then(setClients);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const data: any = Object.fromEntries(new FormData(e.currentTarget).entries());
    if (!data.client_id) delete data.client_id;
    const res = await fetch("/api/gorevler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, reminders: [7, 3, 1] }),
    });
    if (res.ok) {
      router.push("/dashboard/gorevler");
      router.refresh();
    } else {
      const json = await res.json();
      setError(json.hata ?? "Bir hata oluştu");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl animate-fade-up">
      <div className="mb-5">
        <Link href="/dashboard/gorevler" className="inline-flex items-center gap-1.5 text-[12px] font-medium mb-3"
          style={{ color: "var(--text-3)" }}>
          <ArrowLeft size={13} weight="bold" />
          Görevler
        </Link>
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-1)" }}>Yeni Görev</h1>
        <p className="text-[13px] mt-0.5" style={{ color: "var(--text-3)" }}>
          Hatırlatmalar otomatik oluşturulur (7, 3, 1 gün önce)
        </p>
      </div>

      <div className="rounded-xl p-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
              Başlık <span style={{ color: "var(--accent)" }}>*</span>
            </label>
            <input name="title" required placeholder="KDV Beyannamesi"
              className="w-full px-3 py-2.5 rounded-lg text-[13px] focus:outline-none transition-colors" style={inputStyle}
              onFocus={e => { e.target.style.borderColor = "var(--accent)"; }}
              onBlur={e  => { e.target.style.borderColor = "var(--border)"; }}
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>Açıklama</label>
            <textarea name="description" rows={2}
              className="w-full px-3 py-2.5 rounded-lg text-[13px] focus:outline-none resize-none transition-colors" style={inputStyle}
              onFocus={e => { e.target.style.borderColor = "var(--accent)"; }}
              onBlur={e  => { e.target.style.borderColor = "var(--border)"; }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
                Son Tarih <span style={{ color: "var(--accent)" }}>*</span>
              </label>
              <input name="due_date" type="date" required
                className="w-full px-3 py-2.5 rounded-lg text-[13px] focus:outline-none transition-colors" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = "var(--accent)"; }}
                onBlur={e  => { e.target.style.borderColor = "var(--border)"; }}
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>Öncelik</label>
              <select name="priority"
                className="w-full px-3 py-2.5 rounded-lg text-[13px] focus:outline-none transition-colors" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = "var(--accent)"; }}
                onBlur={e  => { e.target.style.borderColor = "var(--border)"; }}
              >
                <option value="normal">Normal</option>
                <option value="high">Yüksek</option>
                <option value="critical">Kritik</option>
                <option value="low">Düşük</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>Müşteri (opsiyonel)</label>
            <select name="client_id"
              className="w-full px-3 py-2.5 rounded-lg text-[13px] focus:outline-none transition-colors" style={inputStyle}
              onFocus={e => { e.target.style.borderColor = "var(--accent)"; }}
              onBlur={e  => { e.target.style.borderColor = "var(--border)"; }}
            >
              <option value="">Müşteri seçin (opsiyonel)</option>
              {clients.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}{c.company_name ? ` — ${c.company_name}` : ""}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="px-3 py-2.5 rounded-lg text-[12px]"
              style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}>
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={loading}
              className="px-5 py-2 rounded-lg text-[13px] font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-50"
              style={{ background: "var(--accent)" }}>
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <button type="button" onClick={() => router.back()}
              className="px-5 py-2 rounded-lg text-[13px] font-medium transition-colors"
              style={{ color: "var(--text-2)", background: "var(--bg)", border: "1px solid var(--border)" }}>
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
