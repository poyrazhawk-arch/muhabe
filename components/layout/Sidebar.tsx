"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HouseSimple,
  Users,
  Files,
  ClipboardText,
  ChartBar,
  CalendarDots,
  Wallet,
  SignOut,
} from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import type { Accountant } from "@/types";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/dashboard",            label: "Genel Bakış",  Icon: HouseSimple  },
  { href: "/dashboard/musteriler", label: "Müşteriler",   Icon: Users        },
  { href: "/dashboard/belgeler",   label: "Belgeler",     Icon: Files        },
  { href: "/dashboard/gorevler",   label: "Görevler",     Icon: ClipboardText },
  { href: "/dashboard/raporlar",   label: "Raporlar",     Icon: ChartBar      },
  { href: "/dashboard/takvim",    label: "Vergi Takvimi",Icon: CalendarDots  },
  { href: "/dashboard/finans",    label: "Finans",        Icon: Wallet        },
];

export default function Sidebar({ accountant }: { accountant: Accountant | null }) {
  const pathname = usePathname();
  const router = useRouter();
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
      className="w-[220px] shrink-0 flex flex-col h-full select-none"
      style={{
        background: "var(--sidebar)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}
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
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, Icon }) => {
          const active = href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors duration-150",
                active
                  ? "text-white"
                  : "text-[#6b7a8d] hover:text-[#c0cad6] hover:bg-white/5"
              )}
              style={active ? { background: "rgba(59,130,246,0.15)", color: "#93c5fd" } : {}}
            >
              <Icon
                size={16}
                weight={active ? "fill" : "regular"}
                style={{ color: active ? "#60a5fa" : "currentColor" }}
              />
              {label}
              {active && (
                <div
                  className="ml-auto w-1 h-4 rounded-full"
                  style={{ background: "#3b82f6" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-1"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
            style={{ background: "#1e40af", color: "#93c5fd" }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-white truncate leading-tight">
              {accountant?.full_name ?? "Kullanıcı"}
            </p>
            <p className="text-[11px] truncate mt-0.5" style={{ color: "#4b5563" }}>
              {accountant?.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleCikis}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors duration-150 text-[#6b7a8d] hover:text-[#f87171] hover:bg-red-500/10"
        >
          <SignOut size={15} />
          Çıkış yap
        </button>
      </div>
    </aside>
  );
}
