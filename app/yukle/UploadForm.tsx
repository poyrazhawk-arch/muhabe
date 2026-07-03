"use client";

import { useState } from "react";
import { useDict } from "@/lib/i18n/LocaleContext";

export default function UploadForm({
  token,
  documentTypes,
  message,
}: {
  token: string;
  documentTypes: string[];
  message: string | null;
}) {
  const t = useDict().yukle;
  const [files, setFiles] = useState<File[]>([]);
  const [selectedType, setSelectedType] = useState(documentTypes[0] ?? t.genericDocument);
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload() {
    if (files.length === 0) {
      setError(t.selectAtLeastOneFile);
      return;
    }
    setLoading(true);
    setError("");

    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("document_type", selectedType);

      const res = await fetch(`/api/upload?token=${token}`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.hata ?? t.uploadFailed);
        setLoading(false);
        return;
      }
    }

    setUploaded(true);
    setLoading(false);
  }

  if (uploaded) {
    return (
      <div className="text-center py-6">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-semibold text-slate-900 mb-1">{t.documentsUploaded}</h3>
        <p className="text-slate-500 text-sm">
          {files.length} {t.docsDeliveredSuccessfully}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          {message}
        </div>
      )}

      {documentTypes.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t.documentTypeLabel}</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {documentTypes.map((dt) => <option key={dt} value={dt}>{dt}</option>)}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{t.filesLabel}</label>
        <div
          className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <input
            id="file-input"
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.webp,.xlsx,.xls"
            className="hidden"
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          />
          {files.length > 0 ? (
            <div className="space-y-1">
              {files.map((f, i) => (
                <p key={i} className="text-sm text-slate-700 font-medium">{f.name}</p>
              ))}
              <p className="text-xs text-slate-400 mt-2">{t.clickToChange}</p>
            </div>
          ) : (
            <>
              <p className="text-slate-500 text-sm">{t.dragOrClickFiles}</p>
              <p className="text-slate-400 text-xs mt-1">{t.fileFormatsNote}</p>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        onClick={handleUpload}
        disabled={loading || files.length === 0}
        className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? t.uploading : files.length > 0 ? t.uploadFilesCount.replace("{count}", String(files.length)).replace("{plural}", "") : t.selectFile}
      </button>
    </div>
  );
}
