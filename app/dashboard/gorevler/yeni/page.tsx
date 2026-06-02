"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function YeniGorevPage() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/musteriler").then(r => r.json()).then(setClients);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
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
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Yeni Görev</h1>
        <p className="text-slate-500 text-sm mt-1">Hatırlatmalar otomatik oluşturulur (7, 3, 1 gün önce)</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Başlık *</label>
            <input name="title" required placeholder="KDV Beyannamesi" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
            <textarea name="description" rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Son Tarih *</label>
              <input name="due_date" type="date" required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Öncelik</label>
              <select name="priority" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="normal">Normal</option>
                <option value="high">Yüksek</option>
                <option value="critical">Kritik</option>
                <option value="low">Düşük</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Müşteri (opsiyonel)</label>
            <select name="client_id" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">— Müşteri seçin —</option>
              {clients.map((c: any) => (
                <option key={c.id} value={c.id}>{c.full_name} {c.company_name ? `(${c.company_name})` : ""}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <button type="button" onClick={() => router.back()} className="px-6 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
