"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  CheckCircle,
  EnvelopeSimple,
  Lightning,
  CalendarCheck,
  Wallet,
  Users,
  ArrowRight,
} from "@phosphor-icons/react";

const FEATURES = [
  { Icon: CalendarCheck, text: "Türk vergi takvimi otomasyonu" },
  { Icon: Wallet,        text: "Hizmet bedeli ve tahsilat takibi" },
  { Icon: Users,         text: "Müşteri RAG durum izleme" },
  { Icon: Lightning,     text: "Toplu e-posta ve belge yönetimi" },
];

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
    <div className="min-h-[100dvh] flex">

      {/* Left — Branded panel */}
      <div
        className="hidden lg:flex flex-col w-[52%] relative overflow-hidden"
        style={{ background: "var(--sidebar)" }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent 0%, #3b82f6 40%, #6366f1 70%, transparent 100%)" }}
        />

        {/* Background mesh */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 20% -10%, rgba(59,130,246,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 110%, rgba(99,102,241,0.08) 0%, transparent 60%)",
          }}
        />

        <div className="relative flex flex-col flex-1 px-12 py-10">

          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-auto">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" }}
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <span className="text-[14px] font-semibold text-white tracking-tight">Muhasebe</span>
          </div>

          {/* Hero copy */}
          <div className="py-16">
            <h1
              className="text-[30px] font-bold leading-tight tracking-tight mb-4"
              style={{ color: "#e8edf5" }}
            >
              Muhasebe iş akışınızı<br/>
              bir adım öne taşıyın.
            </h1>
            <p className="text-[14px] leading-relaxed mb-10" style={{ color: "#6b8db5" }}>
              Türk muhasebeciler için tasarlanmış, vergi takvimi, tahsilat ve belge takibini tek platformda birleştiren sistem.
            </p>

            <div className="space-y-4">
              {FEATURES.map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)" }}
                  >
                    <Icon size={13} style={{ color: "#60a5fa" }} weight="fill" />
                  </div>
                  <span className="text-[13px]" style={{ color: "#8aaac8" }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div
            className="mt-auto pt-6"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="text-[11px] tracking-wide" style={{ color: "rgba(75,128,184,0.5)" }}>
              KVKK UYUMLU - AB SUNUCULARI
            </p>
          </div>
        </div>
      </div>

      {/* Right — Form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[360px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}
            >
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <span className="text-[14px] font-semibold" style={{ color: "var(--text-1)" }}>Muhasebe</span>
          </div>

          {sent ? (
            <div className="text-center animate-fade-up">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: "var(--green-bg)", border: "1px solid var(--green-lt)" }}
              >
                <CheckCircle size={28} weight="fill" style={{ color: "var(--green)" }} />
              </div>
              <h2 className="text-[18px] font-semibold mb-2" style={{ color: "var(--text-1)" }}>
                E-posta gönderildi
              </h2>
              <p className="text-[13px] leading-relaxed mb-1" style={{ color: "var(--text-2)" }}>
                <span className="font-medium" style={{ color: "var(--text-1)" }}>{email}</span> adresine giriş bağlantısı gönderildi.
              </p>
              <p className="text-[12px] mt-3" style={{ color: "var(--text-3)" }}>
                Spam klasörünü de kontrol edin.
              </p>
            </div>
          ) : (
            <div className="animate-fade-up">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-lt)" }}
              >
                <EnvelopeSimple size={20} weight="duotone" style={{ color: "var(--accent)" }} />
              </div>

              <h2 className="text-[22px] font-semibold tracking-tight mb-1" style={{ color: "var(--text-1)" }}>
                Giriş yap
              </h2>
              <p className="text-[13px] mb-7" style={{ color: "var(--text-3)" }}>
                E-postanıza şifresiz bağlantı gönderilecek.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label htmlFor="email" className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
                    E-posta adresi
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ornek@firma.com"
                    className="w-full px-3.5 py-2.5 rounded-lg text-[13px] focus:outline-none transition-all duration-150"
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      color: "var(--text-1)",
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = "var(--accent)";
                      e.target.style.background  = "#fff";
                      e.target.style.boxShadow   = "0 0 0 3px rgba(37,99,235,0.08)";
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = "var(--border)";
                      e.target.style.background  = "var(--surface-2)";
                      e.target.style.boxShadow   = "none";
                    }}
                  />
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
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-[13px] font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: "var(--accent)",
                    boxShadow: "0 1px 3px rgba(37,99,235,0.3), 0 2px 10px rgba(37,99,235,0.15)",
                  }}
                >
                  {loading ? "Gönderiliyor..." : (
                    <>
                      Bağlantı gönder
                      <ArrowRight size={14} weight="bold" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-[11px] mt-6 text-center" style={{ color: "var(--text-3)" }}>
                Giriş yaparak{" "}
                <span className="underline underline-offset-2 cursor-pointer">kullanım koşullarını</span>{" "}
                kabul etmiş olursunuz.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
