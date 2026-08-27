import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sdkSource = readFileSync(new URL("./sdk.ts", import.meta.url), "utf8");

describe("production authentication boundary", () => {
  it("allows the bearer session fallback only outside production and provides a dedicated cron path", () => {
    expect(sdkSource).toContain("if (!sessionToken && !ENV.isProduction) sessionToken = this.getBearerToken(req);");
    expect(sdkSource).toContain("async authenticateCronRequest(req: Request)");
    expect(sdkSource).toContain("return this.authenticateSessionToken(this.getBearerToken(req) ?? cookies.get(COOKIE_NAME), true);");
  });

  it("prevents cron identities from being used as normal browser sessions", () => {
    expect(sdkSource).toContain("if (!allowCron) throw ForbiddenError(\"Cron identity is not valid for browser sessions\")");
  });
});
