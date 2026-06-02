import { describe, it, expect } from "vitest";
import { calculateRAG } from "@/lib/utils/rag";

describe("calculateRAG", () => {
  it("geciken görev varsa kırmızı döner", () => {
    expect(calculateRAG(1, 0, 0)).toBe("red");
  });

  it("3+ bekleyen belge varsa kırmızı döner", () => {
    expect(calculateRAG(0, 3, 0)).toBe("red");
  });

  it("yaklaşan görev varsa sarı döner", () => {
    expect(calculateRAG(0, 0, 1)).toBe("amber");
  });

  it("1-2 bekleyen belge varsa sarı döner", () => {
    expect(calculateRAG(0, 1, 0)).toBe("amber");
  });

  it("her şey yolundaysa yeşil döner", () => {
    expect(calculateRAG(0, 0, 0)).toBe("green");
  });
});
