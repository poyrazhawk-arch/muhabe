"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  ArrowRight,
  FolderOpen,
  CalendarDots,
  CheckSquare,
  Envelope,
  CaretDown,
} from "@phosphor-icons/react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Plan = {
  id: string;
  name: string;
  monthly: number;
  limits: string;
  highlight: boolean;
  badge?: string;
  features: string[];
};

type FAQ = { q: string; a: string };

// ─── Data ─────────────────────────────────────────────────────────────────────

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    monthly: 29,
    limits: "Up to 25 clients",
    highlight: false,
    features: [
      "Client management (CRM)",
      "Task and deadline tracking",
      "UK tax calendar (VAT, PAYE, CT)",
      "Document collection portal",
      "Client upload links",
      "Service fee tracking",
      "RAG status dashboard",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 59,
    limits: "Unlimited clients",
    highlight: true,
    badge: "Most popular",
    features: [
      "Everything in Starter",
      "Bulk client email broadcasts",
      "Automated payment reminders",
      "Monthly client summary emails",
      "Task templates and automation",
      "Client activity reports",
      "Engagement letter templates",
      "Priority support",
    ],
  },
  {
    id: "office",
    name: "Office",
    monthly: 99,
    limits: "Up to 5 team members",
    highlight: false,
    features: [
      "Everything in Pro",
      "Team roles and permissions",
      "Companies House API lookup",
      "WhatsApp and SMS notifications",
      "Custom reporting",
      "Advanced audit log",
      "Custom onboarding session",
      "Priority phone support",
    ],
  },
];

