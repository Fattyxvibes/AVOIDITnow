import { describe, expect, it } from "vitest";
import { getIslamicReferenceAppendix } from "./islamicReferences";

describe("getIslamicReferenceAppendix", () => {
  it("adds a Qur'an consumption reference for general halal questions", () => {
    expect(getIslamicReferenceAppendix("How should I think about halal ingredients?")).toContain("https://quran.com/2/168");
  });

  it("adds a charitable-giving reference with a personal-obligation caveat", () => {
    expect(getIslamicReferenceAppendix("How should I approach zakat and charity?")).toContain("seek qualified advice for personal zakat calculations");
  });

  it("does not fabricate a reference when no deterministic topic match exists", () => {
    expect(getIslamicReferenceAppendix("Please explain this historical event.")).toBe("");
  });
});
