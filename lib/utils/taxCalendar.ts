/**
 * Türk Vergi Takvimi — yasal beyanname tarihleri
 * Tüm tarihler GİB mevzuatına göredir (2024+).
 */

export interface TaxItem {
  beyanname_turu: string;
  due_date: string; // YYYY-MM-DD
  period_year: number;
  period_month?: number;
}

/** Belirli yıl için tüm beyanname tarihlerini döndürür */
export function generateTaxCalendar(year: number): TaxItem[] {
  const items: TaxItem[] = [];

  for (let month = 1; month <= 12; month++) {
    const m = String(month).padStart(2, "0");
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear  = month === 12 ? year + 1 : year;
    const nm = String(nextMonth).padStart(2, "0");

    // KDV Beyannamesi — her ayın 26'sı (bir önceki ay için)
    items.push({
      beyanname_turu: "KDV Beyannamesi",
      due_date: `${year}-${m}-26`,
      period_year: year,
      period_month: month,
    });

    // Muhtasar Beyanname — her ayın 26'sı
    items.push({
      beyanname_turu: "Muhtasar Beyanname",
      due_date: `${year}-${m}-26`,
      period_year: year,
      period_month: month,
    });

    // SGK Bildirge — her ayın 23'ü
    items.push({
      beyanname_turu: "SGK Aylık Bildirge",
      due_date: `${year}-${m}-23`,
      period_year: year,
      period_month: month,
    });

    // BA-BS Bildirimi — her ikinci ayın 5'i (birikimli ay için)
    if (month % 2 === 0) {
      items.push({
        beyanname_turu: "BA-BS Bildirimi",
        due_date: `${nextYear}-${nm}-05`,
        period_year: year,
        period_month: month,
      });
    }
  }

  // Geçici Vergi
  items.push(
    { beyanname_turu: "1. Dönem Geçici Vergi", due_date: `${year}-05-17`, period_year: year, period_month: 3  },
    { beyanname_turu: "2. Dönem Geçici Vergi", due_date: `${year}-08-17`, period_year: year, period_month: 6  },
    { beyanname_turu: "3. Dönem Geçici Vergi", due_date: `${year}-11-17`, period_year: year, period_month: 9  },
  );

  // Yıllık Beyannameler
  items.push(
    { beyanname_turu: "Yıllık Gelir Vergisi Beyannamesi",    due_date: `${year + 1}-03-31`, period_year: year },
    { beyanname_turu: "Kurumlar Vergisi Beyannamesi",          due_date: `${year + 1}-04-30`, period_year: year },
    { beyanname_turu: "Damga Vergisi Beyannamesi (Yıllık)",    due_date: `${year + 1}-01-26`, period_year: year },
  );

  return items;
}

/** Bir sonraki N gün içindeki beyannameleri döndürür */
export function getUpcomingDeadlines(items: TaxItem[], days = 30): TaxItem[] {
  const now  = new Date();
  const end  = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return items.filter(item => {
    const d = new Date(item.due_date);
    return d >= now && d <= end;
  }).sort((a, b) => a.due_date.localeCompare(b.due_date));
}
