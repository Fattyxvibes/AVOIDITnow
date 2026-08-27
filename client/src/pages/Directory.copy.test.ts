import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const directorySource = readFileSync(new URL("./Directory.tsx", import.meta.url), "utf8");

describe("product checker copy", () => {
  it("uses the requested heading and supporting invitation without changing the checker flow", () => {
    expect(directorySource).toContain('title="From uncertainty to a more informed everyday choice"');
    expect(directorySource).toContain('summary="Check a product and see alternatives immediately."');
  });

  it("uses boycott-list terminology rather than user-facing database wording", () => {
    expect(directorySource).not.toMatch(/database/i);
    expect(directorySource).toContain("This checker brings together current boycott-list information and related alternatives.");
    expect(directorySource).toContain("Use a listed brand, product, or sub-brand.");
  });

  it("distinguishes listed and unlisted products with clear red and green states", () => {
    expect(directorySource).toContain('"On boycott list"');
    expect(directorySource).toContain('"Not currently on boycott list"');
    expect(directorySource).toContain('bg-[#fff4f3]');
    expect(directorySource).toContain('bg-[#f1f7f1]');
    expect(directorySource).toContain('is not currently on the boycott list.');
  });

  it("keeps three related alternatives immediately beneath each boycotted result", () => {
    expect(directorySource).toContain("Every boycotted product displays three related alternatives directly below it.");
    expect(directorySource).toContain("match.alternatives.slice(0, 3).map");
  });
});
