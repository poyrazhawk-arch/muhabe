"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  Notebook, ArrowRight, FolderOpen, CalendarCheck, Wallet, ChatCircleDots,
  Clock, Warning, CheckCircle, Quotes, ShieldCheck, Lock, CaretRight,
} from "@phosphor-icons/react";
import { useLocale } from "@/lib/i18n/LocaleContext";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const RED = "#c85460";
const INK = "#081120";

const up = (d = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, delay: d, ease: EASE },
});

const COPY = {
  tr: {
    nav:   { pricing: "Fiyatlar", login: "Giriş yap", cta: "14 gün ücretsiz" },
    hero: {
      eyebrow: "MUHASEBE BÜROLARI İÇİN",
      h1a: "Mükellef kovalamayı",
      h1b: "bırakın.",
      sub: "Belge toplama, beyanname takvimi ve tahsilat — üçü de tek panelde, otomatik. Ayda ortalama 6-10 saatlik evrak ve iletişim telaşı ortadan kalkar.",
      cta: "Ücretsiz denemeyi başlat",
      ctaNote: "Kredi kartı gerekmez · 2 dakikada kurulum",
      trust: "KVKK uyumlu · AB veri merkezi · SSL şifreli",
    },
    lossTitle: "Her ay farkında olmadan kaybettikleriniz",
    loss: [
      { icon: Clock,   n: "6-10 saat", t: "mükelleften belge toplamak ve \"gönderdim\" sorularını yanıtlamak" },
      { icon: Warning, n: "%15-20",    t: "unutulan veya geç hatırlanan hizmet bedeli tahsilatı" },
      { icon: CalendarCheck, n: "1 gecikme", t: "kaçan bir beyanname = ceza + itibar kaybı + huzursuz mükellef" },
    ],
    featTitle: "Değişen tek şey: siz kovalamayı bırakırsınız",
    featSub: "Sistem hatırlatır, takip eder, toplar. Siz işinize bakarsınız.",
    features: [
      { icon: FolderOpen,   h: "Belge toplama, otomatik takiple", p: "Mükellefe tek link gönderin — giriş yapması gerekmez. Yüklemezse sistem 3 günde bir, kibar bir dille kendisi hatırlatır. Siz sadece bildirim alır, onaylarsınız." },
      { icon: CalendarCheck, h: "GİB beyanname takvimi", p: "KDV, muhtasar, SGK, geçici vergi, kurumlar — her mükellef için görevler otomatik oluşur. Hiçbir tarih gözden kaçmaz." },
      { icon: Wallet,       h: "Hizmet bedeli ve tahsilat takibi", p: "Kimden ne kadar alacağınızı ve kimin ödemediğini görün. Geciken ödeme için otomatik hatırlatma — kaçan tahsilat sıfırlanır." },
      { icon: ChatCircleDots, h: "WhatsApp ile tek tık hatırlatma", p: "Türkiye'de e-posta açılmaz. Bekleyen evrak ve tahsilat için hazır mesajla WhatsApp'ı tek tıkta açın." },
    ],
    portalTitle: "Mükellefiniz de rahat eder",
    portalSub: "Kendi linkinden belgelerinin durumunu, açık işlerini ve tarihlerini görür. \"Belgem ulaştı mı?\" telefonları biter.",
    stepsTitle: "3 adımda başlarsınız",
    steps: [
      { n: "01", h: "Mükelleflerinizi ekleyin", p: "Tek tek ya da Excel/CSV ile toplu içe aktarın. 2 dakika." },
      { n: "02", h: "Belge linkini gönderin", p: "Sistem hatırlatmayı üstlenir; siz sadece geleni onaylarsınız." },
      { n: "03", h: "Takvimi otomatiğe alın", p: "Beyanname görevleri kendi oluşur, son tarihler size hatırlatılır." },
    ],
    quote: "Büronun en çok vaktini alan iş, işin kendisi değil; mükelleften evrak istemek. O telaşı bitiren araç.",
    quoteBy: "Ledger — muhasebe iş akışı",
    pricingTitle: "Ayda bir kahve fiyatına, kaybettiğiniz saatler geri",
    pricingSub: "En popüler plan aylık ₺600 — kazandırdığı zamanın (haftada ~3 saat) yanında maliyeti neredeyse yok. 14 gün ücretsiz deneyin, kart istemiyoruz.",
    pricingCta: "Planları gör",
    finalH: "Bu ayın beyanname telaşını sistemle karşılayın",
    finalSub: "14 gün ücretsiz. Beğenmezseniz tek tıkla iptal. Kaybedecek bir şeyiniz yok — kovalamaya devam etmek dışında.",
    finalCta: "Ücretsiz hesabımı oluştur",
    footerTag: "Muhasebe büroları için belge, görev ve tahsilat yönetimi.",
    footerPricing: "Fiyatlar", footerLogin: "Giriş", footerPrivacy: "Gizlilik & KVKK", footerContact: "İletişim",
  },
  en: {
    nav:   { pricing: "Pricing", login: "Sign in", cta: "Start free" },
    hero: {
      eyebrow: "FOR ACCOUNTING FIRMS",
      h1a: "Stop chasing",
      h1b: "clients.",
      sub: "Document collection, filing calendar and fee tracking — all in one panel, automated. Reclaim the 6-10 hours a month lost to paperwork and back-and-forth.",
      cta: "Start free trial",
      ctaNote: "No credit card · 2-minute setup",
      trust: "GDPR-ready · EU data centre · SSL encrypted",
    },
    lossTitle: "What you quietly lose every month",
    loss: [
      { icon: Clock,   n: "6-10 hrs", t: "collecting documents and answering \"did you get it?\"" },
      { icon: Warning, n: "15-20%",   t: "of fees forgotten or collected late" },
      { icon: CalendarCheck, n: "1 miss", t: "a missed filing = penalty + lost trust" },
    ],
    featTitle: "The one thing that changes: you stop chasing",
    featSub: "The system reminds, follows up and collects. You do the work.",
    features: [
      { icon: FolderOpen,   h: "Document collection that chases for you", p: "Send one link — no client login. If they don't upload, the system reminds them every 3 days, politely. You just approve." },
      { icon: CalendarCheck, h: "Filing calendar", p: "Every recurring filing becomes a task automatically. Nothing slips." },
      { icon: Wallet,       h: "Fee & collection tracking", p: "See who owes what and who hasn't paid. Automatic reminders for overdue fees." },
      { icon: ChatCircleDots, h: "One-tap reminders", p: "Prefilled reminder messages for pending documents and payments." },
    ],
    portalTitle: "Your clients get peace of mind too",
    portalSub: "They see their document status, open items and dates from their own link. No more \"did it arrive?\" calls.",
    stepsTitle: "Up and running in 3 steps",
    steps: [
      { n: "01", h: "Add your clients", p: "One by one or bulk-import via CSV. Two minutes." },
      { n: "02", h: "Send the document link", p: "The system handles reminders; you just approve." },
      { n: "03", h: "Automate the calendar", p: "Filing tasks generate themselves; deadlines get flagged." },
    ],
    quote: "The most time-consuming part of a firm isn't the work — it's asking clients for paperwork. This ends that.",
    quoteBy: "Ledger — accounting workflow",
    pricingTitle: "For the price of a few coffees, get your hours back",
    pricingSub: "The popular plan is €40/mo — nothing next to the ~3 hours a week it saves. 14 days free, no card.",
    pricingCta: "See plans",
    finalH: "Meet this month's deadlines with a system, not stress",
    finalSub: "14 days free. Cancel in one click. Nothing to lose — except the chasing.",
    finalCta: "Create my free account",
    footerTag: "Document, task and fee management for accounting firms.",
    footerPricing: "Pricing", footerLogin: "Sign in", footerPrivacy: "Privacy", footerContact: "Contact",
  },
};

