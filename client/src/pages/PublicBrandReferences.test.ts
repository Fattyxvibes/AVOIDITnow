import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const aboutSource = readFileSync(new URL("./About.tsx", import.meta.url), "utf8");
const footerSource = readFileSync(new URL("../components/ContactFooter.tsx", import.meta.url), "utf8");

describe("public AVOIDITnow references", () => {
  it("standardizes written public content without modifying the visual logo implementation", () => {
    expect(aboutSource).toContain('eyebrow="About AVOIDITnow"');
    expect(aboutSource).toContain("AVOIDITnow is an emerging NGO");
    expect(aboutSource).toContain("AVOIDITnow exists to raise awareness");
    expect(footerSource).toContain('aria-label="Contact AVOIDITnow"');
    expect(footerSource).toContain(">Contact AVOIDITnow</p>");
    expect(footerSource).toContain("email the AVOIDITnow team directly.");
  });
});
