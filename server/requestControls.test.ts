import { describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({ consumeRateLimit: vi.fn() }));

import { browserSecurityHeaders, createPublicClientKey, requestBodyErrorHandler, retryAfterSeconds, trpcBatchOperationLimit } from "./requestControls";

describe("public request controls", () => {
  it("derives stable opaque client keys without retaining a raw IP address", () => {
    const request = { ip: "198.51.100.42", socket: { remoteAddress: "198.51.100.42" } } as never;
    const key = createPublicClientKey(request);

    expect(key).toHaveLength(64);
    expect(key).toBe(createPublicClientKey(request));
    expect(key).not.toContain("198.51.100.42");
  });

  it("calculates a whole-second, non-zero retry delay", () => {
    expect(retryAfterSeconds(new Date("2026-08-27T12:00:00.100Z"), new Date("2026-08-27T12:00:00.000Z"))).toBe(1);
    expect(retryAfterSeconds(new Date("2026-08-27T12:00:02.001Z"), new Date("2026-08-27T12:00:00.000Z"))).toBe(3);
  });

  it("returns a generic 413 response without parser implementation details", () => {
    const json = vi.fn();
    const response = { headersSent: false, status: vi.fn(), json } as never;
    response.status.mockReturnValue(response);
    const next = vi.fn();

    requestBodyErrorHandler({ type: "entity.too.large", status: 413 } as never, {} as never, response, next);

    expect(response.status).toHaveBeenCalledWith(413);
    expect(json).toHaveBeenCalledWith({ error: "Request payload is too large." });
    expect(next).not.toHaveBeenCalled();
  });

  it("caps tRPC batch work while allowing ordinary requests to proceed", () => {
    const json = vi.fn();
    const response = { status: vi.fn(), json } as never;
    response.status.mockReturnValue(response);
    const blockedNext = vi.fn();
    const oversizedBatch = Object.fromEntries(Array.from({ length: 11 }, (_, index) => [String(index), { json: {} }]));

    trpcBatchOperationLimit({ query: { batch: "1" }, body: oversizedBatch } as never, response, blockedNext);

    expect(response.status).toHaveBeenCalledWith(413);
    expect(json).toHaveBeenCalledWith({ error: "Request batches may contain at most 10 operations." });
    expect(blockedNext).not.toHaveBeenCalled();

    const allowedNext = vi.fn();
    trpcBatchOperationLimit({ query: { batch: "1" }, body: { 0: { json: {} } } } as never, response, allowedNext);
    expect(allowedNext).toHaveBeenCalledOnce();
  });

  it("adds baseline clickjacking, MIME, referrer, and permissions protections", () => {
    const setHeader = vi.fn();
    const next = vi.fn();

    browserSecurityHeaders({} as never, { setHeader } as never, next);

    expect(setHeader).toHaveBeenCalledWith("X-Content-Type-Options", "nosniff");
    expect(setHeader).toHaveBeenCalledWith("X-Frame-Options", "DENY");
    expect(setHeader).toHaveBeenCalledWith("Referrer-Policy", "strict-origin-when-cross-origin");
    expect(next).toHaveBeenCalledOnce();
  });
});
