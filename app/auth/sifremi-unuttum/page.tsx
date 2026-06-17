"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { EnvelopeSimple, ArrowLeft, CheckCircle } from "@phosphor-icons/react";

export default function SifremiUnuttumPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState("");

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const redirectTo = `${location.origin}/auth/callback?next=/auth/sifremi-guncelle`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
      setError("E-posta gönderilemedi. Adresi kontrol edin.");
    } else {
      setDone(true);
    }
    setLoading(false);
  }

  const inputBase: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px 10px 36px",
    borderRadius: "8px",
    fontSize: "13px",
    outline: "none",
    transition: "all 0.15s",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--text-1)",
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-8" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-[380px] animate-fade-up">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", boxShadow: "0 2px 8px rgba(37,99,235,0.4)" }}
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <span className="text-[14px] font-bold tracking-tight" style={{ color: "var(--text-1)" }}>Ledger</span>
        </div>

        {done ? (
          /* Başarı ekranı */
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "var(--green-bg)", border: "1px solid var(--green-lt)" }}
            >
              <CheckCircle size={24} weight="fill" style={{ color: "var(--green)" }} />
            </div>
            <h2 className="text-[18px] font-semibold tracking-tight mb-2" style={{ color: "var(--text-1)" }}>
              E-posta gönderildi
            </h2>
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-3)" }}>
              <strong style={{ color: "var(--text-2)" }}>{email}</strong> adresine şifre sıfırlama bağlantısı gönderdik.
              Gelen kutunuzu kontrol edin.
            </p>
            <p className="text-[12px] mt-3" style={{ color: "var(--text-3)" }}>
              Spam klasörünü de kontrol edin.
            </p>
            <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--border-2)" }}>
              <a
                href="/auth/giris"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium"
                style={{ color: "var(--accent)" }}
              >
                <ArrowLeft size={13} weight="bold" />
                Giriş sayfasına dön
              </a>
            </div>
          </div>
        ) : (
          /* Form */
          <>
            <h1 className="text-[22px] font-semibold tracking-tight mb-1" style={{ color: "var(--text-1)" }}>
              Şifremi unuttum
            </h1>
            <p className="text-[13px] mb-7" style={{ color: "var(--text-3)" }}>
              E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.
            </p>

            <div
              className="rounded-xl p-5"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
                    E-posta adresi
                  </label>
                  <div className="relative">
                    <EnvelopeSimple
                      size={14}
                      style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }}
                    />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="ornek@firma.com"
                      style={inputBase}
                      onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.08)"; }}
                      onBlur={e  => { e.target.style.borderColor = "var(--border)";  e.target.style.background = "var(--surface-2)"; e.target.style.boxShadow = "none"; }}
                    />
                  </div>
                </div>

                {error && (
                  <div
                    className="px-3.5 py-2.5 rounded-lg text-[12px]"
                    style={{ background: "var(--red-bg)", border: "1px solid var(--red-lt)", color: "var(--red)" }}
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center py-2.5 rounded-lg text-[13px] font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
                  style={{ background: "var(--accent)", boxShadow: "0 1px 3px rgba(37,99,235,0.3), 0 2px 10px rgba(37,99,235,0.15)" }}
                >
                  {loading ? "Gönderiliyor..." : "Sıfırlama bağlantısı gönder"}
                </button>
              </form>
            </div>

            <div className="mt-5 text-center">
              <a
                href="/auth/giris"
                className="inline-flex items-center gap-1.5 text-[12px] font-medium"
                style={{ color: "var(--text-3)" }}
              >
                <ArrowLeft size={12} weight="bold" />
                Giriş sayfasına dön
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
