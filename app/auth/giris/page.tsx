"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { createClient } from "@/lib/supabase/client";
import { EnvelopeSimple, Lock, Eye, EyeSlash, ArrowRight, Notebook } from "@phosphor-icons/react";

const EASE: [number,number,number,number] = [0.22, 1, 0.36, 1];

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
      } else if (error.message.toLowerCase().includes("invalid")) {
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
        style={{ background: "linear-gradient(160deg, #07101d 0%, #0b1629 50%, #07111e 100%)" }}>

        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none dot-grid" />

        {/* Radial accent glow */}
        <div className="absolute pointer-events-none"
          style={{
            top: "15%", left: "20%", width: 420, height: 420,
            background: "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)",
            borderRadius: "50%",
          }} />
        <div className="absolute pointer-events-none"
          style={{
            bottom: "10%", right: "5%", width: 300, height: 300,
            background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
            borderRadius: "50%",
          }} />

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-48 pointer-events-none"
          style={{ background: "linear-gradient(to top, #07101d 0%, transparent 100%)" }} />

        <div className="relative flex flex-col h-full px-12 py-10">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex items-center gap-2.5"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                boxShadow: "0 2px 12px rgba(37,99,235,0.5), inset 0 1px 0 rgba(255,255,255,0.18)",
              }}>
              <Notebook size={14} weight="fill" style={{ color: "#fff" }} />
            </div>
            <span className="text-[14px] font-bold text-white tracking-tight">Ledger</span>
          </motion.div>

          {/* Headline */}
          <div className="flex-1 flex flex-col justify-center">
            {["Your clients.", "Your deadlines.", "One dashboard."].map((line, i) => (
              <motion.span
                key={line}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.1, ease: EASE }}
                className="block font-bold leading-[1.08] tracking-[-0.035em]"
                style={{ fontSize: "clamp(28px,3.5vw,40px)", color: i === 2 ? "#93c5fd" : "#dde5f0" }}
              >
                {line}
              </motion.span>
            ))}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
              className="text-[14px] leading-relaxed mt-5 max-w-[340px]"
              style={{ color: "#4a6480" }}
            >
              HMRC filings, document requests, and overdue invoices. No more switching tabs.
            </motion.p>

            {/* Floating glass card — app preview hint */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6, ease: EASE }}
              className="mt-8 max-w-[310px] rounded-2xl p-4"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "#3b5070" }}>
                Client overview
              </p>
              {[
                { name: "Harper & Co.", rag: "green",  label: "OK"       },
                { name: "Reid Accounts", rag: "amber",  label: "Warning"  },
                { name: "Stonebridge Ltd", rag: "red",  label: "Critical" },
              ].map((c, i) => (
                <motion.div
                  key={c.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.75 + i * 0.08, ease: EASE }}
                  className="flex items-center justify-between py-2"
                  style={{ borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
                >
                  <span className="text-[12px] font-medium" style={{ color: "#8aaabf" }}>{c.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                    style={{
                      background: c.rag === "green" ? "rgba(34,197,94,0.12)" : c.rag === "amber" ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)",
                      color:      c.rag === "green" ? "#4ade80" : c.rag === "amber" ? "#fbbf24" : "#f87171",
                    }}>
                    {c.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.85, ease: EASE }}
            className="text-[11px] pt-6"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)", color: "#2d4861" }}
          >
            GDPR-compliant · EU data residency · SOC 2 ready
          </motion.p>
        </div>
      </div>

      {/* ── Right — Form panel ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8"
        style={{ background: "#f4f5f7" }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="w-full max-w-[360px]"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", boxShadow: "0 2px 8px rgba(37,99,235,0.4)" }}>
              <Notebook size={14} weight="fill" style={{ color: "#fff" }} />
            </div>
            <span className="text-[14px] font-bold tracking-tight" style={{ color: "var(--text-1)" }}>Ledger</span>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05, ease: EASE }}
            className="text-[24px] font-bold tracking-[-0.035em] mb-1"
            style={{ color: "var(--text-1)" }}
          >
            Sign in
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: EASE }}
            className="text-[13px] mb-7"
            style={{ color: "var(--text-3)" }}
          >
            No account yet?{" "}
            <a href="/auth/kayit" className="font-medium" style={{ color: "var(--accent)" }}>Create one</a>
          </motion.p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15, ease: EASE }}
            >
              <label htmlFor="email" className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
                Email address
              </label>
              <div className="relative">
                <EnvelopeSimple size={14} style={{ color: "var(--text-3)", position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  id="email" type="email" required autoComplete="email"
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@firm.com"
                  className="input-base" style={{ paddingLeft: "34px" }}
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.22, ease: EASE }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-[12px] font-medium" style={{ color: "var(--text-2)" }}>
                  Password
                </label>
                <a href="/auth/sifremi-unuttum" className="text-[11px] font-medium" style={{ color: "var(--accent)" }}>
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock size={14} style={{ color: "var(--text-3)", position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  id="password" type={showPw ? "text" : "password"} required
                  autoComplete="current-password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-base" style={{ paddingLeft: "34px", paddingRight: "40px" }}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", padding: "2px" }}>
                  {showPw ? <EyeSlash size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3.5 py-2.5 rounded-lg text-[12px]"
                style={{ background: "var(--red-bg)", border: "1px solid var(--red-lt)", color: "var(--red)" }}
              >
                {error}
              </motion.div>
            )}

            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3, ease: EASE }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.985 }}
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-[13px] font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: "var(--accent)",
                boxShadow: "0 1px 3px rgba(37,99,235,0.35), 0 4px 16px rgba(37,99,235,0.18), inset 0 1px 0 rgba(255,255,255,0.12)",
              }}
            >
              {loading ? "Signing in…" : <> Sign in <ArrowRight size={14} weight="bold" /> </>}
            </motion.button>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4, ease: EASE }}
            className="text-[11px] mt-6 text-center"
            style={{ color: "var(--text-3)" }}
          >
            By signing in you agree to our{" "}
            <span className="underline underline-offset-2 cursor-pointer">terms of service</span>.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
