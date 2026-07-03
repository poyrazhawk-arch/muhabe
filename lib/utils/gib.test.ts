import { describe, it, expect } from "vitest";
import { isValidVKN, isValidTCKN, classifyTaxId, isValidTaxId } from "./gib";

describe("isValidVKN (10 hane)", () => {
  it("geçerli VKN'i kabul eder", () => {
    expect(isValidVKN("1111111114")).toBe(true); // checksum doğru
  });
  it("yanlış checksum'ı reddeder", () => {
    expect(isValidVKN("1111111111")).toBe(false);
  });
  it("yanlış uzunluğu reddeder", () => {
    expect(isValidVKN("123")).toBe(false);
    expect(isValidVKN("11111111145")).toBe(false);
  });
  it("boşluk/tire içeren girişi temizler", () => {
    expect(isValidVKN("111 111 1114")).toBe(true);
  });
});

describe("isValidTCKN (11 hane)", () => {
  it("geçerli TCKN'i kabul eder", () => {
    expect(isValidTCKN("10000000146")).toBe(true);
    expect(isValidTCKN("11111111110")).toBe(true);
  });
  it("0 ile başlayanı reddeder", () => {
    expect(isValidTCKN("01111111110")).toBe(false);
  });
  it("yanlış checksum'ı reddeder", () => {
    expect(isValidTCKN("10000000145")).toBe(false);
  });
  it("yanlış uzunluğu reddeder", () => {
    expect(isValidTCKN("1000000014")).toBe(false);
  });
});

describe("classifyTaxId / isValidTaxId", () => {
  it("10 haneli geçerliyi vkn olarak sınıflar", () => {
    expect(classifyTaxId("1111111114")).toBe("vkn");
  });
  it("11 haneli geçerliyi tckn olarak sınıflar", () => {
    expect(classifyTaxId("10000000146")).toBe("tckn");
  });
  it("geçersizi invalid olarak sınıflar", () => {
    expect(classifyTaxId("123456")).toBe("invalid");
    expect(isValidTaxId("123456")).toBe(false);
    expect(isValidTaxId("1111111114")).toBe(true);
  });
});
