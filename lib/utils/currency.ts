import type { Locale } from "@/lib/i18n/dictionaries";

/**
 * Para birimini görüntüleyenin diline göre biçimlendirir.
 * - tr  → ₺ (TRY)
 * - en  → € (EUR)  (yabancı müşteri/muhasebeci)
 *
 * NOT: GİB vergi borcu gibi doğası gereği TL olan tutarlar için bu
 * kullanılmaz; onlar her zaman ₺ gösterilir.
 */
export function formatMoney(
  n: number,
  locale: Locale,
  opts?: { maximumFractionDigits?: number },
): string {
  const extra = opts?.maximumFractionDigits != null
    ? { maximumFractionDigits: opts.maximumFractionDigits }
    : {};
  return locale === "tr"
    ? Number(n).toLocaleString("tr-TR", { style: "currency", currency: "TRY", ...extra })
    : Number(n).toLocaleString("en-IE", { style: "currency", currency: "EUR", ...extra });
}

/** Locale'e göre para birimi sembolü */
export function moneySymbol(locale: Locale): string {
  return locale === "tr" ? "₺" : "€";
}
