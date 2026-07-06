"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { createClient } from "@/lib/supabase/client";
import { useDict, useLocale } from "@/lib/i18n/LocaleContext";
import { EnvelopeSimple, Lock, Eye, EyeSlash, ArrowRight, Notebook } from "@phosphor-icons/react";

const EASE: [number,number,number,number] = [0.22, 1, 0.36, 1];

/* Defter satırları — locale'e göre gerçekçi beyanname kalemleri */
const LEDGER_ROWS: Record<"tr" | "en", { name: string; due: string; status: string; tone: "red" | "amber" | "dim" }[]> = {
  tr: [
    { name: "Muhtasar ve Prim Hizmet", due: "26 Tem", status: "bugün",  tone: "red"   },
    { name: "KDV Beyannamesi",         due: "28 Tem", status: "2 gün",  tone: "amber" },
    { name: "SGK Prim Ödemesi",        due: "31 Tem", status: "5 gün",  tone: "dim"   },
    { name: "Form Ba-Bs",              due: "31 Tem", status: "5 gün",  tone: "dim"   },
  ],
  en: [
    { name: "Payroll withholding", due: "26 Jul", status: "today",  tone: "red"   },
    { name: "VAT return",          due: "28 Jul", status: "2 days", tone: "amber" },
    { name: "Social security",     due: "31 Jul", status: "5 days", tone: "dim"   },
    { name: "Client documents",    due: "31 Jul", status: "5 days", tone: "dim"   },
  ],
};

const TONE = {
  red:   "#e8737e",
  amber: "#d9a662",
  dim:   "#5d7a99",
};

