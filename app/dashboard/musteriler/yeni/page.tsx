"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function YeniMusteriPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const res = await fetch("/api/musteriler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push("/dashboard/musteriler");
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
        <h1 className="text-2xl font-bold text-slate-900">Yeni Müşteri</h1>
        <p className="text-slate-500 text-sm mt-1">Müşteri bilgilerini doldurun</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field name="full_name" label="Ad Soyad *" required placeholder="Ahmet Yılmaz" />
          <Field name="company_name" label="Firma Adı" placeholder="ABC Ltd. Şti." />
          <Field name="tax_number" label="Vergi Numarası" placeholder="1234567890" />
          <Field name="email" label="E-posta" type="email" placeholder="ahmet@firma.com" />
          <Field name="phone" label="Telefon" placeholder="0532 000 00 00" />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notlar</label>
            <textarea
              name="notes"
              rows={3}
              placeholder="İsteğe bağlı notlar..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  name, label, required, placeholder, type = "text"
}: {
  name: string; label: string; required?: boolean;
  placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