export default function LandingPage() {
  const locale = useLocale();
  const c = COPY[locale === "en" ? "en" : "tr"];

  return (
    <div style={{ background: "#f6f5f2", color: INK, minHeight: "100dvh", fontFamily: "var(--font-sans)" }}>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(246,245,242,0.82)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(8,17,32,0.07)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "13px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: INK, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Notebook size={15} weight="fill" style={{ color: "#9db8d9" }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em" }}>Ledger</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <Link href="/pricing" style={{ fontSize: 13.5, fontWeight: 500, color: "#4a5568", textDecoration: "none" }}>{c.nav.pricing}</Link>
            <Link href="/auth/giris" style={{ fontSize: 13.5, fontWeight: 500, color: "#4a5568", textDecoration: "none" }}>{c.nav.login}</Link>
            <Link href="/auth/kayit" style={{ fontSize: 13.5, fontWeight: 600, color: "#fff", background: INK, padding: "8px 16px", borderRadius: 9, textDecoration: "none" }}>
              {c.nav.cta}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero (dark ledger) ──────────────────────────────── */}
      <header style={{ position: "relative", overflow: "hidden", background: INK, color: "#e6edf6" }}>
        {/* ruled lines */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "repeating-linear-gradient(to bottom, transparent 0 33px, rgba(139,168,204,0.05) 33px 34px)" }} />
        {/* red margin */}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: "8%", width: 1, background: "rgba(200,84,96,0.28)" }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: "calc(8% + 5px)", width: 1, background: "rgba(200,84,96,0.14)" }} />

        <div style={{ position: "relative", maxWidth: 1120, margin: "0 auto", padding: "88px 24px 96px", textAlign: "center" }}>
          <motion.p {...up(0)} style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, letterSpacing: "0.22em", color: "#5d7a99", marginBottom: 22 }}>
            {c.hero.eyebrow}
          </motion.p>
          <motion.h1 {...up(0.08)} style={{ fontSize: "clamp(38px,6vw,72px)", fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.02, margin: "0 auto", maxWidth: 820 }}>
            {c.hero.h1a}{" "}
            <span style={{ position: "relative", display: "inline-block", color: "#fff" }}>
              {c.hero.h1b}
              <svg viewBox="0 0 200 10" preserveAspectRatio="none" style={{ position: "absolute", left: 0, bottom: -6, width: "100%", height: 9 }}>
                <path d="M2 6 C50 2, 150 9, 198 4" stroke={RED} strokeWidth="3" strokeLinecap="round" fill="none" />
              </svg>
            </span>
          </motion.h1>
          <motion.p {...up(0.16)} style={{ fontSize: "clamp(15px,2vw,18px)", color: "#8fa9c7", lineHeight: 1.65, maxWidth: 560, margin: "28px auto 0" }}>
            {c.hero.sub}
          </motion.p>
          <motion.div {...up(0.24)} style={{ marginTop: 36, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <Link href="/auth/kayit" style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "#fff", color: INK, fontSize: 15, fontWeight: 700, padding: "14px 28px", borderRadius: 11, textDecoration: "none", boxShadow: "0 8px 30px rgba(0,0,0,0.35)" }}>
              {c.hero.cta} <ArrowRight size={17} weight="bold" />
            </Link>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#5d7a99" }}>{c.hero.ctaNote}</span>
          </motion.div>
          <motion.p {...up(0.32)} style={{ marginTop: 44, fontSize: 11.5, color: "#3d5670", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <ShieldCheck size={14} weight="fill" style={{ color: "#4a6480" }} /> {c.hero.trust}
          </motion.p>
        </div>
        <div style={{ position: "absolute", bottom: 0, inset: "auto 0 0", height: 80, background: "linear-gradient(to top, #f6f5f2, transparent)" }} />
      </header>

      {/* ── Loss aversion ───────────────────────────────────── */}
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "80px 24px 24px" }}>
        <motion.h2 {...up()} style={{ fontSize: "clamp(24px,3.4vw,34px)", fontWeight: 700, letterSpacing: "-0.035em", textAlign: "center", maxWidth: 640, margin: "0 auto 44px", textWrap: "balance" as const }}>
          {c.lossTitle}
        </motion.h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
          {c.loss.map((l, i) => (
            <motion.div key={i} {...up(i * 0.08)} style={{ background: "#fff", border: "1px solid rgba(8,17,32,0.08)", borderRadius: 16, padding: "26px 24px" }}>
              <l.icon size={22} weight="duotone" style={{ color: RED }} />
              <p style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.04em", margin: "16px 0 6px", fontVariantNumeric: "tabular-nums" }}>{l.n}</p>
              <p style={{ fontSize: 14, color: "#5a6577", lineHeight: 1.55 }}>{l.t}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "72px 24px" }}>
        <motion.div {...up()} style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: "clamp(24px,3.4vw,36px)", fontWeight: 700, letterSpacing: "-0.035em", maxWidth: 640, margin: "0 auto", textWrap: "balance" as const }}>{c.featTitle}</h2>
          <p style={{ fontSize: 16, color: "#5a6577", marginTop: 14 }}>{c.featSub}</p>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
          {c.features.map((f, i) => (
            <motion.div key={i} {...up(i * 0.06)} style={{ background: "#fff", border: "1px solid rgba(8,17,32,0.08)", borderRadius: 18, padding: "30px 28px" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#eef2f8", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                <f.icon size={22} weight="duotone" style={{ color: INK }} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 9 }}>{f.h}</h3>
              <p style={{ fontSize: 14.5, color: "#5a6577", lineHeight: 1.65 }}>{f.p}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Halo quote ──────────────────────────────────────── */}
      <section style={{ background: INK, color: "#dce6f2" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "72px 24px", textAlign: "center" }}>
          <Quotes size={34} weight="fill" style={{ color: RED, opacity: 0.9 }} />
          <motion.p {...up(0.05)} style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.45, margin: "20px 0 18px", textWrap: "balance" as const }}>
            {c.quote}
          </motion.p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.1em", color: "#5d7a99" }}>{c.quoteBy}</p>
        </div>
      </section>

      {/* ── Steps ───────────────────────────────────────────── */}
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "80px 24px" }}>
        <motion.h2 {...up()} style={{ fontSize: "clamp(24px,3.4vw,34px)", fontWeight: 700, letterSpacing: "-0.035em", textAlign: "center", marginBottom: 48 }}>{c.stepsTitle}</motion.h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 28 }}>
          {c.steps.map((s, i) => (
            <motion.div key={i} {...up(i * 0.08)}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 34, fontWeight: 700, color: RED, letterSpacing: "-0.02em" }}>{s.n}</p>
              <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", margin: "10px 0 8px" }}>{s.h}</h3>
              <p style={{ fontSize: 14.5, color: "#5a6577", lineHeight: 1.6 }}>{s.p}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Pricing teaser (framing) ────────────────────────── */}
      <section style={{ maxWidth: 880, margin: "0 auto 8px", padding: "0 24px" }}>
        <motion.div {...up()} style={{ background: "#fff", border: `1px solid rgba(8,17,32,0.1)`, borderRadius: 22, padding: "48px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: RED }} />
          <h2 style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, letterSpacing: "-0.035em", maxWidth: 560, margin: "0 auto 14px", textWrap: "balance" as const }}>{c.pricingTitle}</h2>
          <p style={{ fontSize: 15.5, color: "#5a6577", lineHeight: 1.6, maxWidth: 520, margin: "0 auto 28px" }}>{c.pricingSub}</p>
          <Link href="/pricing" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: INK, color: "#fff", fontSize: 14.5, fontWeight: 600, padding: "13px 26px", borderRadius: 11, textDecoration: "none" }}>
            {c.pricingCta} <CaretRight size={15} weight="bold" />
          </Link>
        </motion.div>
      </section>

      {/* ── Final CTA (loss aversion) ───────────────────────── */}
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "72px 24px 40px", textAlign: "center" }}>
        <motion.h2 {...up()} style={{ fontSize: "clamp(26px,3.6vw,40px)", fontWeight: 700, letterSpacing: "-0.04em", maxWidth: 620, margin: "0 auto 16px", textWrap: "balance" as const }}>{c.finalH}</motion.h2>
        <motion.p {...up(0.06)} style={{ fontSize: 16, color: "#5a6577", lineHeight: 1.6, maxWidth: 500, margin: "0 auto 30px" }}>{c.finalSub}</motion.p>
        <motion.div {...up(0.12)}>
          <Link href="/auth/kayit" style={{ display: "inline-flex", alignItems: "center", gap: 9, background: INK, color: "#fff", fontSize: 16, fontWeight: 700, padding: "15px 32px", borderRadius: 12, textDecoration: "none", boxShadow: "0 10px 30px rgba(8,17,32,0.22)" }}>
            {c.finalCta} <ArrowRight size={17} weight="bold" />
          </Link>
        </motion.div>
        <p style={{ marginTop: 18, fontSize: 12.5, color: "#8a94a3", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
          <CheckCircle size={14} weight="fill" style={{ color: "#16a34a" }} /> {c.hero.ctaNote}
        </p>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid rgba(8,17,32,0.08)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "36px 24px", display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ maxWidth: 320 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: INK, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Notebook size={13} weight="fill" style={{ color: "#9db8d9" }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Ledger</span>
            </div>
            <p style={{ fontSize: 12.5, color: "#8a94a3", lineHeight: 1.5 }}>{c.footerTag}</p>
          </div>
          <div style={{ display: "flex", gap: 24, fontSize: 13, flexWrap: "wrap" }}>
            <Link href="/pricing" style={{ color: "#5a6577", textDecoration: "none" }}>{c.footerPricing}</Link>
            <Link href="/auth/giris" style={{ color: "#5a6577", textDecoration: "none" }}>{c.footerLogin}</Link>
            <Link href="/gizlilik" style={{ color: "#5a6577", textDecoration: "none" }}>{c.footerPrivacy}</Link>
            <a href="mailto:poyrazhawk@gmail.com" style={{ color: "#5a6577", textDecoration: "none" }}>{c.footerContact}</a>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(8,17,32,0.06)", padding: "16px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 11.5, color: "#a0a8b4", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Lock size={12} /> © {new Date().getFullYear()} Ledger · KVKK uyumlu · AB veri merkezi
          </p>
        </div>
      </footer>
    </div>
  );
}
