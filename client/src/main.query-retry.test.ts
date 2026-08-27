import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const mainSource = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

describe("global tRPC query reliability", () => {
  it("retries only temporary network failures with bounded backoff", () => {
    expect(mainSource).toContain("const isRetryableNetworkError");
    expect(mainSource).toContain("/failed to fetch|networkerror/i");
    expect(mainSource).toContain("isRetryableNetworkError(error) && failureCount < 6");
    expect(mainSource).toContain("Math.min(2_000 * 2 ** attemptIndex, 20_000)");
  });

  it("keeps unauthorized handling and final query error reporting intact", () => {
    expect(mainSource).toContain("redirectToLoginIfUnauthorized(error);");
    expect(mainSource).toContain('console.error("[API Query Error]", error);');
  });

  it("uses a browser-stored bearer token only in the development preview", () => {
    expect(mainSource).toContain("if (!import.meta.env.DEV) return {};");
    expect(mainSource).toContain('sessionStorage.getItem("manus-cookie")');
  });
});
