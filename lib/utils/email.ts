import { Resend } from "resend";

function resend() { return new Resend(process.env.RESEND_API_KEY); }
const FROM = process.env.RESEND_FROM_EMAIL ?? "info@nixtagency.com";

// ── Shared layout ────────────────────────────────────────────────────────────
function layout(body: string, accountantName?: string) {
  return `<!DOCTYPE html><html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;margin:0;padding:32px 16px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e8edf2;overflow:hidden">
    <div style="background:#0c1524;padding:20px 28px;display:flex;align-items:center;gap:10px">
      <div style="width:28px;height:28px;background:#2563eb;border-radius:6px;display:inline-flex;align-items:center;justify-content:center">
        <span style="color:#fff;font-size:14px;font-weight:700">L</span>
      </div>
      <span style="color:#93c5fd;font-size:13px;font-weight:600;margin-left:8px">Ledger</span>
    </div>
    <div style="padding:28px">${body}</div>
    <div style="padding:14px 28px;background:#f8fafc;border-top:1px solid #e8edf2">
      <p style="margin:0;font-size:12px;color:#9ca3af">
        ${accountantName ? `Sent by <strong>${accountantName}</strong> via ` : ""}Ledger · Practice Management
      </p>
    </div>
  </div>
</body></html>`;
}

// ── 1. Accountant: new document uploaded ────────────────────────────────────
export async function sendBelgeYuklemeBildirimi(p: {
  to: string; musteriAdi: string; belgeAdi: string; belgeUrl: string;
}) {
  return resend().emails.send({
    from: FROM, to: p.to,
    subject: `New document from ${p.musteriAdi}`,
    html: layout(`
      <h2 style="color:#111827;font-size:17px;font-weight:700;margin:0 0 12px">New document uploaded</h2>
      <p style="color:#374151;margin:0 0 16px"><strong>${p.musteriAdi}</strong> has uploaded a new document.</p>
      <div style="background:#f1f5f9;border-radius:8px;padding:14px;margin-bottom:20px">
        <p style="margin:0;font-size:13px;color:#64748b">Document</p>
        <p style="margin:4px 0 0;font-weight:600;color:#1e293b">${p.belgeAdi}</p>
      </div>
      <a href="${p.belgeUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600">
        Review document →
      </a>
    `),
  });
}

// ── 2. Accountant: task reminder ─────────────────────────────────────────────
export async function sendHatirlatma(p: {
  to: string; gorevBasligi: string; musteriAdi?: string; sonTarih: string; kalanGun: number;
}) {
  const urgent = p.kalanGun <= 1;
  return resend().emails.send({
    from: FROM, to: p.to,
    subject: `Reminder: ${p.gorevBasligi} — ${p.kalanGun === 0 ? "Due today" : `${p.kalanGun} days left`}`,
    html: layout(`
      <h2 style="color:#111827;font-size:17px;font-weight:700;margin:0 0 12px">Task reminder</h2>
      <p style="color:#374151;margin:0 0 16px"><strong>${p.gorevBasligi}</strong> is due soon.</p>
      <div style="background:${urgent ? "#fef2f2" : "#fffbeb"};border:1px solid ${urgent ? "#fca5a5" : "#fde68a"};border-radius:8px;padding:16px;margin-bottom:20px">
        ${p.musteriAdi ? `<p style="margin:0 0 4px;color:#92400e;font-size:13px">Client: <strong>${p.musteriAdi}</strong></p>` : ""}
        <p style="margin:0;color:${urgent ? "#b91c1c" : "#92400e"};font-size:13px">Due: <strong>${p.sonTarih}</strong></p>
        <p style="margin:4px 0 0;font-size:13px;color:${urgent ? "#b91c1c" : "#92400e"}">${p.kalanGun === 0 ? "Due today" : `${p.kalanGun} days remaining`}</p>
      </div>
    `),
  });
}

