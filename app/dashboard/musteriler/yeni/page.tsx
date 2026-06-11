"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function YeniMusteriPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const res  = await fetch("/api/musteriler", {
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
    <div className="max-w-xl animate-fade-up">
      <div className="mb-5">
        <Link href="/dashboard/musteriler" className="inline-flex items-center gap-1 text-[12px] font-medium mb-3"
          style={{ color: "var(--text-3)" }}>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
          </svg>
          Müşteriler
        </Link>
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-1)" }}>Yeni Müşteri</h1>
        <p className="text-[13px] mt-0.5" style={{ color: "var(--text-3)" }}>Müşteri bilgilerini doldurun</p>
      </div>

      <div className="rounded-xl p-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field name="full_name"    label="Ad Soyad"       required placeholder="Ahmet Yılmaz" />
          <Field name="company_name" label="Firma Adı"               placeholder="ABC Ltd. Şti." />
          <Field name="tax_number"   label="Vergi Numarası"           placeholder="1234567890" />
          <Field name="email"        label="E-posta"        type="email" placeholder="ahmet@firma.com" />
          <Field name="phone"        label="Telefon"                  placeholder="0532 000 00 00" />

          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>Notlar</label>
            <textarea name="notes" rows={3} placeholder="İsteğe bağlı notlar..."
              className="w-full px-3 py-2.5 rounded-lg text-[13px] focus:outline-none resize-none transition-colors"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-1)" }}
              onFocus={e => { e.target.style.borderColor = "var(--accent)"; }}
              onBlur={e  => { e.target.style.borderColor = "var(--border)"; }}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[12px]"
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

function Field({ name, label, required, placeholder, type = "text" }: {
  name: string; label: string; required?: boolean; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
        {label}{required && <span style={{ color: "var(--accent)" }}> *</span>}
      </label>
      <input id={name} name={name} type={type} required={required} placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-lg text-[13px] focus:outline-none transition-colors"
        style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-1)" }}
        onFocus={e => { e.target.style.borderColor = "var(--accent)"; }}
        onBlur={e  => { e.target.style.borderColor = "var(--border)"; }}
      />
    </div>
  );
}
