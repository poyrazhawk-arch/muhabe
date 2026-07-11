import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { buildColdEmailHtml, FROM, UNSUB_BASE } from "@/lib/utils/coldEmail";

// Re-exported for backward compat with existing imports (KampanyaGonderici).
export type { Lead } from "@/lib/utils/coldEmail";
import type { Lead } from "@/lib/utils/coldEmail";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { leads, subject, template }: { leads: Lead[]; subject: string; template: string } = body;

  if (!leads?.length) return NextResponse.json({ error: "Lead list is empty" }, { status: 400 });
  if (!subject)       return NextResponse.json({ error: "Subject line is required" }, { status: 400 });

  const validLeads = leads.filter(l => l.email && l.email.includes("@"));

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  // Resend batch max 100 per call — send in groups of 50
  for (let i = 0; i < validLeads.length; i += 50) {
    const batch = validLeads.slice(i, i + 50).map(lead => ({
      from: `Accounting SaaS <${FROM}>`,
      to:   [lead.email],
      subject,
      html: buildColdEmailHtml(lead, template),
      headers: {
        "List-Unsubscribe": `<${UNSUB_BASE}/unsubscribe?email=${encodeURIComponent(lead.email)}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }));

    try {
      await resend.batch.send(batch);
      sent += batch.length;
    } catch (e: any) {
      failed += batch.length;
      errors.push(e?.message ?? "Unknown error");
    }

    // Rate limit protection — wait 300ms between batches
    if (i + 50 < validLeads.length) {
      await new Promise(r => setTimeout(r, 300));
    }
  }

  return NextResponse.json({ sent, failed, total: validLeads.length, errors });
}