// ── 3. Client: document upload request ──────────────────────────────────────
export async function sendBelgeIstegiEmail(p: {
  to: string; clientName: string; accountantName: string;
  uploadUrl: string; documentTypes: string[]; message?: string;
}) {
  return resend().emails.send({
    from: FROM, to: p.to,
    subject: `Document request from ${p.accountantName}`,
    html: layout(`
      <h2 style="color:#111827;font-size:17px;font-weight:700;margin:0 0 12px">Document request</h2>
      <p style="color:#374151;margin:0 0 16px">Dear <strong>${p.clientName}</strong>,</p>
      <p style="color:#374151;margin:0 0 16px">
        Your accountant <strong>${p.accountantName}</strong> is requesting the following documents:
      </p>
      <div style="background:#f1f5f9;border-radius:8px;padding:14px;margin-bottom:20px">
        ${p.documentTypes.map(d => `<p style="margin:3px 0;color:#1e293b;font-size:13px">• ${d}</p>`).join("")}
      </div>
      ${p.message ? `<p style="color:#374151;font-size:13px;margin-bottom:20px;padding:12px;background:#fffbeb;border-radius:8px;border:1px solid #fde68a">${p.message}</p>` : ""}
      <a href="${p.uploadUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600">
        Upload documents →
      </a>
      <p style="color:#9ca3af;font-size:12px;margin-top:16px">This link expires in 48 hours.</p>
    `, p.accountantName),
  });
}

// ── 4. Client: service fee invoice ──────────────────────────────────────────
export async function sendFeeInvoiceEmail(p: {
  to: string; clientName: string; accountantName: string;
  period: string; amount: string; dueDate?: string; notes?: string;
}) {
  return resend().emails.send({
    from: FROM, to: p.to,
    subject: `Service fee — ${p.period}`,
    html: layout(`
      <h2 style="color:#111827;font-size:17px;font-weight:700;margin:0 0 12px">Service fee</h2>
      <p style="color:#374151;margin:0 0 20px">Dear <strong>${p.clientName}</strong>,</p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin-bottom:24px;text-align:center">
        <p style="margin:0;font-size:11px;color:#15803d;font-weight:600;letter-spacing:0.08em;text-transform:uppercase">Amount Due</p>
        <p style="margin:8px 0 4px;font-size:30px;font-weight:700;color:#14532d;letter-spacing:-0.03em">${p.amount}</p>
        <p style="margin:0;font-size:13px;color:#15803d">${p.period}</p>
        ${p.dueDate ? `<p style="margin:6px 0 0;font-size:12px;color:#6b7280">Due: ${p.dueDate}</p>` : ""}
      </div>
      ${p.notes ? `<p style="color:#374151;font-size:13px;margin-bottom:20px">${p.notes}</p>` : ""}
      <p style="color:#6b7280;font-size:13px;margin:0">
        Please arrange payment via BACS or your usual method.
        Once paid, you do not need to take any further action.
      </p>
    `, p.accountantName),
  });
}

// ── 5. Accountant: upcoming deadline digest ──────────────────────────────────
export async function sendDeadlineDigest(p: {
  to: string; accountantName: string; locale?: "tr" | "en";
  deadlines: { title: string; dueDate: string; daysLeft: number }[];
}) {
  const tr = p.locale === "tr";
  const daysLabel = (n: number) =>
    tr ? (n === 0 ? "Bugün" : n === 1 ? "Yarın" : `${n} gün`)
       : (n === 0 ? "Today" : n === 1 ? "Tomorrow" : `${n} days`);

  const rows = p.deadlines.map(d => {
    const color = d.daysLeft <= 3 ? "#dc2626" : d.daysLeft <= 7 ? "#d97706" : "#2563eb";
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f1f5f9">
        <div>
          <p style="margin:0;font-size:13px;font-weight:600;color:#1e293b">${d.title}</p>
          <p style="margin:2px 0 0;font-size:12px;color:#6b7280">${d.dueDate}</p>
        </div>
        <span style="font-size:12px;font-weight:700;color:${color};white-space:nowrap;margin-left:12px">
          ${daysLabel(d.daysLeft)}
        </span>
      </div>`;
  }).join("");

  return resend().emails.send({
    from: FROM, to: p.to,
    subject: tr
      ? `Önümüzdeki 14 günde ${p.deadlines.length} son tarih`
      : `${p.deadlines.length} deadline${p.deadlines.length === 1 ? "" : "s"} in the next 14 days`,
    html: layout(`
      <h2 style="color:#111827;font-size:17px;font-weight:700;margin:0 0 6px">${tr ? "Yaklaşan son tarihler" : "Upcoming deadlines"}</h2>
      <p style="color:#6b7280;font-size:13px;margin:0 0 20px">${tr ? "Önümüzdeki 14 gün" : "Next 14 days"}</p>
      ${rows}
    `, p.accountantName),
  });
}
