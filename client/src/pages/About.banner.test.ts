import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const aboutSource = readFileSync(new URL("./About.tsx", import.meta.url), "utf8");

describe("About Us brand banner", () => {
  it("places the supplied banner alongside the purpose statement in a responsive layout", () => {
    expect(aboutSource).toContain('lg:grid-cols-[minmax(0,.92fr)_minmax(0,1.08fr)]');
    expect(aboutSource).toContain('import { deploymentAssets } from "@/lib/deploymentAssets"');
    expect(aboutSource).toContain('src={deploymentAssets.aboutBanner}');
    expect(aboutSource).toContain('alt="AVOIDITnow banner: Know what you buy. Choose with conscience."');
    expect(aboutSource).toContain('className="aspect-video w-full object-cover"');
  });

  it("makes only the artwork’s displayed product-check action a keyboard-accessible route to the checker", () => {
    expect(aboutSource).toContain('import { Link } from "wouter"');
    expect(aboutSource).toContain('<Link href="/directory" aria-label="Check a product"');
    expect(aboutSource).toContain('left-[3%] top-[74%] h-[14%] w-[35%]');
    expect(aboutSource).toContain('focus-visible:ring-4 focus-visible:ring-[#137547]');
  });
});
