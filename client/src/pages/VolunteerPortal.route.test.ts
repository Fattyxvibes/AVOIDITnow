import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const appSource = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
const homeSource = readFileSync(new URL("./Home.tsx", import.meta.url), "utf8");
const portalSource = readFileSync(new URL("./VolunteerPortal.tsx", import.meta.url), "utf8");

describe("Volunteer Portal entry points", () => {
  it("registers the public portal and provides a restrained hero call to volunteers", () => {
    expect(appSource).toContain('path={"/volunteer"}');
    expect(homeSource).toContain('setLocation("/volunteer")');
    expect(homeSource).toContain("Call for volunteers");
  });

  it("uses the privacy-preserving email application flow rather than database collection", () => {
    expect(portalSource).toContain("contactavoidit@gmail.com");
    expect(portalSource).toContain("Nothing is submitted or stored by this website.");
    expect(portalSource).not.toContain("trpc.");
  });
});
