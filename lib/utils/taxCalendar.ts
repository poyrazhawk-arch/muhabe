/**
 * Türk Vergi / Beyanname Takvimi (GİB)
 * ------------------------------------
 * Muhasebecinin her ay / dönem takip etmesi gereken beyanname ve ödeme
 * son tarihlerini üretir. Tarihler standart GİB takvimine göredir; resmî
 * tatil kaydırmaları GİB tarafından ilan edildiğinde değişebilir.
 *
 * Aylık yükümlülükler bir sonraki ayda doğar (örn. Haziran KDV'si Temmuz'da).
 * Bu fonksiyon `year` içinde SON TARİHİ düşen kalemleri üretir; böylece
 * takvim görünümü o yılın 12 ayının tamamını gösterir.
 */

export type TaxLocale = "tr" | "en";

export interface TaxItem {
  /** Renk/kimlik eşlemesi için dilden bağımsız sabit kod */
  code: string;
  /** Kullanıcıya gösterilen ad (locale'e göre) */
  beyanname_turu: string;
  due_date: string; // YYYY-MM-DD
  period_year: number;
  period_month?: number;
}

const LABELS: Record<string, Record<TaxLocale, string>> = {
  kdv:       { tr: "KDV Beyannamesi",                       en: "VAT Return" },
  muhtasar:  { tr: "Muhtasar ve Prim Hizmet Beyannamesi",   en: "Withholding & Payroll Declaration" },
  sgk_prim:  { tr: "SGK Prim Ödemesi",                      en: "Social Security Premium Payment" },
  ba_bs:     { tr: "Form Ba-Bs",                            en: "Ba-Bs Forms" },
  gecici:    { tr: "Geçici Vergi Beyannamesi",              en: "Advance Tax Return" },
  yillik_gv: { tr: "Yıllık Gelir Vergisi Beyannamesi",      en: "Annual Income Tax Return" },
  kurumlar:  { tr: "Kurumlar Vergisi Beyannamesi",          en: "Corporate Tax Return" },
};

const pad = (n: number) => String(n).padStart(2, "0");
/** Ayın son günü (1-tabanlı ay) */
const lastDay = (year: number, month: number) => new Date(year, month, 0).getDate();

/**
 * Verilen yıl için Türk beyanname/ödeme son tarihlerini üretir.
 * @param year   Takvim yılı (son tarihlerin düştüğü yıl)
 * @param locale Etiket dili — varsayılan "tr"
 */
export function generateTaxCalendar(year: number, locale: TaxLocale = "tr"): TaxItem[] {
  const items: TaxItem[] = [];
  const label = (code: string) => LABELS[code][locale];

  // ── Aylık yükümlülükler ───────────────────────────────────────────
  // dueMonth = son tarihin düştüğü ay; dönem bir önceki aydır.
  for (let dueMonth = 1; dueMonth <= 12; dueMonth++) {
    const periodMonth = dueMonth === 1 ? 12 : dueMonth - 1;
    const periodYear  = dueMonth === 1 ? year - 1 : year;
    const dm = pad(dueMonth);

    // KDV Beyannamesi — izleyen ayın 28'i
    items.push({
      code: "kdv", beyanname_turu: label("kdv"),
      due_date: `${year}-${dm}-28`, period_year: periodYear, period_month: periodMonth,
    });

    // Muhtasar ve Prim Hizmet Beyannamesi — izleyen ayın 26'sı
    items.push({
      code: "muhtasar", beyanname_turu: label("muhtasar"),
      due_date: `${year}-${dm}-26`, period_year: periodYear, period_month: periodMonth,
    });

    // SGK Prim Ödemesi — izleyen ayın son günü
    items.push({
      code: "sgk_prim", beyanname_turu: label("sgk_prim"),
      due_date: `${year}-${dm}-${pad(lastDay(year, dueMonth))}`, period_year: periodYear, period_month: periodMonth,
    });

    // Form Ba-Bs — izleyen ayın son günü
    items.push({
      code: "ba_bs", beyanname_turu: label("ba_bs"),
      due_date: `${year}-${dm}-${pad(lastDay(year, dueMonth))}`, period_year: periodYear, period_month: periodMonth,
    });
  }

  // ── Geçici Vergi (3 dönem — 4. dönem 2016'da kaldırıldı) ───────────
  items.push(
    { code: "gecici", beyanname_turu: label("gecici"), due_date: `${year}-05-17`, period_year: year, period_month: 3 },
    { code: "gecici", beyanname_turu: label("gecici"), due_date: `${year}-08-17`, period_year: year, period_month: 6 },
    { code: "gecici", beyanname_turu: label("gecici"), due_date: `${year}-11-17`, period_year: year, period_month: 9 },
  );

  // ── Yıllık beyannameler (bir önceki yılın dönemi için) ─────────────
  items.push(
    { code: "yillik_gv", beyanname_turu: label("yillik_gv"), due_date: `${year}-03-31`, period_year: year - 1 },
    { code: "kurumlar",  beyanname_turu: label("kurumlar"),  due_date: `${year}-04-30`, period_year: year - 1 },
  );

  return items.sort((a, b) => a.due_date.localeCompare(b.due_date));
}

/** Önümüzdeki N gün içindeki son tarihleri döndürür */
export function getUpcomingDeadlines(items: TaxItem[], days = 30): TaxItem[] {
  const now = new Date();
  const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return items.filter(item => {
    const d = new Date(item.due_date);
    return d >= now && d <= end;
  }).sort((a, b) => a.due_date.localeCompare(b.due_date));
}
