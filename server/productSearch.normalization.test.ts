import { describe, expect, it } from "vitest";
import { normalizeDatabaseSearch } from "./db";

describe("product search normalization", () => {
  it("treats Domino's and Dominos as the same search key", () => {
    expect(normalizeDatabaseSearch("Domino's")).toBe(normalizeDatabaseSearch("Dominos"));
  });

  it("ignores punctuation and repeated spacing without changing meaningful terms", () => {
    expect(normalizeDatabaseSearch("Coca-Cola   Zero")).toBe("coca cola zero");
    expect(normalizeDatabaseSearch("Kit-Kat")).toBe("kit kat");
  });
});

