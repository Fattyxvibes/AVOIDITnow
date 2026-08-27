import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const donateSource = readFileSync(new URL("./Donate.tsx", import.meta.url), "utf8");

describe("Donate empty state", () => {
  it("uses the requested concise coming-soon message", () => {
    expect(donateSource).toContain('eyebrow="Coming soon" title="Fund the work that makes choices clearer"');
    expect(donateSource).toContain('summary="Campaigns provide focused support for transparent research, community care and maintaining the public resource."');
    expect(donateSource).toContain('emptyTitle="Coming soon."');
    expect(donateSource).toContain('emptyDescription=""');
    expect(donateSource).toContain('emptyActionLabel=""');
    expect(donateSource).toContain("emptyIcon={<Loader2");
    expect(donateSource).not.toContain("No active campaign at this moment");
  });
});
