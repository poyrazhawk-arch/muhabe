# Daily lead-generation routine

Finds new accountant ("muhasebeci") customers on autopilot:

```
scrapling scraper  →  POST /api/leads/ingest  →  leads table
                                                      │
                              daily 10:00 UTC ────────┘
                                     ▼
                    GET /api/cron/gunluk-lead  →  Resend cold email → 100 accountants
```

Two scheduled steps make up the routine:

1. **Scrape (07:00 UTC)** — `scripts/scrape_leads.py`, run daily by the
   `Daily lead scrape` GitHub Action. Scrapes up to 100 accountant leads and
   posts them to `/api/leads/ingest`, which upserts them into the `leads`
   table (deduped on email).
2. **Send (10:00 UTC)** — the Vercel cron `/api/cron/gunluk-lead` pulls up to
   100 leads with `status = 'new'`, emails each one via Resend, and marks them
   `contacted` so nobody is ever emailed twice.

The 3-hour gap guarantees fresh leads are in the table before the send runs.

## One-time setup

### 1. Create the table

Apply `supabase/migrations/0001_leads.sql` in the Supabase SQL editor
(or `supabase db push` if you use the CLI).

### 2. GitHub configuration (for the scrape step)

Repo **Settings → Secrets and variables → Actions**:

**Secret**
- `CRON_SECRET` — same value as the app's `CRON_SECRET` env var.

**Variables**
- `APP_URL` — e.g. `https://muhasebe-poyraz.vercel.app`
- `LEADS_SOURCE_URL` — the listing you scrape. Use `{page}` for pagination,
  e.g. `https://example.com/muhasebeci?page={page}`
- `SEL_ITEM`, `SEL_NAME`, `SEL_EMAIL`, `SEL_PHONE`, `SEL_CITY`, `SEL_RATING` —
  CSS selectors for your source (see defaults in `scrape_leads.py`). Selectors
  support Scrapling's `::text` and `::attr(...)` pseudo-selectors.
- `TARGET_LEADS` (default `100`), `MAX_PAGES` (default `10`)
- `USE_STEALTH` — set to `1` for JS-heavy sites (uses a real browser).

Already have a scrapling workflow? Point it at `POST /api/leads/ingest`
instead — the only contract is the JSON body below.

### 3. Vercel (for the send step)

`vercel.json` already schedules `/api/cron/gunluk-lead` daily at 10:00 UTC.
Requires `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CRON_SECRET`, and the Supabase
env vars (already used by the other crons).

## Ingest contract

`POST /api/leads/ingest` — `Authorization: Bearer <CRON_SECRET>`

```json
{
  "leads": [
    { "business_name": "Acme Muhasebe", "email": "info@acme.com",
      "phone": "+90...", "city": "İstanbul", "rating": "4.6" }
  ],
  "source": "scrapling"
}
```

Only `business_name` and a valid `email` are required. Response:
`{ received, inserted, duplicates, invalid }`.

## Run locally

```bash
pip install -r scripts/requirements.txt
export APP_URL=https://muhasebe-poyraz.vercel.app
export CRON_SECRET=...            # matches the app
export LEADS_SOURCE_URL='https://example.com/muhasebeci?page={page}'
python scripts/scrape_leads.py
```

Trigger the send step manually from the **Automations** page ("Run now")
or with:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://muhasebe-poyraz.vercel.app/api/cron/gunluk-lead
```
