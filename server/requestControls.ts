import { createHmac } from "node:crypto";
import type { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from "express";
import { ENV } from "./_core/env";
import * as db from "./db";

export const PUBLIC_REQUEST_POLICIES = {
  productCheck: { scope: "product-check", limit: 30, windowMs: 60_000 },
  productSuggestions: { scope: "product-suggestions", limit: 90, windowMs: 60_000 },
  assistant: { scope: "islamic-guidance", limit: 5, windowMs: 60_000 },
  assistantStreamLeaseMs: 180_000,
} as const;

export const MAX_TRPC_BATCH_OPERATIONS = 10;

type RequestIdentitySource = Pick<Request, "ip" | "socket">;

/**
 * Generates an HMAC from the request IP rather than retaining the raw address.
 * Production trusts precisely one platform edge proxy; development uses the
 * direct socket address through Express's default trust-proxy behaviour.
 */
export function createPublicClientKey(request: RequestIdentitySource): string {
  const address = request.ip || request.socket?.remoteAddress || "unavailable";
  const secret = ENV.cookieSecret || "development-request-limit-key";
  return createHmac("sha256", secret).update(`public-request:${address}`).digest("hex");
}

export function retryAfterSeconds(resetAt: Date, now = new Date()): number {
  return Math.max(1, Math.ceil((resetAt.getTime() - now.getTime()) / 1_000));
}

export function publicRateLimit(policy: { scope: string; limit: number; windowMs: number }): RequestHandler {
  return async (req, res, next) => {
    try {
      const result = await db.consumeRateLimit({
        ...policy,
        clientKey: createPublicClientKey(req),
      });
      if (result.allowed) return next();

      res.setHeader("Retry-After", String(retryAfterSeconds(result.resetAt)));
      return res.status(429).json({ error: "Too many requests. Please wait a moment and try again." });
    } catch (error) {
      console.error("[request-controls] shared rate-limit check failed", error);
      return res.status(503).json({ error: "This service is temporarily unavailable. Please try again shortly." });
    }
  };
}

/** Limits aggregate tRPC work while allowing ordinary one-operation requests. */
export const trpcBatchOperationLimit: RequestHandler = (req, res, next) => {
  if (req.query.batch !== "1") return next();

  const input = typeof req.query.input === "string" ? req.query.input : req.body;
  try {
    const parsed = typeof input === "string" ? JSON.parse(input) : input;
    if (parsed && typeof parsed === "object" && Object.keys(parsed).length > MAX_TRPC_BATCH_OPERATIONS) {
      return res.status(413).json({ error: `Request batches may contain at most ${MAX_TRPC_BATCH_OPERATIONS} operations.` });
    }
  } catch {
    // Let tRPC return its normal invalid-input response.
  }
  return next();
};

/** Browser protections that are safe for the deployed site and skipped for Vite’s development tooling. */
export const browserSecurityHeaders: RequestHandler = (_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), geolocation=(), microphone=(), payment=(), usb=()");

  if (ENV.isProduction) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' https://manus-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https:; media-src 'self' blob: https:; connect-src 'self' https://manus-analytics.com; worker-src 'self' blob:",
    );
  }
  return next();
};

/** Returns only non-sensitive JSON errors for malformed or oversized requests. */
export const requestBodyErrorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) return next(error);
  const parserError = error as { type?: string; status?: number; statusCode?: number };
  if (parserError.type === "entity.too.large" || parserError.status === 413 || parserError.statusCode === 413) {
    return res.status(413).json({ error: "Request payload is too large." });
  }
  if (parserError.type === "entity.parse.failed" || parserError.status === 400 || parserError.statusCode === 400) {
    return res.status(400).json({ error: "Request body must be valid JSON." });
  }
  return next(error);
};
