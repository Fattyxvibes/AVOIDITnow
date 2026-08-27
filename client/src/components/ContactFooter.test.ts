import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const footerSource = readFileSync(new URL("./ContactFooter.tsx", import.meta.url), "utf8");
const shellSource = readFileSync(new URL("./PublicShell.tsx", import.meta.url), "utf8");

describe("shared contact footer", () => {
  it("provides the configured contact email through a direct mail action", () => {
    expect(footerSource).toContain('const contactEmail = "contactavoidit@gmail.com"');
    expect(footerSource).toContain("mailto:${contactEmail}");
  });

  it("connects the supplied official Avoiditnow social profiles and uses shared reveal motion", () => {
    expect(footerSource).toContain('label: "X"');
    expect(footerSource).toContain('label: "Instagram"');
    expect(footerSource).toContain('label: "Facebook"');
    expect(footerSource).toContain('href: "https://x.com/AVOIDITnow"');
    expect(footerSource).toContain('href: "https://www.instagram.com/avoiditnow?igsi=MW0ycTV2OGl0cGZtaw=="');
    expect(footerSource).toContain('href: "https://www.facebook.com/share/1KpN8uw6Av/"');
    expect(footerSource).toContain('target="_blank" rel="noreferrer"');
    expect(footerSource).toContain('Visit AVOIDITnow on ${profile.label} (opens in a new tab)');
    expect(footerSource).toContain("AVOIDITnow");
    expect(footerSource).toContain("Click a profile icon below to access social media.");
    expect(footerSource).not.toContain("Profile links will be connected as soon as they are confirmed.");
    expect(footerSource).toContain("ViewportReveal");
    expect(footerSource).toContain("bg-[#f4f8f3]/[.58]");
    expect(footerSource).toContain("backdrop-blur-2xl");
    expect(shellSource).toContain("<ContactFooter />");
  });
});