const FAQS: FAQ[] = [
  {
    q: "Do I need a credit card for the free trial?",
    a: "No. The 14-day trial starts the moment you sign up. No payment details are required until you decide to continue.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes. Upgrades take effect immediately. Downgrades apply at the start of your next billing cycle. No lock-in.",
  },
  {
    q: "Is my client data secure?",
    a: "All data is stored with row-level security on Supabase. Documents are encrypted at rest. We do not share data with third parties.",
  },
  {
    q: "Does Ledger work for non-UK accountants?",
    a: "The document, task, and client features are jurisdiction-agnostic. The default tax calendar targets UK deadlines. AU and CA calendars are on our roadmap.",
  },
  {
    q: "What happens when the trial ends?",
    a: "You get a reminder 3 days before the trial closes. If you do not subscribe, your account becomes read-only. No data is deleted for 30 days.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "We tracked everything in a shared spreadsheet. Ledger replaced it in a week and we have not looked back. The RAG dashboard alone is worth the price.",
    name: "Sarah Okoye",
    role: "Director, Okoye & Partners",
    city: "London",
    initial: "S",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
    featured: true,
  },
  {
    quote:
      "Automatic payment reminders saved us roughly four hours a month of awkward follow-up calls.",
    name: "James Whitfield",
    role: "Whitfield Accounting",
    city: "Manchester",
    initial: "J",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.08)",
    featured: false,
  },
  {
    quote:
      "My clients use the upload portal without instructions. That has never happened with any tool before.",
    name: "Priya Mehta",
    role: "Sole Practitioner",
    city: "Birmingham",
    initial: "P",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.08)",
    featured: false,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function annualPrice(monthly: number) {
  return Math.round(monthly * 0.8);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [annual, setAnnual]       = useState(false);
  const [openFaq, setOpenFaq]     = useState<number | null>(null);
  const [loading, setLoading]     = useState<string | null>(null);
  const router                    = useRouter();

  const displayPrice = (monthly: number) =>
    annual ? annualPrice(monthly) : monthly;

  async function startCheckout(planId: string) {
    setLoading(planId);
    try {
      const res  = await fetch("/api/polar/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned");
        setLoading(null);
      }
    } catch {
      console.error("Checkout failed");
      setLoading(null);
    }
  }

  return (
    <div
      style={{
        background: "#09111f",
        color: "#e8edf5",
        fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
        minHeight: "100dvh",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
    >
      {/* ─── Nav ──────────────────────────────────────────────────────────── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(9,17,31,0.9)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              L
            </span>
          </div>
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#f0f4f8",
              letterSpacing: "-0.025em",
            }}
          >
            Ledger
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Link
            href="/auth/giris"
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "#6b829e",
              textDecoration: "none",
              padding: "7px 14px",
              borderRadius: 8,
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.color = "#c8d8ec")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.color = "#6b829e")
            }
          >
            Sign in
          </Link>
          <Link
            href="/auth/kayit"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#fff",
              textDecoration: "none",
              padding: "7px 16px",
              borderRadius: 8,
              background: "#2563eb",
              transition: "background 0.15s, transform 0.1s",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#1d4ed8";
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#2563eb";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            Start free trial
            <ArrowRight size={12} weight="bold" />
          </Link>
        </div>
      </nav>

      {/* ─── Hero (LEFT-ALIGNED) ─────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "80px 32px 72px",
        }}
      >
        {/* Single eyebrow for the whole page */}
        <p
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: "#3b82f6",
            marginBottom: 22,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "#3b82f6",
              flexShrink: 0,
            }}
          />
          Accounting workflow
        </p>

        <h1
          style={{
            fontSize: "clamp(36px, 5.5vw, 58px)",
            fontWeight: 700,
            letterSpacing: "-0.045em",
            lineHeight: 1.07,
            color: "#f0f4f8",
            marginBottom: 20,
            maxWidth: 520,
          }}
        >
          Simple pricing for serious practices
        </h1>

        <p
          style={{
            fontSize: 16,
            color: "#6b829e",
            lineHeight: 1.6,
            marginBottom: 32,
            maxWidth: 380,
          }}
        >
          14-day free trial. No credit card. Cancel anytime.
        </p>

        {/* Billing toggle - left-aligned */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0,
            borderRadius: 10,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            padding: 4,
          }}
        >
          <button
            onClick={() => setAnnual(false)}
            style={{
              fontSize: 13,
              fontWeight: 500,
              padding: "6px 18px",
              borderRadius: 7,
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s",
              background: !annual ? "#fff" : "transparent",
              color: !annual ? "#09111f" : "#6b829e",
              boxShadow: !annual ? "0 1px 3px rgba(0,0,0,0.18)" : "none",
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            style={{
              fontSize: 13,
              fontWeight: 500,
              padding: "6px 18px",
              borderRadius: 7,
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              gap: 7,
              background: annual ? "#fff" : "transparent",
              color: annual ? "#09111f" : "#6b829e",
              boxShadow: annual ? "0 1px 3px rgba(0,0,0,0.18)" : "none",
            }}
          >
            Annual
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 6px",
                borderRadius: 20,
                background: "rgba(34,197,94,0.15)",
                color: "#4ade80",
                letterSpacing: "0.02em",
              }}
            >
              -20%
            </span>
          </button>
        </div>
      </section>

      {/* ─── Pricing (asymmetric - Pro dominant) ────────────────────────── */}
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 32px 96px",
          display: "grid",
          gridTemplateColumns: "1fr 1.44fr 1fr",
          gap: 12,
          alignItems: "start",
        }}
      >
        {PLANS.map((plan) => {
          const price = displayPrice(plan.monthly);
          const yearlySave =
            annual ? (plan.monthly - annualPrice(plan.monthly)) * 12 : 0;

          return (
            <div
              key={plan.id}
              style={{
                position: "relative",
                borderRadius: 14,
                padding: plan.highlight ? "32px 28px 36px" : "26px 24px 30px",
                marginTop: plan.highlight ? -12 : 0,
                background: plan.highlight
                  ? "rgba(37,99,235,0.06)"
                  : "rgba(255,255,255,0.025)",
                border: plan.highlight
                  ? "1.5px solid rgba(59,130,246,0.4)"
                  : "1px solid rgba(255,255,255,0.07)",
                boxShadow: plan.highlight
                  ? "0 0 48px rgba(37,99,235,0.14)"
                  : "none",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.transform =
                  "translateY(-2px)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.transform = "translateY(0)")
              }
            >
              {plan.badge && (
                <div
                  style={{
                    position: "absolute",
                    top: -10,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "3px 12px",
                    borderRadius: 20,
                    background: "#2563eb",
                    color: "#fff",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  {plan.badge}
                </div>
              )}

              {/* Plan name */}
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: plan.highlight ? "#93c5fd" : "#6b829e",
                  marginBottom: 14,
                  letterSpacing: "0.02em",
                }}
              >
                {plan.name}
              </p>

              {/* Price */}
              <div style={{ marginBottom: 6 }}>
                <span
                  style={{
                    fontSize: plan.highlight ? 46 : 40,
                    fontWeight: 700,
                    letterSpacing: "-0.05em",
                    color: "#f0f4f8",
                    lineHeight: 1,
                  }}
                >
                  £{price}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: "#4b6080",
                    marginLeft: 4,
                  }}
                >
                  /mo
                </span>
              </div>

              {/* Annual billing note */}
              <div style={{ minHeight: 36, marginBottom: 18 }}>
                {annual ? (
                  <p style={{ fontSize: 12, color: "#4b6080" }}>
                    Billed £{price * 12}/yr{" "}
                    <span style={{ color: "#4ade80" }}>
                      save £{yearlySave}
                    </span>
                  </p>
                ) : (
                  <p style={{ fontSize: 12, color: "#4b6080" }}>
                    or £{annualPrice(plan.monthly)}/mo billed annually
                  </p>
                )}
                <p
                  style={{
                    fontSize: 11,
                    color: "#3a5070",
                    marginTop: 4,
                    fontWeight: 500,
                  }}
                >
                  {plan.limits}
                </p>
              </div>

              {/* CTA */}
              <button
                onClick={() => startCheckout(plan.id)}
                disabled={loading === plan.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  width: "100%",
                  padding: "10px 0",
                  borderRadius: 9,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: loading === plan.id ? "wait" : "pointer",
                  transition: "all 0.15s",
                  background: plan.highlight
                    ? "#2563eb"
                    : "rgba(255,255,255,0.06)",
                  color: plan.highlight ? "#fff" : "#b8cce4",
                  border: plan.highlight
                    ? "none"
                    : "1px solid rgba(255,255,255,0.07)",
                  marginBottom: 24,
                  opacity: loading === plan.id ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (loading !== plan.id)
                    (e.currentTarget as HTMLElement).style.background =
                      plan.highlight ? "#1d4ed8" : "rgba(255,255,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    plan.highlight ? "#2563eb" : "rgba(255,255,255,0.06)";
                }}
              >
                {loading === plan.id ? "Redirecting…" : "Get started"}
                {loading !== plan.id && <ArrowRight size={12} weight="bold" />}
              </button>

              {/* Divider */}
              <div
                style={{
                  height: 1,
                  background: "rgba(255,255,255,0.05)",
                  marginBottom: 20,
                }}
              />

              {/* Features */}
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      fontSize: 13,
                      color: feature.startsWith("Everything")
                        ? "#60a5fa"
                        : "#93a8be",
                      fontWeight: feature.startsWith("Everything") ? 500 : 400,
                    }}
                  >
                    <Check
                      size={13}
                      weight="bold"
                      style={{
                        color: plan.highlight ? "#3b82f6" : "#2e4a66",
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      {/* ─── Features bento (asymmetric, real images) ────────────────────── */}
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 32px 96px",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(22px, 3vw, 30px)",
            fontWeight: 700,
            letterSpacing: "-0.035em",
            color: "#f0f4f8",
            marginBottom: 8,
          }}
        >
          Everything in one place
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "#6b829e",
            marginBottom: 28,
            maxWidth: 360,
          }}
        >
          No integrations needed. No third-party tools. One login.
        </p>

        {/* Bento: row 1 = 2fr + 1fr, row 2 = 1fr + 2fr */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gridTemplateRows: "auto auto",
            gap: 10,
          }}
        >
          {/* Cell 1 - Large, with real image bg (Document collection) */}
          <div
            style={{
              borderRadius: 13,
              overflow: "hidden",
              position: "relative",
              minHeight: 220,
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <img
              src="https://picsum.photos/seed/office-documents-desk/900/440"
              alt=""
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.25,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg, rgba(9,17,31,0.7) 0%, rgba(9,17,31,0.3) 100%)",
              }}
            />
            <div style={{ position: "relative", padding: "28px 28px 32px" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  background: "rgba(59,130,246,0.2)",
                  border: "1px solid rgba(59,130,246,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  color: "#60a5fa",
                }}
              >
                <FolderOpen size={17} weight="fill" />
              </div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#f0f4f8",
                  marginBottom: 8,
                  letterSpacing: "-0.02em",
                }}
              >
                Document collection
              </h3>
              <p style={{ fontSize: 13, color: "#93a8be", lineHeight: 1.65, maxWidth: 320 }}>
                Send clients a secure upload link. No login on their end. You get
                notified, review, approve.
              </p>
            </div>
          </div>

          {/* Cell 2 - Small (Tax Calendar) */}
          <div
            style={{
              borderRadius: 13,
              padding: "28px 24px",
              background: "rgba(34,197,94,0.04)",
              border: "1px solid rgba(34,197,94,0.1)",
              minHeight: 220,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  background: "rgba(34,197,94,0.12)",
                  border: "1px solid rgba(34,197,94,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  color: "#4ade80",
                }}
              >
                <CalendarDots size={17} weight="fill" />
              </div>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#f0f4f8",
                  marginBottom: 8,
                  letterSpacing: "-0.02em",
                }}
              >
                UK tax calendar
              </h3>
              <p style={{ fontSize: 13, color: "#93a8be", lineHeight: 1.6 }}>
                VAT, PAYE, Corporation Tax, Self Assessment. All deadlines
                pre-loaded.
              </p>
            </div>
            <p
              style={{
                fontSize: 11,
                color: "#22c55e",
                fontWeight: 600,
                marginTop: 20,
                letterSpacing: "0.04em",
              }}
            >
              Updated for {new Date().getFullYear()}
            </p>
          </div>

          {/* Cell 3 - Small (Task automation) */}
          <div
            style={{
              borderRadius: 13,
              padding: "28px 24px",
              background: "rgba(167,139,250,0.04)",
              border: "1px solid rgba(167,139,250,0.1)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  background: "rgba(167,139,250,0.12)",
                  border: "1px solid rgba(167,139,250,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  color: "#c4b5fd",
                }}
              >
                <CheckSquare size={17} weight="fill" />
              </div>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#f0f4f8",
                  marginBottom: 8,
                  letterSpacing: "-0.02em",
                }}
              >
                Task automation
              </h3>
              <p style={{ fontSize: 13, color: "#93a8be", lineHeight: 1.6 }}>
                Reusable templates. At the start of each month, tasks generate
                for every client automatically.
              </p>
            </div>
            <p
              style={{
                fontSize: 11,
                color: "#a78bfa",
                fontWeight: 600,
                marginTop: 20,
                letterSpacing: "0.04em",
              }}
            >
              Runs on the 1st of every month
            </p>
          </div>

          {/* Cell 4 - Large, with real image bg (Bulk broadcast) */}
          <div
            style={{
              borderRadius: 13,
              overflow: "hidden",
              position: "relative",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <img
              src="https://picsum.photos/seed/email-communication-office/900/380"
              alt=""
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.2,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg, rgba(9,17,31,0.75) 0%, rgba(9,17,31,0.4) 100%)",
              }}
            />
            <div style={{ position: "relative", padding: "28px 28px 32px" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  background: "rgba(245,158,11,0.15)",
                  border: "1px solid rgba(245,158,11,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  color: "#fbbf24",
                }}
              >
                <Envelope size={17} weight="fill" />
              </div>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#f0f4f8",
                  marginBottom: 8,
                  letterSpacing: "-0.02em",
                }}
              >
                Bulk client broadcast
              </h3>
              <p style={{ fontSize: 13, color: "#93a8be", lineHeight: 1.65 }}>
                Document reminder or filing deadline notice to all your clients
                in one click. No BCC, no mail-merge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials (asymmetric: featured + 2 compact) ─────────────── */}
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 32px 96px",
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: 10,
          alignItems: "start",
        }}
      >
        {/* Featured quote */}
        <div
          style={{
            borderRadius: 14,
            padding: "36px 36px 32px",
            background: "rgba(59,130,246,0.05)",
            border: "1px solid rgba(59,130,246,0.14)",
          }}
        >
          <p
            style={{
              fontSize: 18,
              color: "#c8d8ec",
              lineHeight: 1.65,
              fontStyle: "italic",
              marginBottom: 24,
              letterSpacing: "-0.01em",
            }}
          >
            &ldquo;{TESTIMONIALS[0].quote}&rdquo;
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "rgba(59,130,246,0.2)",
                border: "1px solid rgba(59,130,246,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 700,
                color: "#60a5fa",
                flexShrink: 0,
              }}
            >
              {TESTIMONIALS[0].initial}
            </div>
            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#e8edf5",
                  margin: 0,
                }}
              >
                {TESTIMONIALS[0].name}
              </p>
              <p style={{ fontSize: 11, color: "#4b6080", margin: 0 }}>
                {TESTIMONIALS[0].role}
              </p>
            </div>
          </div>
        </div>

        {/* Two compact quotes stacked */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TESTIMONIALS.slice(1).map((t, i) => (
            <div
              key={i}
              style={{
                borderRadius: 12,
                padding: "22px 24px",
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  color: "#93a8be",
                  lineHeight: 1.65,
                  fontStyle: "italic",
                  marginBottom: 16,
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: t.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: t.color,
                    flexShrink: 0,
                  }}
                >
                  {t.initial}
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#c8d8ec",
                      margin: 0,
                    }}
                  >
                    {t.name}
                  </p>
                  <p style={{ fontSize: 11, color: "#3a5070", margin: 0 }}>
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: "0 32px 96px",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(20px, 3vw, 28px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "#f0f4f8",
            marginBottom: 28,
          }}
        >
          Common questions
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {FAQS.map((faq, i) => (
            <div
              key={i}
              style={{
                borderRadius: 10,
                border: "1px solid",
                borderColor:
                  openFaq === i
                    ? "rgba(59,130,246,0.22)"
                    : "rgba(255,255,255,0.06)",
                overflow: "hidden",
                transition: "border-color 0.15s",
                background:
                  openFaq === i
                    ? "rgba(37,99,235,0.04)"
                    : "rgba(255,255,255,0.02)",
              }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#c8d8ec",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {faq.q}
                </span>
                <CaretDown
                  size={15}
                  weight="bold"
                  style={{
                    color: "#3a5070",
                    flexShrink: 0,
                    transform:
                      openFaq === i ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s cubic-bezier(0.16,1,0.3,1)",
                  }}
                />
              </button>
              {openFaq === i && (
                <div
                  style={{
                    padding: "0 20px 18px",
                    fontSize: 13,
                    color: "#6b829e",
                    lineHeight: 1.7,
                  }}
                >
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 32px 80px",
        }}
      >
        <div
          style={{
            borderRadius: 16,
            padding: "60px 48px",
            background:
              "linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(9,17,31,0.5) 100%)",
            border: "1px solid rgba(59,130,246,0.16)",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "center",
            gap: 32,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "clamp(24px, 4vw, 36px)",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                color: "#f0f4f8",
                marginBottom: 10,
                lineHeight: 1.15,
              }}
            >
              Ready to get organised?
            </h2>
            <p style={{ fontSize: 14, color: "#6b829e", margin: 0 }}>
              14 days free. No card needed. Practices up and running in under an
              hour.
            </p>
          </div>
          <button
            onClick={() => startCheckout("pro")}
            disabled={loading === "pro"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "13px 28px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              background: "#2563eb",
              border: "none",
              cursor: loading === "pro" ? "wait" : "pointer",
              whiteSpace: "nowrap",
              transition: "background 0.15s, transform 0.1s",
              boxShadow: "0 4px 20px rgba(37,99,235,0.35)",
              flexShrink: 0,
              opacity: loading === "pro" ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (loading !== "pro") {
                (e.currentTarget as HTMLElement).style.background = "#1d4ed8";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#2563eb";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            {loading === "pro" ? "Redirecting…" : "Start free trial"}
            {loading !== "pro" && <ArrowRight size={15} weight="bold" />}
          </button>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "24px 32px",
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}
            >
              L
            </span>
          </div>
          <span style={{ fontSize: 13, color: "#2e4a66", fontWeight: 500 }}>
            Ledger
          </span>
        </div>

        <p style={{ fontSize: 12, color: "#2e4a66", margin: 0 }}>
          Built for UK accounting practices.
        </p>

        <div style={{ display: "flex", gap: 20 }}>
          {["Privacy", "Terms", "Contact"].map((label) => (
            <Link
              key={label}
              href="#"
              style={{
                fontSize: 12,
                color: "#2e4a66",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = "#6b829e")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = "#2e4a66")
              }
            >
              {label}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
