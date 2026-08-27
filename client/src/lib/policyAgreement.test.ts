import { describe, expect, it } from "vitest";
import { hasAcceptedPolicyAgreement, POLICY_AGREEMENT_STORAGE_KEY, savePolicyAgreement } from "./policyAgreement";

function createMemoryStorage() {
  const entries = new Map<string, string>();
  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => entries.set(key, value),
  };
}

describe("policy agreement storage", () => {
  it("does not treat an unrecorded acknowledgement as accepted", () => {
    expect(hasAcceptedPolicyAgreement(createMemoryStorage())).toBe(false);
  });

  it("does not let an acknowledgement from the prior agreement version suppress the current prompt", () => {
    const storage = createMemoryStorage();
    storage.setItem("avoiditnow-policy-agreement-v1", "accepted");

    expect(hasAcceptedPolicyAgreement(storage)).toBe(false);
  });

  it("records and recognises an acknowledgement on the same browser storage", () => {
    const storage = createMemoryStorage();

    savePolicyAgreement(storage);

    expect(storage.getItem(POLICY_AGREEMENT_STORAGE_KEY)).toBe("accepted");
    expect(hasAcceptedPolicyAgreement(storage)).toBe(true);
  });
});
