import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const oauthSource = readFileSync(new URL("./oauth.ts", import.meta.url), "utf8");

describe("issued session lifetime", () => {
  it("uses the shared seven-day session lifetime for both the token and secure cookie", () => {
    expect(oauthSource).toContain("SESSION_MAX_AGE_MS");
    expect(oauthSource).toContain("expiresInMs: SESSION_MAX_AGE_MS");
    expect(oauthSource).toContain("maxAge: SESSION_MAX_AGE_MS");
  });
});
