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

const NAV_GROUPS = [
  {
    items: [
      { href: "/dashboard",              label: "Overview",      Icon: HouseSimple    },
      { href: "/dashboard/musteriler",   label: "Clients",       Icon: Users          },
      { href: "/dashboard/belgeler",     label: "Documents",     Icon: Files          },
      { href: "/dashboard/gorevler",     label: "Tasks",         Icon: ClipboardText  },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/dashboard/takvim",       label: "Tax Calendar",  Icon: CalendarCheck  },
      { href: "/dashboard/finans",       label: "Finance",       Icon: Wallet         },
      { href: "/dashboard/raporlar",     label: "Reports",       Icon: ChartBar       },
    ],
  },
  {
    label: "Grow",
    items: [
      { href: "/dashboard/kampanya",     label: "Campaign",      Icon: PaperPlaneTilt },
      { href: "/dashboard/otomasyonlar", label: "Automations",   Icon: Robot          },
    ],
  },
];

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
      className="w-[216px] shrink-0 flex flex-col h-full select-none"
      style={{
        background: "linear-gradient(180deg, #0b1526 0%, #08111f 100%)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* ── Logo ─── */}
      <div className="px-4 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              boxShadow: "0 2px 8px rgba(37,99,235,0.4)",
            }}
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-bold text-white tracking-tight">Ledger</span>
            <span
              className="text-[9px] font-semibold px-1.5 py-0.5 rounded tracking-wider"
              style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}
            >
              BETA
            </span>
          </div>
        </div>
      </div>

      {/* ── Nav ─── */}
      <nav className="flex-1 px-2 py-3 overflow-auto space-y-4">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <p
                className="px-3 mb-1.5 text-[9.5px] font-semibold tracking-[0.1em] uppercase"
                style={{ color: "rgba(255,255,255,0.18)" }}
              >
                {group.label}
              </p>
            )}
            <div className="space-y-px">
              {group.items.map(({ href, label, Icon }) => {
                const isActive = href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "relative flex items-center gap-2.5 py-[6px] rounded-lg text-[13px] font-medium transition-all duration-100",
                      isActive ? "pl-[10px] pr-3" : "px-3"
                    )}
                    style={
                      isActive
                        ? {
                            background: "rgba(59,130,246,0.09)",
                            color: "#93c5fd",
                            borderLeft: "2px solid #3b82f6",
                          }
                        : { color: "#46637f" }
                    }
                    onMouseEnter={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                        (e.currentTarget as HTMLElement).style.color = "#7a9cbf";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "#46637f";
                      }
                    }}
                  >
                    <Icon
                      size={15}
                      weight={isActive ? "fill" : "regular"}
                      style={{ color: isActive ? "#60a5fa" : "currentColor", flexShrink: 0 }}
                    />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── User ─── */}
      <div className="px-2 pb-3 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-1"
          style={{ background: "rgba(255,255,255,0.03)" }}
        >
          <div
            className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
            style={{
              background: "linear-gradient(135deg, #1a3254, #142844)",
              color: "#7db3e8",
              border: "1.5px solid rgba(59,130,246,0.22)",
            }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-white truncate leading-tight">
              {accountant?.full_name ?? "User"}
            </p>
            <p className="text-[10px] truncate mt-0.5" style={{ color: "#2d4861" }}>
              {accountant?.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-[7px] rounded-lg text-[12px] font-medium transition-all duration-100"
          style={{ color: "#2d4861" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = "#fca5a5";
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.07)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = "#2d4861";
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          <SignOut size={13} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
