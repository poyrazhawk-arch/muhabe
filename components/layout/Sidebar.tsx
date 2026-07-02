"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  HouseSimple,
  Users,
  Files,
  ClipboardText,
  ChartBar,
  CalendarCheck,
  Wallet,
  SignOut,
  Notebook,
} from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { useDict } from "@/lib/i18n/LocaleContext";
import type { Accountant } from "@/types";
import { cn } from "@/lib/utils/cn";

const DIVIDER_AFTER = 3;

export default function Sidebar({ accountant }: { accountant: Accountant | null }) {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();
  const t = useDict().sidebar;

  const NAV_ITEMS = [
    { href: "/dashboard",            label: t.overview,    Icon: HouseSimple   },
    { href: "/dashboard/musteriler", label: t.clients,     Icon: Users         },
    { href: "/dashboard/belgeler",   label: t.documents,   Icon: Files         },
    { href: "/dashboard/gorevler",   label: t.tasks,       Icon: ClipboardText },
    { href: "/dashboard/takvim",     label: t.taxCalendar, Icon: CalendarCheck },
    { href: "/dashboard/finans",     label: t.finance,     Icon: Wallet        },
    { href: "/dashboard/raporlar",   label: t.reports,     Icon: ChartBar      },
  ];

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth/giris");
  }

  const initials = accountant?.full_name
    ? accountant.full_name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <motion.aside
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-[60px] shrink-0 flex flex-col h-full select-none"
      style={{
        background: "linear-gradient(180deg, #0a1628 0%, #07101d 100%)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* ── Logo ─── */}
      <div
        className="flex items-center justify-center py-4 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <motion.div
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            boxShadow: "0 2px 10px rgba(37,99,235,0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        >
          <Notebook size={14} weight="fill" style={{ color: "#fff" }} />
        </motion.div>
      </div>

      {/* ── Nav ─── */}
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
                  className="flex items-center justify-center w-full py-[9px] rounded-lg transition-colors duration-150 relative"
                  style={
                    isActive
                      ? { background: "rgba(59,130,246,0.14)", color: "#93c5fd" }
                      : { color: "#3d5271" }
                  }
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = "#7aabc8";
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = "#3d5271";
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }
                  }}
                >
                  {/* Active indicator — left edge pill */}
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full"
                      style={{ background: "#3b82f6", boxShadow: "0 0 8px rgba(59,130,246,0.7)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <Icon size={18} weight={isActive ? "fill" : "regular"} style={{ flexShrink: 0 }} />
                </Link>

                {/* Tooltip */}
                <div
                  className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 opacity-0 group-hover:opacity-100 transition-all duration-150 scale-95 group-hover:scale-100"
                  style={{
                    background: "#0e1a2e",
                    color: "#b8ccde",
                    fontSize: "12px",
                    fontWeight: 500,
                    padding: "5px 10px",
                    borderRadius: "7px",
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.45)",
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

      {/* ── User ─── */}
      <div
        className="flex flex-col items-center gap-1.5 px-2 py-3 shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="relative group">
          <motion.div
            whileHover={{ scale: 1.06 }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold cursor-default"
            style={{
              background: "linear-gradient(135deg, #1a3254, #142844)",
              color: "#7db3e8",
              border: "1.5px solid rgba(59,130,246,0.25)",
            }}
          >
            {initials}
          </motion.div>
          <div
            className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 opacity-0 group-hover:opacity-100 transition-all duration-150 scale-95 group-hover:scale-100"
            style={{
              background: "#0e1a2e", color: "#b8ccde", fontSize: "12px",
              fontWeight: 500, padding: "5px 10px", borderRadius: "7px",
              whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(0,0,0,0.45)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {accountant?.full_name ?? t.user}
          </div>
        </div>

        <div className="relative group">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleSignOut}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-150"
            style={{ color: "#2d4861" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = "#fca5a5";
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = "#2d4861";
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            <SignOut size={15} />
          </motion.button>
          <div
            className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 opacity-0 group-hover:opacity-100 transition-all duration-150"
            style={{
              background: "#0e1a2e", color: "#b8ccde", fontSize: "12px",
              fontWeight: 500, padding: "5px 10px", borderRadius: "7px",
              whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(0,0,0,0.45)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {t.signOut}
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
