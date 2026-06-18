"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { EnvelopeSimple, Lock, Eye, EyeSlash, User, ArrowRight, Buildings } from "@phosphor-icons/react";

const TRUST = [
  { val: "Free",  label: "No credit card" },
  { val: "2min",  label: "Setup time"     },
  { val: "GDPR",  label: "Compliant"      },
];

export default function KayitPage() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", officeName: "" });
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const supabase = createClient();
  const router   = useRouter();

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(p => ({ ...p, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        officeName: form.officeName,
      }),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "An error occurred.");
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-[100dvh] flex">

      {/* ── Left — Brand panel ──────────────────────────────────── */}
      <div className="hidden lg:flex flex-col w-[52%] relative overflow-hidden noise"
        style={{ background: "var(--sidebar)" }}>

        <div className="absolute inset-0 pointer-events-none dot-grid" />
        <div className="absolute bottom-0 inset-x-0 h-56 pointer-events-none"
          style={{ background: "linear-gradient(to top, #08111f 0%, transparent 100%)" }} />

        <div className="relative flex flex-col h-full px-12 py-10">
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

          <div className="flex-1 flex flex-col justify-center">
            <h1
              className="font-bold leading-[1.1] tracking-[-0.03em] mb-5"
              style={{ fontSize: "38px", color: "#dde5f0" }}
            >
              Start free.<br />
              Scale when<br />
              you&apos;re ready.
            </h1>
            <p className="text-[14px] leading-relaxed max-w-[340px]"
              style={{ color: "#4a6480" }}>
              Everything you need to run a modern accounting practice — from day one.
            </p>
          </div>

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
            Create account
          </h2>
          <p className="text-[13px] mb-7" style={{ color: "var(--text-3)" }}>
            Already have an account?{" "}
            <a href="/auth/giris" className="font-medium" style={{ color: "var(--accent)" }}>Sign in</a>
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">

            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
                Full name
              </label>
              <div className="relative">
                <User size={14} style={{
                  color: "var(--text-3)", position: "absolute",
                  left: "12px", top: "50%", transform: "translateY(-50%)",
                }} />
                <input type="text" required value={form.fullName} onChange={set("fullName")}
                  placeholder="Alex Johnson"
                  className="input-base" style={{ paddingLeft: "34px" }} />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
                Office name{" "}
                <span style={{ color: "var(--text-3)", fontWeight: 400 }}>(optional)</span>
              </label>
              <div className="relative">
                <Buildings size={14} style={{
                  color: "var(--text-3)", position: "absolute",
                  left: "12px", top: "50%", transform: "translateY(-50%)",
                }} />
                <input type="text" value={form.officeName} onChange={set("officeName")}
                  placeholder="Johnson & Associates CPA"
                  className="input-base" style={{ paddingLeft: "34px" }} />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
                Email address
              </label>
              <div className="relative">
                <EnvelopeSimple size={14} style={{
                  color: "var(--text-3)", position: "absolute",
                  left: "12px", top: "50%", transform: "translateY(-50%)",
                }} />
                <input type="email" required autoComplete="email" value={form.email} onChange={set("email")}
                  placeholder="you@firm.com"
                  className="input-base" style={{ paddingLeft: "34px" }} />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
                Password
              </label>
              <div className="relative">
                <Lock size={14} style={{
                  color: "var(--text-3)", position: "absolute",
                  left: "12px", top: "50%", transform: "translateY(-50%)",
                }} />
                <input type={showPw ? "text" : "password"} required minLength={8}
                  autoComplete="new-password" value={form.password} onChange={set("password")}
                  placeholder="Min. 8 characters"
                  className="input-base" style={{ paddingLeft: "34px", paddingRight: "40px" }} />
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
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-[13px] font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
              style={{
                background: "var(--accent)",
                boxShadow: "0 1px 3px rgba(37,99,235,0.3), 0 2px 10px rgba(37,99,235,0.15)",
              }}>
              {loading ? "Creating account…" : (
                <> Create account <ArrowRight size={14} weight="bold" /> </>
              )}
            </button>
          </form>

          <p className="text-[11px] mt-5 text-center leading-relaxed" style={{ color: "var(--text-3)" }}>
            By signing up you agree to our{" "}
            <span className="underline underline-offset-2 cursor-pointer">terms of service</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
