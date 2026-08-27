import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const policy = readFileSync(new URL("../../../legal-drafts/AVOIDITnow_Privacy_Policy_Published.md", import.meta.url), "utf8");

describe("public no-registration privacy policy", () => {
  it("removes the data protection officer row and explains minimised search analytics", () => {
    expect(policy).not.toContain("Data Protection Officer");
    expect(policy).not.toContain("Account and authentication data");
    expect(policy).toContain("normalised product-search term and the time of the search");
    expect(policy).toContain("does not store an account ID, email address, IP address, device identifier, session identifier");
  });
});
