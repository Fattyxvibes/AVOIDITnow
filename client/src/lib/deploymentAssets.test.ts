import { describe, expect, it } from "vitest";
import { isPortableDeployment } from "./deploymentAssets";

describe("isPortableDeployment", () => {
  it("recognises an explicit Vercel build target", () => {
    expect(isPortableDeployment("vercel", undefined)).toBe(true);
  });

  it("recognises a Vercel hostname when the build flag is absent", () => {
    expect(isPortableDeployment(undefined, "avoidi-tnow-ylpf.vercel.app")).toBe(true);
    expect(isPortableDeployment(undefined, "PREVIEW.VERCEL.APP")).toBe(true);
  });

  it("keeps managed-hosted and unrelated domains on managed assets", () => {
    expect(isPortableDeployment(undefined, "avoidit-4fscyekj.manus.space")).toBe(false);
    expect(isPortableDeployment(undefined, "example.vercel.app.evil.test")).toBe(false);
  });
});
