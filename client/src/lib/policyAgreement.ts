// Bump this key when the published agreement flow is restored or materially revised.
// An earlier v1 acknowledgement must not suppress the current first-search prompt.
export const POLICY_AGREEMENT_STORAGE_KEY = "avoiditnow-policy-agreement-v2";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function hasAcceptedPolicyAgreement(storage: StorageLike) {
  return storage.getItem(POLICY_AGREEMENT_STORAGE_KEY) === "accepted";
}

export function savePolicyAgreement(storage: StorageLike) {
  storage.setItem(POLICY_AGREEMENT_STORAGE_KEY, "accepted");
}
