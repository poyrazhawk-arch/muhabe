"use client";

import { useState } from "react";
import { useDict } from "@/lib/i18n/LocaleContext";

export default function OtomasyonTetikle({
  endpoint,
  baslik,
}: {
  endpoint: string;
  baslik: string;
}) {
  const t = useDict().otomasyonlar;
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [sonuc, setSonuc] = useState<string>("");

  async function handleTetikle() {
    setStatus("loading");
    setSonuc("");
    try {
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? "test"}` },
      });
      const data = await res.json();
      setSonuc(JSON.stringify(data));
      setStatus("done");
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <div className="shrink-0 text-right">
      <button
        onClick={handleTetikle}
        disabled={status === "loading"}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all active:scale-[0.97] disabled:opacity-50"
        style={{
          background: status === "done" ? "var(--green-bg)" : status === "error" ? "var(--red-bg)" : "var(--surface-2)",
          color: status === "done" ? "var(--green)" : status === "error" ? "var(--red)" : "var(--text-2)",
          border: `1px solid ${status === "done" ? "var(--green-lt)" : status === "error" ? "var(--red-lt)" : "var(--border)"}`,
        }}
      >
        {status === "loading" ? (
          <>
            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {t.running}
          </>
        ) : status === "done" ? (
          `✓ ${t.done}`
        ) : status === "error" ? (
          t.errorOccurred
        ) : (
          t.runNow
        )}
      </button>
      {sonuc && status === "done" && (
        <p className="text-[10px] mt-1.5 font-mono max-w-[180px] truncate" style={{ color: "var(--text-3)" }}>
          {sonuc}
        </p>
      )}
    </div>
  );
}
