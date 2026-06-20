"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { createClient } from "@/lib/supabase/client";
import { EnvelopeSimple, Lock, Eye, EyeSlash, User, ArrowRight, Buildings, Notebook, CheckCircle, Sparkle } from "@phosphor-icons/react";

const EASE: [number,number,number,number] = [0.22, 1, 0.36, 1];

const PERKS = [
  { Icon: CheckCircle, text: "Free 14-day trial, no card required" },
  { Icon: CheckCircle, text: "Unlimited clients on Pro"            },
  { Icon: CheckCircle, text: "GDPR-compliant, EU data residency"   },
];

export default function KayitPage() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", officeName: "" });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

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

  const fields = [
    { id: "fullName",   label: "Full name",    Icon: User,            type: "text",     placeholder: "Alex Johnson",               autoComplete: "name"         },
    { id: "officeName", label: "Office name",  Icon: Buildings,       type: "text",     placeholder: "Johnson & Associates CPA",    autoComplete: "organization", optional: true },
    { id: "email",      label: "Email address",Icon: EnvelopeSimple,  type: "email",    placeholder: "you@firm.com",               autoComplete: "email"        },
  ] as const;

  return (
    <div className="min-h-[100dvh] flex">

      {/* ── Left — Brand panel ──────────────────────────────────── */}
      <div className="hidden lg:flex flex-col w-[52%] relative overflow-hidden noise"
        style={{ background: "linear-gradient(160deg, #07101d 0%, #0b1629 50%, #07111e 100%)" }}>

        <div className="absolute inset-0 pointer-events-none dot-grid" />

        {/* Accent glows */}
        <div className="absolute pointer-events-none" style={{
          top: "20%", left: "30%", width: 360, height: 360,
          background: "radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)",
          borderRadius: "50%",
        }} />
        <div className="absolute pointer-events-none" style={{
          bottom: "15%", right: "10%", width: 260, height: 260,
          background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)",
          borderRadius: "50%",
        }} />

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
            {["Start free.", "Scale when", "you're ready."].map((line, i) => (
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
              Everything you need to run a modern accounting practice — from day one.
            </motion.p>

            {/* Perks list */}
            <div className="mt-8 space-y-3">
              {PERKS.map(({ Icon, text }, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.6 + i * 0.08, ease: EASE }}
                  className="flex items-center gap-2.5"
                >
                  <Icon size={14} weight="fill" style={{ color: "#3b82f6", flexShrink: 0 }} />
                  <span className="text-[12.5px]" style={{ color: "#5a7a96" }}>{text}</span>
                </motion.div>
              ))}
            </div>

            {/* Floating promo badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.85, ease: EASE }}
              className="mt-8 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl self-start"
              style={{
                background: "rgba(37,99,235,0.1)",
                border: "1px solid rgba(37,99,235,0.2)",
              }}
            >
              <Sparkle size={12} weight="fill" style={{ color: "#60a5fa" }} />
              <span className="text-[11px] font-semibold" style={{ color: "#60a5fa" }}>
                No credit card required
              </span>
            </motion.div>
          </div>

          {/* Bottom metrics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9, ease: EASE }}
            className="flex items-center gap-8 pt-6"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            {[
              { val: "Free",  label: "No credit card" },
              { val: "2 min", label: "Setup time"      },
              { val: "GDPR",  label: "Compliant"       },
            ].map(({ val, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.95 + i * 0.07, ease: EASE }}
              >
                <p className="text-[15px] font-bold text-white tabular-nums">{val}</p>
                <p className="text-[10px] mt-0.5 uppercase tracking-[0.08em]" style={{ color: "#2d4861" }}>{label}</p>
              </motion.div>
            ))}
          </motion.div>
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
            Create account
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: EASE }}
            className="text-[13px] mb-7"
            style={{ color: "var(--text-3)" }}
          >
            Already have an account?{" "}
            <a href="/auth/giris" className="font-medium" style={{ color: "var(--accent)" }}>Sign in</a>
          </motion.p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {fields.map(({ id, label, Icon, type, placeholder, autoComplete, ...rest }, i) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.07, ease: EASE }}
              >
                <label htmlFor={id} className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
                  {label}{" "}
                  {"optional" in rest && rest.optional && (
                    <span style={{ color: "var(--text-3)", fontWeight: 400 }}>(optional)</span>
                  )}
                </label>
                <div className="relative">
                  <Icon size={14} style={{ color: "var(--text-3)", position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    id={id} type={type} autoComplete={autoComplete}
                    required={"optional" in rest ? !rest.optional : true}
                    value={form[id as keyof typeof form]}
                    onChange={set(id)}
                    placeholder={placeholder}
                    className="input-base" style={{ paddingLeft: "34px" }}
                  />
                </div>
              </motion.div>
            ))}

            {/* Password field */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + fields.length * 0.07, ease: EASE }}
            >
              <label htmlFor="password" className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
                Password
              </label>
              <div className="relative">
                <Lock size={14} style={{ color: "var(--text-3)", position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  id="password" type={showPw ? "text" : "password"}
                  required minLength={8} autoComplete="new-password"
                  value={form.password} onChange={set("password")}
                  placeholder="Min. 8 characters"
                  className="input-base" style={{ paddingLeft: "34px", paddingRight: "40px" }}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", padding: "2px" }}>
                  {showPw ? <EyeSlash size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Password strength hint */}
              {form.password.length > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[11px] mt-1"
                  style={{ color: form.password.length < 8 ? "var(--red)" : "#16a34a" }}
                >
                  {form.password.length < 8 ? `${8 - form.password.length} more characters needed` : "Strong password"}
                </motion.p>
              )}
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="px-3.5 py-2.5 rounded-lg text-[12px]"
                  style={{ background: "var(--red-bg)", border: "1px solid var(--red-lt)", color: "var(--red)" }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + (fields.length + 1) * 0.07, ease: EASE }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.985 }}
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-[13px] font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: "var(--accent)",
                boxShadow: "0 1px 3px rgba(37,99,235,0.35), 0 4px 16px rgba(37,99,235,0.18), inset 0 1px 0 rgba(255,255,255,0.12)",
              }}
            >
              {loading ? "Creating account…" : <> Create account <ArrowRight size={14} weight="bold" /> </>}
            </motion.button>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.55, ease: EASE }}
            className="text-[11px] mt-6 text-center"
            style={{ color: "var(--text-3)" }}
          >
            By signing up you agree to our{" "}
            <span className="underline underline-offset-2 cursor-pointer">terms of service</span>.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
