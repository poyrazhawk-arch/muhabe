import { describe, it, expect } from "vitest";
import { generateTaxCalendar, getUpcomingDeadlines } from "./taxCalendar";

describe("generateTaxCalendar (TR)", () => {
  const items = generateTaxCalendar(2026, "tr");

  it("tüm aylık yükümlülükleri üretir (12 ay × 4) + geçici (3) + yıllık (2)", () => {
    expect(items.length).toBe(12 * 4 + 3 + 2);
  });

  it("Temmuz kalemleri doğru gün ve Türkçe adlarla", () => {
    const temmuz = items.filter(i => i.due_date.startsWith("2026-07"));
    const byCode = Object.fromEntries(temmuz.map(i => [i.code, i.due_date]));
    expect(byCode["muhtasar"]).toBe("2026-07-26");
    expect(byCode["kdv"]).toBe("2026-07-28");
    expect(byCode["sgk_prim"]).toBe("2026-07-31");
    expect(byCode["ba_bs"]).toBe("2026-07-31");
    expect(temmuz.find(i => i.code === "kdv")!.beyanname_turu).toBe("KDV Beyannamesi");
  });

  it("geçici vergi 3 dönem (May/Ağu/Kas 17)", () => {
    const gecici = items.filter(i => i.code === "gecici").map(i => i.due_date);
    expect(gecici).toEqual(["2026-05-17", "2026-08-17", "2026-11-17"]);
  });

  it("yıllık beyannameler doğru tarihlerde", () => {
    expect(items.find(i => i.code === "yillik_gv")!.due_date).toBe("2026-03-31");
    expect(items.find(i => i.code === "kurumlar")!.due_date).toBe("2026-04-30");
  });

  it("EN locale İngilizce etiket üretir", () => {
    const en = generateTaxCalendar(2026, "en");
    expect(en.find(i => i.code === "kdv")!.beyanname_turu).toBe("VAT Return");
  });

  it("getUpcomingDeadlines gelecek kalemleri sıralı döndürür", () => {
    const up = getUpcomingDeadlines(items, 30);
    expect(up.length).toBeGreaterThan(0);
    const dates = up.map(i => i.due_date);
    expect([...dates].sort()).toEqual(dates);
  });
});
