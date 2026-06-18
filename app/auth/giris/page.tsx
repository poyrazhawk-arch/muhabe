"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { EnvelopeSimple, Lock, Eye, EyeSlash, ArrowRight } from "@phosphor-icons/react";

const TRUST = [
  { val: "GDPR",  label: "Compliant" },
  { val: "99.9%", label: "Uptime"    },
  { val: "2FA",   label: "Secured"   },
];

export default function GirisPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const supabase = createClient();
  const router   = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        setError("Your email is not confirmed. Check your inbox.");
      } else if (
        error.message.toLowerCase().includes("invalid login credentials") ||
        error.message.toLowerCase().includes("invalid credentials")
      ) {
        setError("Invalid email or password.");
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-[100dvh] flex">

      {/* ── Left — Brand panel ──────────────────────────────────── */}
      <div className="hidden lg:flex flex-col w-[52%] relative overflow-hidden noise"
        style={{ background: "var(--sidebar)" }}>

        {/* Dot grid background */}
        <div className="absolute inset-0 pointer-events-none dot-grid" />

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 inset-x-0 h-56 pointer-events-none"
          style={{ background: "linear-gradient(to top, #08111f 0%, transparent 100%)" }} />

        <div className="relative flex flex-col h-full px-12 py-10">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "#2563eb" }}>
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <span className="text-[14px] font-bold text-white tracking-tight">Ledger</span>
          </div>

          {/* Headline */}
          <div className="flex-1 flex flex-col justify-center">
            <h1
              className="font-bold leading-[1.1] tracking-[-0.03em] mb-5"
              style={{ fontSize: "38px", color: "#dde5f0" }}
            >
              Every client.<br />
              Every deadline.<br />
              Under control.
            </h1>
            <p className="text-[14px] leading-relaxed max-w-[340px]"
              style={{ color: "#4a6480" }}>
              Tax calendars, client health tracking, and collections — all in one place.
            </p>
          </div>

          {/* Trust metrics */}
          <div className="flex items-center gap-8 pt-6"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            {TRUST.map(({ val, label }) => (
              <div key={label}>
                <p className="text-[16px] font-bold text-white tabular-nums">{val}</p>
                <p className="text-[10px] mt-0.5 uppercase tracking-[0.08em]"
                  style={{ color: "#2d4861" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right — Form panel ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8"
        style={{ background: "#f8f9fb" }}>
        <div className="w-full max-w-[360px] animate-fade-up">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "#2563eb" }}>
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <span className="text-[14px] font-bold tracking-tight" style={{ color: "var(--text-1)" }}>Ledger</span>
          </div>

          <h2 className="text-[24px] font-semibold tracking-tight mb-1" style={{ color: "var(--text-1)" }}>
            Sign in
          </h2>
          <p className="text-[13px] mb-7" style={{ color: "var(--text-3)" }}>
            Continue with your email and password.{" "}
            <a href="/auth/kayit" className="font-medium" style={{ color: "var(--accent)" }}>
              Create account
            </a>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-[12px] font-medium mb-1.5"
                style={{ color: "var(--text-2)" }}>
                Email address
              </label>
              <div className="relative">
                <EnvelopeSimple size={14} style={{
                  color: "var(--text-3)", position: "absolute",
                  left: "12px", top: "50%", transform: "translateY(-50%)",
                }} />
                <input
                  id="email" type="email" required autoComplete="email"
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@firm.com"
                  className="input-base"
                  style={{ paddingLeft: "34px" }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-[12px] font-medium"
                  style={{ color: "var(--text-2)" }}>
                  Password
                </label>
                <a href="/auth/sifremi-unuttum" className="text-[11px] font-medium"
                  style={{ color: "var(--accent)" }}>
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock size={14} style={{
                  color: "var(--text-3)", position: "absolute",
                  left: "12px", top: "50%", transform: "translateY(-50%)",
                }} />
                <input
                  id="password" type={showPw ? "text" : "password"} required
                  autoComplete="current-password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-base"
                  style={{ paddingLeft: "34px", paddingRight: "40px" }}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{
                    position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
                    color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", padding: "2px",
                  }}>
                  {showPw ? <EyeSlash size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-3.5 py-2.5 rounded-lg text-[12px]"
                style={{ background: "var(--red-bg)", border: "1px solid var(--red-lt)", color: "var(--red)" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-[13px] font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: "var(--accent)",
                boxShadow: "0 1px 3px rgba(37,99,235,0.3), 0 2px 10px rgba(37,99,235,0.15)",
              }}>
              {loading ? "Signing in…" : (
                <> Sign in <ArrowRight size={14} weight="bold" /> </>
              )}
            </button>
          </form>

          <p className="text-[11px] mt-6 text-center" style={{ color: "var(--text-3)" }}>
            By signing in you agree to our{" "}
            <span className="underline underline-offset-2 cursor-pointer">terms of service</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
