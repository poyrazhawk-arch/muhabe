"use client";

import { useState } from "react";

const BELGE_TURLERI = [
  "Invoice",
  "Bank Statement",
  "Payroll",
  "Contract",
  "Tax Certificate",
  "HMRC Document",
  "Other",
];

export default function BelgeIsteButton({
  clientId,
  clientName,
}: {
  clientId: string;
  clientName: string;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(["Invoice"]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ url: string } | null>(null);
  const [copied, setCopied] = useState(false);

  function toggle(type: string) {
    setSelected((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  async function handleCreate() {
    if (selected.length === 0) return;
    setLoading(true);
    const res = await fetch("/api/upload-tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, document_types: selected, message }),
    });
    const data = await res.json();
    if (res.ok) setResult({ url: data.upload_url });
    setLoading(false);
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        + Request Documents
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            {result ? (
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Upload link ready!</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Send this link to {clientName}:
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 break-all mb-4">
                  {result.url}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    {copied ? "Copied!" : "Copy link"}
                  </button>
                  <button
                    onClick={() => { setOpen(false); setResult(null); setSelected(["Invoice"]); setMessage(""); }}
                    className="flex-1 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">Document Request — {clientName}</h3>

                <p className="text-sm font-medium text-slate-700 mb-2">Document types</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {BELGE_TURLERI.map((t) => (
                    <button
                      key={t}
                      onClick={() => toggle(t)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        selected.includes(t)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-600 border-slate-300 hover:border-blue-400"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Message to client (optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={2}
                    placeholder="e.g. Please upload January invoices"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCreate}
                    disabled={loading || selected.length === 0}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Creating…" : "Create link"}
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="flex-1 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
