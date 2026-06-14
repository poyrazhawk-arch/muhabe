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

const navItems = [
  { href: "/dashboard",            label: "Genel Bakış",   Icon: HouseSimple   },
  { href: "/dashboard/musteriler", label: "Müşteriler",    Icon: Users         },
  { href: "/dashboard/belgeler",   label: "Belgeler",      Icon: Files         },
  { href: "/dashboard/gorevler",   label: "Görevler",      Icon: ClipboardText },
  { href: "/dashboard/raporlar",   label: "Raporlar",      Icon: ChartBar      },
  { href: "/dashboard/takvim",     label: "Vergi Takvimi", Icon: CalendarCheck },
  { href: "/dashboard/finans",     label: "Finans",        Icon: Wallet        },
  { href: "/dashboard/kampanya",    label: "Kampanya",      Icon: PaperPlaneTilt },
  { href: "/dashboard/otomasyonlar", label: "Otomasyonlar",  Icon: Robot },
];

export default function Sidebar({ accountant }: { accountant: Accountant | null }) {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();

  async function handleCikis() {
    await supabase.auth.signOut();
    router.push("/auth/giris");
  }

  const initials = accountant?.full_name
    ? accountant.full_name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <aside
      className="w-[212px] shrink-0 flex flex-col h-full select-none"
      style={{
        background: "var(--sidebar)",
        borderRight: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      {/* Logo */}
      <div className="px-4 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <span className="text-[13px] font-semibold text-white tracking-tight">Muhasebe</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 space-y-px overflow-auto">
        {navItems.map(({ href, label, Icon }) => {
          const active = href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-100",
                active
                  ? ""
                  : "text-[#5d6f84] hover:text-[#aab8c4] hover:bg-white/[0.04]"
              )}
              style={active ? { background: "rgba(59,130,246,0.13)", color: "#bfdbfe" } : {}}
            >
              <Icon
                size={15}
                weight={active ? "fill" : "regular"}
                style={{ color: active ? "#60a5fa" : "currentColor", flexShrink: 0 }}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-2.5 pb-3 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-1"
          style={{ background: "rgba(255,255,255,0.03)" }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
            style={{ background: "#1b3358", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.2)" }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-white truncate leading-tight">
              {accountant?.full_name ?? "Kullanıcı"}
            </p>
            <p className="text-[10px] truncate mt-0.5" style={{ color: "#364d62" }}>
              {accountant?.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleCikis}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-all duration-100"
          style={{ color: "#3e5468" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = "#fca5a5";
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.07)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = "#3e5468";
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          <SignOut size={14} weight="regular" />
          Çıkış yap
        </button>
      </div>
    </aside>
  );
}
