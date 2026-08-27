import type { Request } from "express";
import { afterEach, describe, expect, it } from "vitest";
import { hasVercelCronAuthorization } from "./newsRefreshSchedule";

const originalCronSecret = process.env.CRON_SECRET;

afterEach(() => {
  if (originalCronSecret === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = originalCronSecret;
});

function request(authorization?: string) {
  return { get: (name: string) => name === "authorization" ? authorization : undefined } as unknown as Request;
}

describe("Vercel Cron authorization", () => {
  it("accepts only the exact configured bearer secret", () => {
    process.env.CRON_SECRET = "independent-cron-secret";
    expect(hasVercelCronAuthorization(request("Bearer independent-cron-secret"))).toBe(true);
    expect(hasVercelCronAuthorization(request("Bearer wrong-secret"))).toBe(false);
    expect(hasVercelCronAuthorization(request())).toBe(false);
  });

  it("fails closed when no Vercel cron secret is configured", () => {
    delete process.env.CRON_SECRET;
    expect(hasVercelCronAuthorization(request("Bearer independent-cron-secret"))).toBe(false);
  });
});
