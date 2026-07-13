import { describe, it, expect } from "vitest";
import { normalizePhoneTR, waLink } from "./whatsapp";

describe("normalizePhoneTR", () => {
  it("0 ile başlayan 11 haneyi 90'a çevirir", () => {
    expect(normalizePhoneTR("05325627878")).toBe("905325627878");
  });
  it("+90 formatını korur", () => {
    expect(normalizePhoneTR("+90 532 562 78 78")).toBe("905325627878");
  });
  it("10 haneli 5xx'i 90 ile öneklendirir", () => {
    expect(normalizePhoneTR("5325627878")).toBe("905325627878");
  });
  it("boş/geçersizde null döner", () => {
    expect(normalizePhoneTR("")).toBeNull();
    expect(normalizePhoneTR("123")).toBeNull();
  });
});

describe("waLink", () => {
  it("mesajı URL-encode eder", () => {
    const link = waLink("05325627878", "Merhaba dünya");
    expect(link).toContain("wa.me/905325627878");
    expect(link).toContain("Merhaba%20d%C3%BCnya");
  });
  it("geçersiz telefonda null döner", () => {
    expect(waLink("abc", "x")).toBeNull();
  });
});
