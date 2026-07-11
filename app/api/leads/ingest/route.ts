import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import type { Lead } from "@/lib/utils/coldEmail";

// POST /api/leads/ingest
// Ingest point for the scrapling lead-generation workflow. The scraper
// scrapes accountant businesses and posts them here in batches; we upsert
// into public.leads, deduplicating on email so repeated daily scrapes never
// create duplicate rows or re-queue an already-contacted lead.
//
// Auth: Bearer ${CRON_SECRET} (same secret the cron jobs use).
// Body: { "leads": [{ business_name, email, phone?, city?, rating? }, ...] }

interface IngestBody {
  leads?: Lead[];
  source?: string;
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: IngestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const incoming = body.leads;
  if (!Array.isArray(incoming) || incoming.length === 0) {
    return NextResponse.json({ error: "leads array is required" }, { status: 400 });
  }

  // Normalise, keep only rows with a plausible email, and de-dupe within the
  // payload itself (last one wins) before it ever reaches the database.
  const byEmail = new Map<string, Record<string, unknown>>();
  for (const l of incoming) {
    const email = String(l?.email ?? "").trim().toLowerCase();
    if (!email.includes("@") || !email.includes(".")) continue;
    byEmail.set(email, {
      business_name: String(l.business_name ?? "").trim() || "Accountant",
      email,
      phone: l.phone?.trim() || null,
      city: l.city?.trim() || null,
      rating: l.rating != null ? String(l.rating) : null,
      source: body.source ?? "scrapling",
      status: "new",
    });
  }

  const rows = [...byEmail.values()];
  const received = incoming.length;
  const invalid = received - rows.length;

  if (rows.length === 0) {
    return NextResponse.json({ received, inserted: 0, invalid });
  }

  const supabase = await createServiceClient();

  // ignoreDuplicates: existing emails (already scraped or already contacted)
  // are left untouched; only genuinely new leads are inserted.
  const { data, error } = await supabase
    .from("leads")
    .upsert(rows, { onConflict: "email", ignoreDuplicates: true })
    .select("id");

  if (error) {
    console.error("Lead ingest failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const inserted = data?.length ?? 0;
  return NextResponse.json({
    received,
    inserted,
    duplicates: rows.length - inserted,
    invalid,
  });
}