export default function GirisPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const supabase = createClient();
  const router   = useRouter();
  const t = useDict().auth;
  const locale = useLocale();
  const rows = LEDGER_ROWS[locale];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        setError(t.errEmailNotConfirmed);
      } else if (error.message.toLowerCase().includes("invalid")) {
        setError(t.errInvalidCreds);
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

      {/* ── Sol — Defter paneli ─────────────────────────────────── */}
      <div className="hidden lg:flex flex-col w-[55%] relative overflow-hidden noise"
        style={{ background: "#081120" }}>

        {/* Defter çizgileri — yatay satır aralıkları */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: "repeating-linear-gradient(to bottom, transparent 0px, transparent 31px, rgba(139,168,204,0.055) 31px, rgba(139,168,204,0.055) 32px)",
          }} />

        {/* Cilt payı — klasik çift kırmızı çizgi */}
        <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left: 76, width: 1, background: "rgba(200,84,96,0.32)" }} />
        <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left: 81, width: 1, background: "rgba(200,84,96,0.16)" }} />

        {/* Delgeç delikleri */}
        {[18, 46, 82].map(top => (
          <div key={top} className="absolute pointer-events-none rounded-full"
            style={{
              left: 34, top: `${top}%`, width: 11, height: 11,
              background: "#040a14",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.8), 0 1px 0 rgba(139,168,204,0.07)",
            }} />
        ))}

        {/* Sayfa numarası — mono, gerçek defter detayı */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1, ease: EASE }}
          className="absolute top-8 right-10 text-[10.5px] tabular-nums select-none"
          style={{ fontFamily: "var(--font-mono)", color: "#31465e", letterSpacing: "0.14em" }}
        >
          {locale === "tr" ? "SAYFA 001 · 2026" : "PAGE 001 · 2026"}
        </motion.span>

        <div className="relative flex flex-col h-full py-10" style={{ paddingLeft: 108, paddingRight: 56 }}>
          {/* Logo — satır çizgisine oturur */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
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
            {[t.heroLine1, t.heroLine2, t.heroLine3].map((line, i) => (
              <motion.span
                key={line}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.12 + i * 0.09, ease: EASE }}
                className="block font-bold"
                style={{
                  fontSize: "clamp(30px,3.6vw,44px)",
                  lineHeight: 1.35,
                  letterSpacing: "-0.04em",
                  color: "#e6edf6",
                }}
              >
                {i === 2 ? (
                  <span className="relative inline-block">
                    {line}
                    {/* kırmızı kalem işareti — cilt payı rengiyle aynı dil */}
                    <motion.svg
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.75, ease: EASE }}
                      className="absolute left-0 -bottom-1 w-full pointer-events-none"
                      viewBox="0 0 200 8" fill="none" preserveAspectRatio="none" style={{ height: 8 }}
                    >
                      <motion.path
                        d="M2 5.5 C40 2.5, 90 6.5, 198 3.5"
                        stroke="#c85460" strokeWidth="2.5" strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.55, delay: 0.8, ease: EASE }}
                      />
                    </motion.svg>
                  </span>
                ) : line}
              </motion.span>
            ))}

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
              className="text-[13.5px] mt-6 max-w-[380px]"
              style={{ color: "#54708e", lineHeight: "32px" }}
            >
              {t.heroSub}
            </motion.p>

            {/* Beyanname defteri — mono, gerçek tarihler */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: EASE }}
              className="mt-10 max-w-[400px]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <div className="flex items-baseline justify-between pb-2"
                style={{ borderBottom: "1px solid rgba(139,168,204,0.16)" }}>
                <span className="text-[10px] font-medium" style={{ color: "#42607f", letterSpacing: "0.16em" }}>
                  {locale === "tr" ? "TEMMUZ · BEYANNAME TAKVİMİ" : "JULY · FILING CALENDAR"}
                </span>
                <span className="text-[10px] tabular-nums" style={{ color: "#31465e" }}>4/12</span>
              </div>
              {rows.map((r, i) => (
                <motion.div
                  key={r.name}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.72 + i * 0.07, ease: EASE }}
                  className="flex items-baseline gap-3 text-[12px]"
                  style={{ height: 32, lineHeight: "32px" }}
                >
                  <span style={{ color: "#8fa9c7" }}>{r.name}</span>
                  <span className="flex-1" style={{ borderBottom: "1px dotted rgba(139,168,204,0.22)", transform: "translateY(-4px)" }} />
                  <span className="tabular-nums" style={{ color: "#6d89a8" }}>{r.due}</span>
                  <span className="tabular-nums text-right" style={{ color: TONE[r.tone], minWidth: 52 }}>{r.status}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Alt bilgi */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1, ease: EASE }}
            className="text-[10.5px]"
            style={{ fontFamily: "var(--font-mono)", color: "#31465e", letterSpacing: "0.08em" }}
          >
            {t.compliance}
          </motion.p>
        </div>
      </div>

      {/* ── Sağ — Form paneli ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8"
        style={{ background: "#f6f5f2" }}>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="w-full max-w-[360px]"
        >
          {/* Mobil logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ background: "#0d1b2e" }}>
              <Notebook size={14} weight="fill" style={{ color: "#9db8d9" }} />
            </div>
            <span className="text-[14px] font-bold tracking-tight" style={{ color: "var(--text-1)" }}>Ledger</span>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="text-[10px] font-medium mb-3"
            style={{ fontFamily: "var(--font-mono)", color: "#a09a8c", letterSpacing: "0.18em" }}
          >
            {locale === "tr" ? "HESAP GİRİŞİ" : "ACCOUNT ACCESS"}
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05, ease: EASE }}
            className="text-[26px] font-bold tracking-[-0.04em] mb-1"
            style={{ color: "var(--text-1)" }}
          >
            {t.signInTitle}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: EASE }}
            className="text-[13px] mb-8"
            style={{ color: "var(--text-3)" }}
          >
            {t.noAccount}{" "}
            <a href="/auth/kayit" className="font-medium underline underline-offset-4 decoration-1 transition-opacity hover:opacity-70"
              style={{ color: "var(--text-1)", textDecorationColor: "#c85460" }}>
              {t.createOne}
            </a>
          </motion.p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* E-posta */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15, ease: EASE }}
            >
              <label htmlFor="email" className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
                {t.email}
              </label>
              <div className="relative">
                <EnvelopeSimple size={14} style={{ color: "var(--text-3)", position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  id="email" type="email" required autoComplete="email"
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="input-base" style={{ paddingLeft: "34px", background: "#fff" }}
                />
              </div>
            </motion.div>

            {/* Şifre */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.22, ease: EASE }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-[12px] font-medium" style={{ color: "var(--text-2)" }}>
                  {t.password}
                </label>
                <a href="/auth/sifremi-unuttum" className="text-[11px] font-medium transition-opacity hover:opacity-70" style={{ color: "var(--text-3)" }}>
                  {t.forgotPassword}
                </a>
              </div>
              <div className="relative">
                <Lock size={14} style={{ color: "var(--text-3)", position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  id="password" type={showPw ? "text" : "password"} required
                  autoComplete="current-password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-base" style={{ paddingLeft: "34px", paddingRight: "40px", background: "#fff" }}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? "Şifreyi gizle" : "Şifreyi göster"}
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
              whileTap={{ scale: 0.985, y: 0 }}
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-[13px] font-semibold disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                background: "#0d1b2e",
                color: "#f2f5f9",
                boxShadow: "0 1px 2px rgba(8,17,32,0.4), 0 6px 20px rgba(8,17,32,0.18)",
              }}
            >
              {loading ? t.signingIn : <> {t.signIn} <ArrowRight size={14} weight="bold" /> </>}
            </motion.button>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4, ease: EASE }}
            className="text-[11px] mt-8 text-center"
            style={{ color: "var(--text-3)" }}
          >
            {t.terms}{" "}
            <span className="underline underline-offset-2 cursor-pointer">{t.termsLink}</span>.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
