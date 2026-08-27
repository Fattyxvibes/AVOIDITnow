import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const legalPoliciesSource = readFileSync(resolve(import.meta.dirname, "LegalPolicies.tsx"), "utf8");

describe("public in-page legal content", () => {
  it("renders the visible policy documents directly and keeps only the related-policy navigation", () => {
    expect(legalPoliciesSource).toContain("PolicyDocument draft={draft}");
    expect(legalPoliciesSource).toContain("AVOIDITnow_Privacy_Policy_Published.md?raw");
    expect(legalPoliciesSource).toContain("AVOIDITnow_Terms_of_Use_Published.md?raw");
    expect(legalPoliciesSource).toContain("Read Terms of Use");
    expect(legalPoliciesSource).toContain("Read Privacy Policy");
    expect(legalPoliciesSource).not.toContain("Open PDF");
    expect(legalPoliciesSource).not.toContain(".pdf");
    expect(legalPoliciesSource).not.toContain("ViewportReveal delay={180}");
  });
});
