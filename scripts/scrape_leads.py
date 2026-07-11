#!/usr/bin/env python3
"""
Daily accountant ("muhasebeci") lead scraper — the scrapling side of the routine.

It scrapes a directory/listing of accountant businesses with Scrapling, extracts
up to TARGET_LEADS leads, and POSTs them to the Ledger app's ingest endpoint
(/api/leads/ingest). From there the daily Vercel cron (/api/cron/gunluk-lead)
emails them via Resend.

Everything is configured through environment variables so you can point it at
your own source and CSS selectors without editing code — plug in the workflow
you already built with the scrapling skill.

Required env:
  APP_URL            e.g. https://muhasebe-poyraz.vercel.app
  CRON_SECRET        same secret the app uses (Bearer auth for the ingest route)
  LEADS_SOURCE_URL   listing page to scrape (supports {page} placeholder for paging)

Optional env (CSS selectors — defaults are placeholders, override for your source):
  SEL_ITEM     row/card selector           (default: ".listing")
  SEL_NAME     business name    ::text     (default: ".name::text")
  SEL_EMAIL    email address    ::text     (default: "a[href^='mailto:']::attr(href)")
  SEL_PHONE    phone            ::text     (default: ".phone::text")
  SEL_CITY     city             ::text     (default: ".city::text")
  SEL_RATING   rating           ::text     (default: ".rating::text")
  TARGET_LEADS number of leads to collect  (default: 100)
  MAX_PAGES    pages to walk if paged      (default: 10)
  USE_STEALTH  "1" to use a real browser (JS-heavy sites; needs `scrapling install`)

Usage:
  pip install -r scripts/requirements.txt
  python scripts/scrape_leads.py
"""

from __future__ import annotations

import os
import re
import sys
import json
import time
import urllib.request


def env(name: str, default: str | None = None, required: bool = False) -> str:
    val = os.environ.get(name, default)
    if required and not val:
        sys.exit(f"Missing required env var: {name}")
    return val or ""


APP_URL = env("APP_URL", required=True).rstrip("/")
CRON_SECRET = env("CRON_SECRET", required=True)
SOURCE_URL = env("LEADS_SOURCE_URL", required=True)

SEL_ITEM = env("SEL_ITEM", ".listing")
SEL_NAME = env("SEL_NAME", ".name::text")
SEL_EMAIL = env("SEL_EMAIL", "a[href^='mailto:']::attr(href)")
SEL_PHONE = env("SEL_PHONE", ".phone::text")
SEL_CITY = env("SEL_CITY", ".city::text")
SEL_RATING = env("SEL_RATING", ".rating::text")

TARGET_LEADS = int(env("TARGET_LEADS", "100"))
MAX_PAGES = int(env("MAX_PAGES", "10"))
USE_STEALTH = env("USE_STEALTH", "0") == "1"

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")


def get_fetcher():
    """Return a Scrapling fetch callable. Fetcher = plain HTTP (fast, no browser);
    StealthyFetcher = real browser for JS-rendered sites (needs `scrapling install`)."""
    if USE_STEALTH:
        from scrapling.fetchers import StealthyFetcher

        return lambda url: StealthyFetcher.fetch(url, headless=True, network_idle=True)
    from scrapling.fetchers import Fetcher

    return lambda url: Fetcher.get(url, stealthy_headers=True)


def text_of(node, selector: str) -> str | None:
    """css_first that tolerates ::text / ::attr(...) pseudo-selectors and missing nodes."""
    try:
        val = node.css_first(selector)
    except Exception:
        return None
    if val is None:
        return None
    val = str(val).strip()
    return val or None


def scrape_page(fetch, url: str) -> list[dict]:
    print(f"  → fetching {url}", flush=True)
    page = fetch(url)
    leads: list[dict] = []
    for item in page.css(SEL_ITEM):
        email_raw = text_of(item, SEL_EMAIL) or ""
        # Handle mailto: hrefs and stray text alike.
        m = EMAIL_RE.search(email_raw.replace("mailto:", ""))
        if not m:
            continue
        leads.append(
            {
                "business_name": text_of(item, SEL_NAME) or "Accountant",
                "email": m.group(0).lower(),
                "phone": text_of(item, SEL_PHONE),
                "city": text_of(item, SEL_CITY),
                "rating": text_of(item, SEL_RATING),
            }
        )
    print(f"    found {len(leads)} leads on this page", flush=True)
    return leads


def collect_leads() -> list[dict]:
    fetch = get_fetcher()
    seen: set[str] = set()
    leads: list[dict] = []
    paged = "{page}" in SOURCE_URL

    for page_no in range(1, MAX_PAGES + 1):
        url = SOURCE_URL.format(page=page_no) if paged else SOURCE_URL
        try:
            for lead in scrape_page(fetch, url):
                if lead["email"] in seen:
                    continue
                seen.add(lead["email"])
                leads.append(lead)
                if len(leads) >= TARGET_LEADS:
                    return leads
        except Exception as e:  # keep going; one bad page shouldn't kill the run
            print(f"    ! page {page_no} failed: {e}", flush=True)

        if not paged:
            break
        time.sleep(1)  # be polite between pages

    return leads


def ingest(leads: list[dict]) -> None:
    payload = json.dumps({"leads": leads, "source": "scrapling"}).encode()
    req = urllib.request.Request(
        f"{APP_URL}/api/leads/ingest",
        data=payload,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {CRON_SECRET}",
        },
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        body = resp.read().decode()
    print(f"Ingest response: {body}", flush=True)


def main() -> None:
    print(f"Scraping up to {TARGET_LEADS} accountant leads…", flush=True)
    leads = collect_leads()
    print(f"Collected {len(leads)} unique leads.", flush=True)
    if not leads:
        print("Nothing to ingest — check LEADS_SOURCE_URL and your selectors.", flush=True)
        return
    ingest(leads)
    print("Done.", flush=True)


if __name__ == "__main__":
    main()
