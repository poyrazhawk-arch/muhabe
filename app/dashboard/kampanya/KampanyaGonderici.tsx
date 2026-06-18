"use client";

import { useState, useRef } from "react";
import {
  Upload,
  PaperPlaneTilt,
  CheckCircle,
  Warning,
  Spinner,
  X,
} from "@phosphor-icons/react";
import type { Lead } from "@/app/api/kampanya/route";

const TEMPLATES = [
  { value: "tanitim",    label: "1. Introduction",  desc: "First touch — introduce the product, offer a demo" },
  { value: "takip",     label: "2. Follow-up",     desc: "Send 3-4 days later if no reply" },
  { value: "son_seans", label: "3. Last Attempt",  desc: "Final try — leave the door open" },
];

function parseCsv(text: string): Lead[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.replace(/"/g, "").trim().toLowerCase());

  return lines.slice(1).map(line => {
    const values = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|(?<=,)$|^(?=,))/g) ?? [];
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (values[i] ?? "").replace(/^"|"$/g, "").trim();
    });
    return {
      business_name: row["title"] ?? row["business_name"] ?? row["name"] ?? "",
      email:         row["email"] ?? row["emails"] ?? "",
      phone:         row["phone"] ?? row["phoneunformatted"] ?? "",
      city:          row["city"] ?? row["address"] ?? "",
      rating:        row["totalrating"] ?? row["rating"] ?? "",
    } as Lead;
  }).filter(l => l.email?.includes("@"));
}

export default function KampanyaGonderici() {
  const [leads,    setLeads]    = useState<Lead[]>([]);
  const [subject,  setSubject]  = useState("Automate your accounting workflow");
  const [template, setTemplate] = useState("tanitim");
  const [status,   setStatus]   = useState<"idle" | "sending" | "done" | "error">("idle");
  const [result,   setResult]   = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [csvError, setCsvError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setCsvError("");
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      const parsed = parseCsv(text);
      if (parsed.length === 0) {
        setCsvError("No valid emails found in CSV. The file must have an 'email' or 'title' column.");
      } else {
        setLeads(parsed);
      }
    };
    reader.readAsText(file);
  }

  async function handleGonder() {
    if (!leads.length) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/kampanya", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ leads, subject, template }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Hata");
      setResult(data);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  const inputBase: React.CSSProperties = {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--text-1)",
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    outline: "none",
  };

  return (
    <div className="space-y-4 max-w-2xl">

      {/* CSV Yükleme */}
      <div
        className="rounded-xl p-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
      >
        <p className="text-[12px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-3)", letterSpacing: "0.06em" }}>
          1. Lead CSV
        </p>

        {leads.length === 0 ? (
          <div>
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex flex-col items-center gap-3 py-10 rounded-xl border-2 border-dashed transition-colors"
              style={{ borderColor: "var(--border)", color: "var(--text-3)" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)";
                (e.currentTarget as HTMLButtonElement).style.background = "var(--accent-bg)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--text-3)";
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
            >
              <Upload size={24} weight="duotone" />
              <span className="text-[13px] font-medium">Upload Apify CSV</span>
              <span className="text-[12px]">or drag and drop · must have email, title columns</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            {csvError && (
              <p className="mt-2 text-[12px] flex items-center gap-1.5" style={{ color: "var(--red)" }}>
                <Warning size={13} weight="bold" /> {csvError}
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between px-4 py-3 rounded-xl"
            style={{ background: "var(--green-bg)", border: "1px solid var(--green-lt)" }}>
            <div className="flex items-center gap-2.5">
              <CheckCircle size={18} weight="fill" style={{ color: "var(--green)" }} />
              <div>
                <p className="text-[13px] font-semibold" style={{ color: "var(--green)" }}>
                  {leads.length} valid leads loaded
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>
                  Örnek: {leads[0]?.business_name} — {leads[0]?.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => setLeads([])}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: "var(--text-3)" }}
            >
              <X size={14} weight="bold" />
            </button>
          </div>
        )}
      </div>

      {/* Ayarlar */}
      <div
        className="rounded-xl p-6 space-y-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
      >
        <p className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-3)", letterSpacing: "0.06em" }}>
          2. Campaign Settings
        </p>

        <div>
          <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
            Subject Line
          </label>
          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            style={inputBase}
            onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.08)"; }}
            onBlur={e  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}
          />
        </div>

        <div>
          <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-2)" }}>
            Email Template
          </label>
          <div className="space-y-2">
            {TEMPLATES.map(t => (
              <label
                key={t.value}
                className="flex items-start gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors"
                style={{
                  background:  template === t.value ? "var(--accent-bg)" : "var(--surface-2)",
                  border:      `1px solid ${template === t.value ? "var(--accent-lt)" : "var(--border)"}`,
                }}
              >
                <input
                  type="radio"
                  name="template"
                  value={t.value}
                  checked={template === t.value}
                  onChange={() => setTemplate(t.value)}
                  className="mt-0.5 accent-blue-600"
                />
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: template === t.value ? "var(--accent)" : "var(--text-1)" }}>
                    {t.label}
                  </p>
                  <p className="text-[12px] mt-0.5" style={{ color: "var(--text-3)" }}>{t.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Gönder */}
      <div
        className="rounded-xl p-5 flex items-center justify-between"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
      >
        {status === "done" && result ? (
          <div className="flex items-center gap-3">
            <CheckCircle size={20} weight="fill" style={{ color: "var(--green)" }} />
            <div>
              <p className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>
                Campaign complete
              </p>
              <p className="text-[12px]" style={{ color: "var(--text-3)" }}>
                {result.sent} sent · {result.failed} failed
              </p>
            </div>
          </div>
        ) : status === "error" ? (
          <p className="text-[13px] flex items-center gap-2" style={{ color: "var(--red)" }}>
            <Warning size={16} weight="bold" /> Send error — check your Resend API key
          </p>
        ) : (
          <div>
            <p className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>
              Ready to send
            </p>
            <p className="text-[12px] mt-0.5" style={{ color: "var(--text-3)" }}>
              {leads.length} leads · batches of 50 · ~{Math.ceil(leads.length / 50) * 0.3}s
            </p>
          </div>
        )}

        <button
          onClick={handleGonder}
          disabled={!leads.length || status === "sending" || status === "done"}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "var(--accent)", boxShadow: "0 2px 8px rgba(37,99,235,0.28)" }}
        >
          {status === "sending" ? (
            <>
              <Spinner size={14} className="animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <PaperPlaneTilt size={14} weight="bold" />
              {leads.length > 0 ? `Send ${leads.length} emails` : "Send"}
            </>
          )}
        </button>
      </div>

      {/* Apify hatırlatması */}
      <div
        className="rounded-xl px-5 py-4"
        style={{ background: "var(--amber-bg)", border: "1px solid var(--amber-lt)" }}
      >
        <p className="text-[12px] font-semibold mb-1" style={{ color: "var(--amber)" }}>Apify CSV format</p>
        <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-2)" }}>
          <code style={{ background: "rgba(0,0,0,0.05)", padding: "1px 5px", borderRadius: "4px", fontSize: "11px" }}>
            title, email, phoneUnformatted, city, totalScore
          </code>
          {" "}columns are auto-detected.
          Export: <strong>Apify → Storage → Dataset → Export CSV</strong>
        </p>
      </div>
    </div>
  );
}
