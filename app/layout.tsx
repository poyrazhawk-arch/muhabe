import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { getLocale, isTurkey } from "@/lib/i18n/server";
import { LocaleProvider } from "@/lib/i18n/LocaleContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ledger — Accounting Practice Management",
  description: "Document collection, task tracking, and client management for professional accountants",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const turkey = await isTurkey();
  return (
    <html lang={locale} className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <LocaleProvider locale={locale} isTurkey={turkey}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
