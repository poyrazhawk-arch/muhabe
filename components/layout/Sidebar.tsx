"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HouseSimple,
  Users,
  Files,
  ClipboardText,
  ChartBar,
  CalendarCheck,
  Wallet,
  PaperPlaneTilt,
  Robot,
  SignOut,
} from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import type { Accountant } from "@/types";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "/dashboard",              label: "Overview",     Icon: HouseSimple    },
  { href: "/dashboard/musteriler",   label: "Clients",      Icon: Users          },
  { href: "/dashboard/belgeler",     label: "Documents",    Icon: Files          },
  { href: "/dashboard/gorevler",     label: "Tasks",        Icon: ClipboardText  },
  { href: "/dashboard/takvim",       label: "Tax Calendar", Icon: CalendarCheck  },
  { href: "/dashboard/finans",       label: "Finance",      Icon: Wallet         },
  { href: "/dashboard/raporlar",     label: "Reports",      Icon: ChartBar       },
  { href: "/dashboard/kampanya",     label: "Campaign",     Icon: PaperPlaneTilt },
  { href: "/dashboard/otomasyonlar", label: "Automations",  Icon: Robot          },
];

const DIVIDER_AFTER = 3; // divider after Tasks (index 3)

export default function Sidebar({ accountant }: { accountant: Accountant | null }) {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth/giris");
  }

  const initials = accountant?.full_name
    ? accountant.full_name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <aside
      className="w-[60px] shrink-0 flex flex-col h-full select-none"
      style={{
        background: "linear-gradient(180deg, #0b1526 0%, #08111f 100%)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* ── Logo mark ───────────────────────────────────── */}
      <div
        className="flex items-center justify-center py-4 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "#2563eb" }}
        >
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
        </div>
      </div>

      {/* ── Nav ─────────────────────────────────────────── */}
      <nav className="flex-1 flex flex-col gap-px py-3 px-2 overflow-hidden">
        {NAV_ITEMS.map(({ href, label, Icon }, idx) => {
          const isActive = href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);

          return (
            <div key={href}>
              {idx === DIVIDER_AFTER && (
                <div className="my-2 mx-1" style={{ height: "1px", background: "rgba(255,255,255,0.05)" }} />
              )}
              <div className="relative group">
                <Link
                  href={href}
                  className={cn(
                    "flex items-center justify-center w-full py-[9px] rounded-lg transition-all duration-150"
                  )}
                  style={
                    isActive
                      ? { background: "rgba(59,130,246,0.13)", color: "#93c5fd" }
                      : { color: "#4a6a87" }
                  }
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                      (e.currentTarget as HTMLElement).style.color = "#7aabc8";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "#4a6a87";
                    }
                  }}
                >
                  <Icon
                    size={18}
                    weight={isActive ? "fill" : "regular"}
                    style={{ flexShrink: 0 }}
                  />
                </Link>

                {/* Tooltip */}
                <div
                  className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2.5 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                  style={{
                    background: "#0e1523",
                    color: "#c8d8e8",
                    fontSize: "12px",
                    fontWeight: 500,
                    padding: "5px 10px",
                    borderRadius: "7px",
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {label}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* ── User ────────────────────────────────────────── */}
      <div
        className="flex flex-col items-center gap-1.5 px-2 py-3 shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        {/* Avatar */}
        <div className="relative group">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold cursor-default"
            style={{
              background: "linear-gradient(135deg, #1a3254, #142844)",
              color: "#7db3e8",
              border: "1.5px solid rgba(59,130,246,0.22)",
            }}
          >
            {initials}
          </div>
          {/* Name tooltip */}
          <div
            className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2.5 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-100"
            style={{
              background: "#0e1523",
              color: "#c8d8e8",
              fontSize: "12px",
              fontWeight: 500,
              padding: "5px 10px",
              borderRadius: "7px",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {accountant?.full_name ?? "User"}
          </div>
        </div>

        {/* Sign out */}
        <div className="relative group">
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150"
            style={{ color: "#2d4861" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = "#fca5a5";
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = "#2d4861";
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            <SignOut size={15} />
          </button>
          <div
            className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2.5 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-100"
            style={{
              background: "#0e1523",
              color: "#c8d8e8",
              fontSize: "12px",
              fontWeight: 500,
              padding: "5px 10px",
              borderRadius: "7px",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            Sign out
          </div>
        </div>
      </div>
    </aside>
  );
}
