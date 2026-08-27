import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const appSource = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
const shellSource = readFileSync(new URL("./components/PublicShell.tsx", import.meta.url), "utf8");

describe("public route and navigation audit", () => {
  it("keeps About Us as an explicit public destination", () => {
    expect(appSource).toContain('path={"/about"}');
    expect(shellSource).toContain('{ href: "/about", label: "About Us" }');
  });

  it("does not expose standalone alternatives, admin routes, or dashboard navigation in the public shell", () => {
    expect(appSource).not.toContain('path={"/alternatives"}');
    expect(appSource).not.toContain('path={"/admin"}');
    expect(appSource).not.toContain('path={"/admin/:section"}');
    expect(shellSource).not.toContain('href: "/alternatives"');
    expect(shellSource).not.toContain('href: "/admin"');
    expect(shellSource).not.toContain('href: "/dashboard"');
  });

  it("registers the private dashboard without adding it to public navigation", () => {
    expect(appSource).toContain('path={"/dashboard"}');
    expect(shellSource).not.toContain('Dashboard');
  });

  it("keeps the Choose with conscience wordmark tagline visible on mobile", () => {
    expect(shellSource).toContain('ml-3 inline whitespace-nowrap text-[10px]');
    expect(shellSource).not.toContain('ml-3 hidden text-[10px]');
  });
});
