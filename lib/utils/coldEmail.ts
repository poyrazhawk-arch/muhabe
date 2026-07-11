// Shared cold-outreach email builder.
// Used by the manual campaign sender (/api/kampanya) and the daily
// lead routine (/api/cron/gunluk-lead). Keep the two in sync by
// building every outreach email through buildColdEmailHtml.

export interface Lead {
  business_name: string;
  email: string;
  phone?: string;
  city?: string;
  rating?: string;
}

export type ColdTemplate = "tanitim" | "takip" | "son_seans";

export const FROM = process.env.RESEND_FROM_EMAIL ?? "poyraz@nixtagency.com";
export const UNSUB_BASE =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://muhasebe-poyraz.vercel.app";

// Default subject used by the daily routine when none is supplied.
export const DEFAULT_SUBJECT = "A faster way to run your accounting practice";

export function buildColdEmailHtml(lead: Lead, template: string): string {
  const name = lead.business_name ?? "Dear Accountant";
  const city = lead.city ? `, ${lead.city}` : "";
  const unsubUrl = `${UNSUB_BASE}/unsubscribe?email=${encodeURIComponent(lead.email)}`;

  const templates: Record<string, { body: string }> = {
    tanitim: {
      body: `
        <p>Hello,</p>
        <p>I'm reaching out to <strong>${name}</strong>${city}.</p>
        <p>
          I'd like to briefly introduce the <strong>Accounting SaaS</strong> platform we've built for accounting firms.
          From a single platform you can manage:
        </p>
        <ul style="padding-left:20px;line-height:2">
          <li>Automated VAT, PAYE, and Corporation Tax filing reminders</li>
          <li>Client document collection and approval workflows</li>
          <li>Service fee and payment tracking</li>
          <li>Bulk client email notifications</li>
        </ul>
        <p>
          Plans start from <strong>€20/month</strong> — with a free 14-day trial.
        </p>
        <p>
          Would you like to see a demo? Just reply to this email.
        </p>
      `,
    },
    takip: {
      body: `
        <p>Hello,</p>
        <p>I'm following up on the email I sent last week to <strong>${name}</strong>${city}.</p>
        <p>
          Could you spare 15 minutes for a quick demo?
          I'd love to show you the tax calendar automation and payment tracking live.
        </p>
        <p>Looking forward to hearing from you.</p>
      `,
    },
    son_seans: {
      body: `
        <p>Hello,</p>
        <p>
          This is my final reach-out to <strong>${name}</strong>${city} — if I haven't heard back, now may simply not be the right time, and I completely understand.
        </p>
        <p>
          If you ever find yourself looking for tax calendar automation or a client management system,
          feel free to check us out at <a href="${UNSUB_BASE}" style="color:#2563eb">our website</a>.
        </p>
        <p>Wishing you all the best.</p>
      `,
    },
  };

  const { body } = templates[template] ?? templates.tanitim;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f1f4f9;margin:0;padding:32px 16px">
  <div style="max-width:540px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e2e7ef;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.07)">

    <!-- Header -->
    <div style="background:#0d1421;padding:20px 32px;display:flex;align-items:center;gap:10px">
      <div style="width:28px;height:28px;background:linear-gradient(135deg,#3b82f6,#2563eb);border-radius:8px;display:inline-flex;align-items:center;justify-content:center">
        <span style="color:#fff;font-size:14px;font-weight:700">A</span>
      </div>
      <span style="color:#fff;font-size:14px;font-weight:600;letter-spacing:-0.02em">Accounting SaaS</span>
    </div>

    <!-- Body -->
    <div style="padding:32px;color:#374151;font-size:14px;line-height:1.75">
      ${body}
      <p style="margin-top:24px">
        Best regards,<br>
        <strong style="color:#0d1117">Poyraz</strong><br>
        <span style="color:#9ca3af;font-size:12px">Accounting SaaS · Founder</span>
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:16px 32px;background:#f8f9fc;border-top:1px solid #e2e7ef">
      <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.6">
        This email was sent for commercial purposes.
        <a href="${unsubUrl}" style="color:#9ca3af">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}
