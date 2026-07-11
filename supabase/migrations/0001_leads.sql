-- Leads table — powers the daily lead-generation routine.
--
-- The scrapling workflow scrapes accountant ("muhasebeci") businesses and
-- pushes them into this table via POST /api/leads/ingest. The daily cron
-- (/api/cron/gunluk-lead) then pulls up to 100 leads with status = 'new',
-- sends a cold outreach email through Resend, and marks them 'contacted'
-- so nobody is ever emailed twice.

create extension if not exists "pgcrypto";

create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  business_name text not null,
  email         text not null,
  phone         text,
  city          text,
  rating        text,
  source        text default 'scrapling',
  status        text not null default 'new'
                  check (status in ('new', 'contacted', 'bounced', 'unsubscribed')),
  template_sent text,
  created_at    timestamptz not null default now(),
  contacted_at  timestamptz
);

-- One row per email address; the ingest endpoint stores emails lowercased so
-- this plain-column unique index is enough to dedupe across daily scrapes.
create unique index if not exists leads_email_key on public.leads (email);

-- The daily routine filters on status; keep that lookup fast.
create index if not exists leads_status_idx on public.leads (status);

-- Leads are internal marketing data — reachable only through the service-role
-- key used by the ingest and cron routes. Enable RLS with no public policies
-- so the anon/authenticated keys can never read or write them.
alter table public.leads enable row level security;
