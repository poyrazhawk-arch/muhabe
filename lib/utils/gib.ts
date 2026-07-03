/**
 * GİB (Gelir İdaresi Başkanlığı) yardımcıları
 * -------------------------------------------
 * - VKN (Vergi Kimlik Numarası, 10 hane) ve TCKN (11 hane) checksum doğrulaması.
 * - GİB servislerine hızlı erişim için derin-link üreticileri.
 *
 * NOT: GİB borç / mükellefiyet sorgulaması için kamuya açık bir API yoktur;
 * İnteraktif Vergi Dairesi sorguları muhasebecinin kendi girişini gerektirir.
 * Bu yüzden canlı sorgu yerine doğrulama + yönlendirme + manuel takip sağlanır.
 */

export type TaxIdKind = "vkn" | "tckn" | "invalid";

const onlyDigits = (s: string) => (s ?? "").replace(/\D/g, "");

/** Vergi Kimlik Numarası (10 hane) checksum doğrulaması */
export function isValidVKN(value: string): boolean {
  const v = onlyDigits(value);
  if (v.length !== 10) return false;

  const d = v.split("").map(Number);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const tmp = (d[i] + 9 - i) % 10;
    if (tmp === 0) {
      // katkı 0
    } else {
      let p = (tmp * Math.pow(2, 9 - i)) % 9;
      if (p === 0) p = 9;
      sum += p;
    }
  }
  const check = (10 - (sum % 10)) % 10;
  return check === d[9];
}

/** T.C. Kimlik Numarası (11 hane) checksum doğrulaması */
export function isValidTCKN(value: string): boolean {
  const v = onlyDigits(value);
  if (v.length !== 11) return false;

  const d = v.split("").map(Number);
  if (d[0] === 0) return false;

  const odd  = d[0] + d[2] + d[4] + d[6] + d[8];
  const even = d[1] + d[3] + d[5] + d[7];
  const digit10 = ((odd * 7) - even) % 10;
  if (((digit10 % 10) + 10) % 10 !== d[9]) return false;

  const sumFirst10 = d.slice(0, 10).reduce((a, b) => a + b, 0);
  const digit11 = sumFirst10 % 10;
  return digit11 === d[10];
}

/** Uzunluğa göre VKN mı TCKN mi olduğunu tespit edip doğrular */
export function classifyTaxId(value: string): TaxIdKind {
  const v = onlyDigits(value);
  if (v.length === 10 && isValidVKN(v)) return "vkn";
  if (v.length === 11 && isValidTCKN(v)) return "tckn";
  return "invalid";
}

/** Vergi numarası (VKN veya TCKN) geçerli mi? */
export function isValidTaxId(value: string): boolean {
  return classifyTaxId(value) !== "invalid";
}

/** GİB servis derin-linkleri (muhasebeci kendi oturumunda sorgular) */
export const GIB_LINKS = {
  /** İnteraktif Vergi Dairesi — borç sorgulama / ödeme (giriş gerektirir) */
  interaktifVD: "https://ivd.gib.gov.tr/",
  /** e-Fatura kayıtlı kullanıcılar listesi (kamuya açık) */
  eFaturaKayitliKullanicilar: "https://ebelge.gib.gov.tr/efaturakayitlikullanicilar.html",
  /** GİB e-Belge portalı */
  eBelge: "https://ebelge.gib.gov.tr/",
  /** Dijital Vergi Dairesi */
  dijitalVD: "https://dijital.gib.gov.tr/",
} as const;

export type EInvoiceStatus = "unknown" | "none" | "efatura" | "earsiv";

export const E_INVOICE_LABELS: Record<EInvoiceStatus, string> = {
  unknown: "Bilinmiyor",
  none:    "Mükellef değil",
  efatura: "e-Fatura mükellefi",
  earsiv:  "e-Arşiv mükellefi",
};
