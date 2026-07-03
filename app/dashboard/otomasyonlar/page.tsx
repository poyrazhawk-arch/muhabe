import Link from "next/link";
import OtomasyonTetikle from "./OtomasyonTetikle";
import { Clock } from "@phosphor-icons/react/dist/ssr";
import { getLocale } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n/dictionaries";

export default async function OtomasyonlarPage() {
  const locale = await getLocale();
  const t = getDict(locale).otomasyonlar;

  const OTOMASYONLAR = [
    {
      id: "hatirlatmalar",
      baslik: t.remindersTitle,
      aciklama: t.remindersDesc,
      zamanlama: t.remindersSchedule,
      endpoint: "/api/cron/hatirlatmalar",
      renk: "#2563eb",
      bg: "#eff6ff",
      border: "#bfdbfe",
    },
    {
      id: "gorev-olustur",
      baslik: t.taskCreateTitle,
      aciklama: t.taskCreateDesc,
      zamanlama: t.taskCreateSchedule,
      endpoint: "/api/cron/gorev-olustur",
      renk: "#7c3aed",
      bg: "#f5f3ff",
      border: "#ddd6fe",
    },
    {
      id: "tahsilat-hatirlatma",
      baslik: t.overdueReminderTitle,
      aciklama: t.overdueReminderDesc,
      zamanlama: t.overdueReminderSchedule,
      endpoint: "/api/cron/tahsilat-hatirlatma",
      renk: "#dc2626",
      bg: "#fef2f2",
      border: "#fecaca",
    },
    {
      id: "aylik-ozet",
      baslik: t.monthlySummaryTitle,
      aciklama: t.monthlySummaryDesc,
      zamanlama: t.monthlySummarySchedule,
      endpoint: "/api/cron/aylik-ozet",
      renk: "#15803d",
      bg: "#f0fdf4",
      border: "#bbf7d0",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-1)" }}>
          {t.pageTitle}
        </h1>
        <p className="text-[13px] mt-0.5" style={{ color: "var(--text-3)" }}>
          {t.pageSub}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {OTOMASYONLAR.map((o) => (
          <div
            key={o.id}
            className="rounded-xl p-5"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: o.bg, border: `1px solid ${o.border}` }}
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: o.renk }} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-[14px] font-semibold" style={{ color: "var(--text-1)" }}>
                      {o.baslik}
                    </h2>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                      style={{ background: o.bg, color: o.renk, border: `1px solid ${o.border}` }}
                    >
                      {t.active}
                    </span>
                  </div>
                  <p className="text-[13px] mt-1 leading-relaxed" style={{ color: "var(--text-3)" }}>
                    {o.aciklama}
                  </p>
                  <p className="text-[12px] mt-2 font-medium flex items-center gap-1.5" style={{ color: "var(--text-2)" }}>
                    <Clock size={12} weight="regular" style={{ color: "var(--text-3)" }} />
                    {o.zamanlama}
                  </p>
                </div>
              </div>
              <OtomasyonTetikle endpoint={o.endpoint} baslik={o.baslik} />
            </div>
          </div>
        ))}
      </div>

      <div
        className="rounded-xl px-5 py-4"
        style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-lt)" }}
      >
        <p className="text-[12px] font-semibold mb-1" style={{ color: "var(--accent)" }}>
          {t.howItWorksTitle}
        </p>
        <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-2)" }}>
          {t.howItWorksBody}{" "}
          <code style={{ background: "rgba(0,0,0,0.06)", padding: "1px 5px", borderRadius: "4px", fontSize: "11px" }}>
            RESEND_API_KEY
          </code>{" "}
          {t.andEnvVar}{" "}
          <code style={{ background: "rgba(0,0,0,0.06)", padding: "1px 5px", borderRadius: "4px", fontSize: "11px" }}>
            CRON_SECRET
          </code>{" "}
          {t.envVarsRequired}
        </p>
      </div>
    </div>
  );
}
