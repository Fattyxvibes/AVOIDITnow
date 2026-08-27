import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const cookieSource = readFileSync(new URL("./cookies.ts", import.meta.url), "utf8");

describe("production cookie policy", () => {
  it("uses Lax, HTTP-only session cookies in production while retaining preview compatibility outside production", () => {
    expect(cookieSource).toContain('httpOnly: true');
    expect(cookieSource).toContain('sameSite: ENV.isProduction ? "lax" : "none"');
    expect(cookieSource).toContain("if (ENV.isProduction) {");
    expect(cookieSource).toContain("return false;");
  });
});
