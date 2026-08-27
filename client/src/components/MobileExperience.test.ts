import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const shellSource = readFileSync(new URL("./PublicShell.tsx", import.meta.url), "utf8");
const footerSource = readFileSync(new URL("./ContactFooter.tsx", import.meta.url), "utf8");
const chatSource = readFileSync(new URL("./AIChatBox.tsx", import.meta.url), "utf8");
const dashboardSource = readFileSync(new URL("../pages/Dashboard.tsx", import.meta.url), "utf8");
const legalSource = readFileSync(new URL("../pages/LegalPolicies.tsx", import.meta.url), "utf8");

describe("mobile experience safeguards", () => {
  it("keeps navigation above mobile safe areas with at least 44px quick-action targets", () => {
    expect(shellSource).toContain("pb-[max(.5rem,env(safe-area-inset-bottom))]");
    expect(shellSource).toContain("min-h-11 flex-col items-center justify-center");
    expect(shellSource).toContain("grid size-11 place-items-center");
  });

  it("uses phone-friendly touch targets for chat, footer, dashboard, and legal controls", () => {
    expect(chatSource).toContain('className="size-11 shrink-0"');
    expect(footerSource).toContain("grid size-11 place-items-center");
    expect(dashboardSource).toContain("min-h-11 border-[#137547]/20");
    expect(legalSource).toContain('className="w-full sm:w-auto"');
  });
});
