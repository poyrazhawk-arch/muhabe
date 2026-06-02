"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function GirisPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError("Giriş bağlantısı gönderilemedi. Lütfen tekrar deneyin.");
    else setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)" }}>
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", boxShadow: "0 8px 32px rgba(59,130,246,0.4)" }}>
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Muhasebe</h1>
          <p className="text-sm mt-1" style={{ color: "#93c5fd" }}>İş akışı yönetim sistemi</p>
        </div>

        <div className="rounded-2xl p-8" style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.3)" }}>
                <svg className="w-8 h-8" style={{ color: "#4ade80" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">E-posta gönderildi</h2>
              <p className="text-sm" style={{ color: "#bfdbfe" }}>
                <span className="font-medium text-white">{email}</span> adresine giriş bağlantısı gönderildi.
              </p>
              <p className="text-xs mt-3" style={{ color: "#93c5fd" }}>Spam klasörünü de kontrol edin.</p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-white mb-1">Giriş Yap</h2>
              <p className="text-sm mb-6" style={{ color: "#bfdbfe" }}>E-postanıza şifresiz giriş bağlantısı göndereceğiz.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: "#bfdbfe" }}>
                    E-posta adresi
                  </label>
                  <input
                    id="email" type="email" required value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    className="w-full px-4 py-2.5 rounded-xl text-white text-sm focus:outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)" }}
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                    style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
                    <p className="text-sm" style={{ color: "#fca5a5" }}>{error}</p>
                  </div>
                )}
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", boxShadow: "0 4px 20px rgba(59,130,246,0.4)" }}>
                  {loading ? "Gönderiliyor..." : "Giriş bağlantısı gönder"}
                </button>
              </form>
            </>
          )}
        </div>
        <p className="text-center text-xs mt-6" style={{ color: "rgba(147,197,253,0.5)" }}>
          © 2026 Muhasebe · Veriler AB sunucularında saklanır (KVKK uyumlu)
        </p>
      </div>
    </div>
  );
}
