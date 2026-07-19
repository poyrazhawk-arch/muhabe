"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { createClient } from "@/lib/supabase/client";
import { useDict, useLocale } from "@/lib/i18n/LocaleContext";
import { EnvelopeSimple, Lock, Eye, EyeSlash, User, ArrowRight, Buildings, Notebook, Check, EnvelopeOpen } from "@phosphor-icons/react";

const EASE: [number,number,number,number] = [0.22, 1, 0.36, 1];
const INK = "#081120";
const RED = "#c85460";

export default function KayitPage() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", officeName: "" });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [confirmSent, setConfirmSent] = useState(false);

  const supabase = createClient();
  const router   = useRouter();
  const t = useDict().auth;
  const locale = useLocale();

  const PERKS = [t.perk1, t.perk2, t.perk3];

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(p => ({ ...p, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) { setError(t.passwordMin8); return; }
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
      setError(json.error ?? t.genericError);
      setLoading(false);
      return;
    }

    const json = await res.json();
    if (json.needsConfirmation) {
      setConfirmSent(true);
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

  // ── E-posta onayı bekleniyor ekranı ───────────────────────
  if (confirmSent) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center p-8" style={{ background: "#f6f5f2" }}>
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="w-full max-w-[420px] text-center"
        >
          <div className="mx-auto mb-6 flex items-center justify-center"
            style={{ width: 52, height: 52, borderRadius: 14, background: INK }}>
            <EnvelopeOpen size={24} weight="fill" style={{ color: "#9db8d9" }} />
          </div>
          <h1 className="text-[24px] font-bold tracking-[-0.035em] mb-3" style={{ color: INK }}>
            {t.confirmTitle}
          </h1>
          <p className="text-[14px] leading-relaxed mb-2" style={{ color: "#5a6577" }}>
            {t.confirmBody}
          </p>
          <p className="text-[13px] font-semibold mb-8" style={{ color: INK }}>{form.email}</p>
          <a href="/auth/giris"
            className="inline-flex items-center gap-2 text-[13px] font-semibold px-5 py-2.5 rounded-lg transition-opacity hover:opacity-85"
            style={{ background: INK, color: "#f2f5f9" }}>
            {t.signInLink} <ArrowRight size={14} weight="bold" />
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex">

      {/* ── Sol — Defter paneli ─────────────────────────────── */}
      <div className="hidden lg:flex flex-col w-[55%] relative overflow-hidden noise" style={{ background: INK }}>
        {/* Defter satır çizgileri */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "repeating-linear-gradient(to bottom, transparent 0px, transparent 31px, rgba(139,168,204,0.055) 31px, rgba(139,168,204,0.055) 32px)" }} />
        {/* Cilt payı */}
        <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left: 76, width: 1, background: "rgba(200,84,96,0.32)" }} />
        <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left: 81, width: 1, background: "rgba(200,84,96,0.16)" }} />
        {/* Delgeç delikleri */}
        {[18, 46, 82].map(top => (
          <div key={top} className="absolute pointer-events-none rounded-full"
            style={{
              left: 34, top: `${top}%`, width: 11, height: 11, background: "#040a14",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.8), 0 1px 0 rgba(139,168,204,0.07)",
            }} />
        ))}

        <motion.span
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1, ease: EASE }}
          className="absolute top-8 right-10 text-[10.5px] tabular-nums select-none"
          style={{ fontFamily: "var(--font-mono)", color: "#31465e", letterSpacing: "0.14em" }}
        >
          {locale === "tr" ? "YENİ KAYIT · 2026" : "NEW ACCOUNT · 2026"}
        </motion.span>

        <div className="relative flex flex-col h-full py-10" style={{ paddingLeft: 108, paddingRight: 56 }}>
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex items-center gap-2.5"
          >
            <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
              style={{ background: "#16283f", border: "1px solid rgba(139,168,204,0.18)" }}>
              <Notebook size={14} weight="fill" style={{ color: "#9db8d9" }} />
            </div>
            <span className="text-[14px] font-bold tracking-tight" style={{ color: "#dce6f2" }}>Ledger</span>
          </motion.div>

          {/* Başlık */}
          <div className="flex-1 flex flex-col justify-center" style={{ marginTop: -20 }}>
            {[t.signupHero1, t.signupHero2, t.signupHero3].map((line, i) => (
              <motion.span
                key={line}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.12 + i * 0.09, ease: EASE }}
                className="block font-bold"
                style={{ fontSize: "clamp(28px,3.4vw,42px)", lineHeight: 1.35, letterSpacing: "-0.04em", color: "#e6edf6" }}
              >
                {i === 2 ? (
                  <span className="relative inline-block">
                    {line}
                    <svg viewBox="0 0 200 8" fill="none" preserveAspectRatio="none"
                      className="absolute left-0 -bottom-1 w-full pointer-events-none" style={{ height: 8 }}>
                      <motion.path
                        d="M2 5.5 C40 2.5, 90 6.5, 198 3.5"
                        stroke={RED} strokeWidth="2.5" strokeLinecap="round"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                        transition={{ duration: 0.55, delay: 0.8, ease: EASE }}
                      />
                    </svg>
                  </span>
                ) : line}
              </motion.span>
            ))}

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
              className="text-[13.5px] mt-6 max-w-[380px]"
              style={{ color: "#54708e", lineHeight: "32px" }}
            >
              {t.signupHeroSub}
            </motion.p>

            {/* Kazanımlar — defter maddeleri */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.62, ease: EASE }}
              className="mt-9 max-w-[400px]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <p className="text-[10px] font-medium pb-2"
                style={{ color: "#42607f", letterSpacing: "0.16em", borderBottom: "1px solid rgba(139,168,204,0.16)" }}>
                {locale === "tr" ? "PAKETE DAHİL" : "INCLUDED"}
              </p>
              {PERKS.map((text, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.74 + i * 0.07, ease: EASE }}
                  className="flex items-center gap-2.5 text-[12px]"
                  style={{ height: 32, lineHeight: "32px" }}
                >
                  <Check size={12} weight="bold" style={{ color: RED, flexShrink: 0 }} />
                  <span style={{ color: "#8fa9c7" }}>{text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Alt metrikler */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.95, ease: EASE }}
            className="flex items-center gap-9 pt-5"
            style={{ borderTop: "1px solid rgba(139,168,204,0.14)", fontFamily: "var(--font-mono)" }}
          >
            {[
              { val: locale === "tr" ? "14 gün" : "14 days", label: t.metricTrial },
              { val: "< 2 dk",  label: t.metricSetup },
              { val: "AB",      label: t.metricData  },
            ].map(({ val, label }) => (
              <div key={label}>
                <p className="text-[14px] font-bold tabular-nums" style={{ color: "#dce6f2" }}>{val}</p>
                <p className="text-[9.5px] mt-0.5 uppercase" style={{ color: "#31465e", letterSpacing: "0.1em" }}>{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Sağ — Form paneli ───────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8" style={{ background: "#f6f5f2" }}>
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="w-full max-w-[360px]"
        >
          {/* Mobil logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: INK }}>
              <Notebook size={14} weight="fill" style={{ color: "#9db8d9" }} />
            </div>
            <span className="text-[14px] font-bold tracking-tight" style={{ color: "var(--text-1)" }}>Ledger</span>
          </div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="text-[10px] font-medium mb-3"
            style={{ fontFamily: "var(--font-mono)", color: "#a09a8c", letterSpacing: "0.18em" }}
          >
            {locale === "tr" ? "HESAP OLUŞTUR" : "CREATE ACCOUNT"}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05, ease: EASE }}
            className="text-[26px] font-bold tracking-[-0.04em] mb-1"
            style={{ color: "var(--text-1)" }}
          >
            {t.createAccountTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: EASE }}
            className="text-[13px] mb-7"
            style={{ color: "var(--text-3)" }}
          >
            {t.haveAccount}{" "}
            <a href="/auth/giris" className="font-medium underline underline-offset-4 decoration-1 transition-opacity hover:opacity-70"
              style={{ color: "var(--text-1)", textDecorationColor: RED }}>
              {t.signInLink}
            </a>
          </motion.p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {([
              { id: "fullName",   label: t.fullName,   Icon: User,           type: "text",  placeholder: t.fullNamePlaceholder,   autoComplete: "name",         optional: false },
              { id: "officeName", label: t.officeName, Icon: Buildings,      type: "text",  placeholder: t.officeNamePlaceholder, autoComplete: "organization", optional: true  },
              { id: "email",      label: t.email,      Icon: EnvelopeSimple, type: "email", placeholder: t.emailPlaceholder,      autoComplete: "email",        optional: false },
            ] as const).map(({ id, label, Icon, type, placeholder, autoComplete, optional }, i) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.07, ease: EASE }}
              >
                <label htmlFor={id} className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
                  {label}{" "}
                  {optional && <span style={{ color: "var(--text-3)", fontWeight: 400 }}>{t.optional}</span>}
                </label>
                <div className="relative">
                  <Icon size={14} style={{ color: "var(--text-3)", position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    id={id} type={type} autoComplete={autoComplete} required={!optional}
                    value={form[id as keyof typeof form]} onChange={set(id)}
                    placeholder={placeholder}
                    className="input-base" style={{ paddingLeft: "34px", background: "#fff" }}
                  />
                </div>
              </motion.div>
            ))}

            {/* Şifre */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.36, ease: EASE }}
            >
              <label htmlFor="password" className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
                {t.password}
              </label>
              <div className="relative">
                <Lock size={14} style={{ color: "var(--text-3)", position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  id="password" type={showPw ? "text" : "password"}
                  required minLength={8} autoComplete="new-password"
                  value={form.password} onChange={set("password")}
                  placeholder={t.passwordPlaceholder}
                  className="input-base" style={{ paddingLeft: "34px", paddingRight: "40px", background: "#fff" }}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? "Şifreyi gizle" : "Şifreyi göster"}
                  style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", padding: "2px" }}>
                  {showPw ? <EyeSlash size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.password.length > 0 && (
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-[11px] mt-1"
                  style={{ color: form.password.length < 8 ? "var(--red)" : "#16a34a" }}
                >
                  {form.password.length < 8 ? `${8 - form.password.length} ${t.passwordMinChars}` : t.strongPassword}
                </motion.p>
              )}
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
                  className="px-3.5 py-2.5 rounded-lg text-[12px]"
                  style={{ background: "var(--red-bg)", border: "1px solid var(--red-lt)", color: "var(--red)" }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.44, ease: EASE }}
              whileHover={{ y: -1 }} whileTap={{ scale: 0.985, y: 0 }}
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-[13px] font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: INK, color: "#f2f5f9",
                boxShadow: "0 1px 2px rgba(8,17,32,0.4), 0 6px 20px rgba(8,17,32,0.18)",
              }}
            >
              {loading ? t.creatingAccount : <> {t.createAccount} <ArrowRight size={14} weight="bold" /> </>}
            </motion.button>
          </form>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.55, ease: EASE }}
            className="text-[11px] mt-7 text-center"
            style={{ color: "var(--text-3)" }}
          >
            {t.signupTerms}{" "}
            <a href="/gizlilik" className="underline underline-offset-2">{t.termsLink}</a>.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
