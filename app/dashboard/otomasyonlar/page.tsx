import Link from "next/link";
import OtomasyonTetikle from "./OtomasyonTetikle";
import { Clock } from "@phosphor-icons/react/dist/ssr";

const OTOMASYONLAR = [
  {
    id: "hatirlatmalar",
    baslik: "Task Reminders",
    aciklama: "Sends an email to the accountant for upcoming task deadlines.",
    zamanlama: "Daily at 09:00",
    endpoint: "/api/cron/hatirlatmalar",
    renk: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
  {
    id: "gorev-olustur",
    baslik: "Auto Task Creation",
    aciklama: "Generates monthly tasks for each client from active templates. Also creates tax calendar tasks.",
    zamanlama: "1st of every month, 08:00",
    endpoint: "/api/cron/gorev-olustur",
    renk: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
  },
  {
    id: "tahsilat-hatirlatma",
    baslik: "Overdue Payment Reminder",
    aciklama: "Detects overdue service fees and sends a polite reminder email to the client. Triggered on days 3, 7, and 14.",
    zamanlama: "Every Monday at 09:00",
    endpoint: "/api/cron/tahsilat-hatirlatma",
    renk: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
  },
  {
    id: "aylik-ozet",
    baslik: "Monthly Summary Email",
    aciklama: "Sends each client a summary of completed tasks, approved documents, and pending items for the month.",
    zamanlama: "28th of every month, 09:00",
    endpoint: "/api/cron/aylik-ozet",
    renk: "#15803d",
    bg: "#f0fdf4",
    border: "#bbf7d0",
  },
];

export default function OtomasyonlarPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-1)" }}>
          Automations
        </h1>
        <p className="text-[13px] mt-0.5" style={{ color: "var(--text-3)" }}>
          Scheduled jobs — run manually or let them fire automatically
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
                      Active
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
          How it works
        </p>
        <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-2)" }}>
          Automations are triggered automatically by Vercel Cron at the scheduled times.
          Use the &quot;Run now&quot; button to test them instantly.
          For email delivery,{" "}
          <code style={{ background: "rgba(0,0,0,0.06)", padding: "1px 5px", borderRadius: "4px", fontSize: "11px" }}>
            RESEND_API_KEY
          </code>{" "}
          and{" "}
          <code style={{ background: "rgba(0,0,0,0.06)", padding: "1px 5px", borderRadius: "4px", fontSize: "11px" }}>
            CRON_SECRET
          </code>{" "}
          env variables must be defined.
        </p>
      </div>
    </div>
  );
}
