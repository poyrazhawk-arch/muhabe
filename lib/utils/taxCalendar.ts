/**
 * UK / International Tax Filing Calendar
 * Covers common deadlines for UK, Australia, Canada, New Zealand, Ireland.
 */

export interface TaxItem {
  beyanname_turu: string;
  due_date: string; // YYYY-MM-DD
  period_year: number;
  period_month?: number;
}

/** Generate filing deadlines for a given year */
export function generateTaxCalendar(year: number): TaxItem[] {
  const items: TaxItem[] = [];

  for (let month = 1; month <= 12; month++) {
    const m  = String(month).padStart(2, "0");
    const nm = String(month === 12 ? 1 : month + 1).padStart(2, "0");
    const ny = month === 12 ? year + 1 : year;

    // PAYE / Payroll Filing — 19th of each month
    items.push({
      beyanname_turu: "PAYE / Payroll Filing",
      due_date: `${year}-${m}-19`,
      period_year: year,
      period_month: month,
    });

    // VAT Return — 7th of the following month (monthly filers)
    items.push({
      beyanname_turu: "VAT Return",
      due_date: `${ny}-${nm}-07`,
      period_year: year,
      period_month: month,
    });
  }

  // Quarterly Corporation Tax Instalments
  items.push(
    { beyanname_turu: "Q1 Corporation Tax",  due_date: `${year}-04-01`, period_year: year, period_month: 3  },
    { beyanname_turu: "Q2 Corporation Tax",  due_date: `${year}-07-01`, period_year: year, period_month: 6  },
    { beyanname_turu: "Q3 Corporation Tax",  due_date: `${year}-10-01`, period_year: year, period_month: 9  },
    { beyanname_turu: "Q4 Corporation Tax",  due_date: `${year}-01-01`, period_year: year, period_month: 12 },
  );

  // Annual filings
  items.push(
    { beyanname_turu: "Self Assessment (online)", due_date: `${year + 1}-01-31`, period_year: year },
    { beyanname_turu: "Corporation Tax Return",   due_date: `${year + 1}-12-31`, period_year: year },
    { beyanname_turu: "Company Accounts Filing",  due_date: `${year + 1}-09-30`, period_year: year },
    { beyanname_turu: "Confirmation Statement",   due_date: `${year + 1}-03-31`, period_year: year },
  );

  return items;
}

/** Return items due within the next N days */
export function getUpcomingDeadlines(items: TaxItem[], days = 30): TaxItem[] {
  const now = new Date();
  const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return items.filter(item => {
    const d = new Date(item.due_date);
    return d >= now && d <= end;
  }).sort((a, b) => a.due_date.localeCompare(b.due_date));
}
