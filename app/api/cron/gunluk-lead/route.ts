import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  buildColdEmailHtml,
  FROM,
  UNSUB_BASE,
  DEFAULT_SUBJECT,
  type Lead,
} from "@/lib/utils/coldEmail";

const resend = new Resend(process.env.RESEND_API_KEY!);

// How many leads to contact per day. The scrapling workflow feeds ~100 fresh
// leads/day into the table; this cron drains the oldest 100 that are still
// 'new', emails them, and marks them 'contacted' so they are never re-sent.
const DAILY_LIMIT = 100;
const BATCH_SIZE = 50; // Resend batch.send cap-friendly chunk size

// GET /api/cron/gunluk-lead[?template=tanitim&subject=...]
// The daily lead routine: pull up to 100 not-yet-contacted leads and send
// each a cold outreach email via Resend. Scheduled daily in vercel.json;
// also runnable on demand from the Automations page.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const template = searchParams.get("template") ?? "tanitim";
  const subject = searchParams.get("subject") ?? DEFAULT_SUBJECT;

  const supabase = await createServiceClient();

  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, business_name, email, phone, city, rating")
    .eq("status", "new")
    .order("created_at", { ascending: true })
    .limit(DAILY_LIMIT);

  if (error) {
    console.error("Daily lead routine: fetch failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!leads || leads.length === 0) {
    return NextResponse.json({ sent: 0, message: "No new leads to contact" });
  }

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < leads.length; i += BATCH_SIZE) {
    const chunk = leads.slice(i, i + BATCH_SIZE) as (Lead & { id: string })[];

    const batch = chunk.map((lead) => ({
      from: `Accounting SaaS <${FROM}>`,
      to: [lead.email],
      subject,
      html: buildColdEmailHtml(lead, template),
      headers: {
        "List-Unsubscribe": `<${UNSUB_BASE}/unsubscribe?email=${encodeURIComponent(lead.email)}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }));

    try {
      await resend.batch.send(batch);

      // Mark this chunk contacted only after it was accepted by Resend, so a
      // failed batch leaves those leads 'new' to retry on the next run.
      const ids = chunk.map((l) => l.id);
      await supabase
        .from("leads")
        .update({
          status: "contacted",
          contacted_at: new Date().toISOString(),
          template_sent: template,
        })
        .in("id", ids);

      sent += batch.length;
    } catch (e: unknown) {
      failed += batch.length;
      errors.push(e instanceof Error ? e.message : "Unknown error");
    }

    // Gentle rate-limit spacing between batches.
    if (i + BATCH_SIZE < leads.length) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  return NextResponse.json({ sent, failed, total: leads.length, template, errors });
}
