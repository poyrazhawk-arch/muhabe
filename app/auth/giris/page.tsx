"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function GirisPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError("E-posta gönderilemedi. Lütfen tekrar deneyin.");
    else setSent(true);
    setLoading(false);
  }

  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center p-4"
      style={{
        background: "radial-gradient(ellipse 120% 80% at 50% -10%, #1e3a5f 0%, #0c1524 60%)",
      }}
    >
      {/* Subtle grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative w-full max-w-[360px]">
        {/* Brand mark */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-11 h-11 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", boxShadow: "0 8px 24px rgba(59,130,246,0.35)" }}
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <h1 className="text-[15px] font-semibold text-white tracking-tight">Muhasebe</h1>
          <p className="text-[12px] mt-0.5" style={{ color: "#4b80b8" }}>İş akışı yönetim sistemi</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-7"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 24px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          {sent ? (
            <div className="text-center py-2">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.25)" }}
              >
                <svg className="w-6 h-6" style={{ color: "#4ade80" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h2 className="text-[15px] font-semibold text-white mb-1">E-posta gönderildi</h2>
              <p className="text-[13px] leading-relaxed" style={{ color: "#93c5fd" }}>
                <span className="text-white font-medium">{email}</span> adresine giriş bağlantısı gönderildi.
              </p>
              <p className="text-[12px] mt-3" style={{ color: "#4b80b8" }}>Spam klasörünü de kontrol edin.</p>
            </div>
          ) : (
            <>
              <h2 className="text-[15px] font-semibold text-white mb-0.5">Giriş yap</h2>
              <p className="text-[13px] mb-6" style={{ color: "#7096bb" }}>
                E-postanıza şifresiz bağlantı gönderilecek.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label htmlFor="email" className="block text-[12px] font-medium mb-1.5" style={{ color: "#93c5fd" }}>
                    E-posta adresi
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    className="w-full px-3.5 py-2.5 rounded-lg text-[13px] text-white placeholder:text-[#3d5a78] focus:outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                    onFocus={e => { e.target.style.borderColor = "rgba(59,130,246,0.5)"; e.target.style.background = "rgba(255,255,255,0.09)"; }}
                    onBlur={e  => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.background = "rgba(255,255,255,0.07)"; }}
                  />
                </div>

                {error && (
                  <div
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg"
                    style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" style={{ color: "#fca5a5" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p className="text-[12px]" style={{ color: "#fca5a5" }}>{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-lg text-[13px] font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                  style={{
                    background: loading ? "#1d4ed8" : "linear-gradient(135deg,#3b82f6,#2563eb)",
                    boxShadow: "0 2px 12px rgba(37,99,235,0.4)",
                  }}
                >
                  {loading ? "Gönderiliyor..." : "Bağlantı gönder"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-[11px] mt-5" style={{ color: "rgba(75,128,184,0.6)" }}>
          Veriler AB sunucularında saklanır - KVKK uyumlu
        </p>
      </div>
    </div>
  );
}
