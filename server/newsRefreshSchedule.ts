import { timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import * as db from "./db";
import { refreshFocusedNews } from "./newsRefresh";
import { sdk } from "./_core/sdk";

export function hasVercelCronAuthorization(req: Request) {
  const secret = process.env.CRON_SECRET;
  const supplied = req.get("authorization") ?? "";
  const expected = secret ? `Bearer ${secret}` : "";
  if (!secret || supplied.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}

export async function refreshFocusedNewsHandler(req: Request, res: Response) {
  try {
    if (process.env.VERCEL === "1") {
      if (!hasVercelCronAuthorization(req)) return res.status(401).json({ error: "cron-only" });
      const result = await refreshFocusedNews();
      return res.json({ ok: true, ...result, timestamp: new Date().toISOString() });
    }
    const user = await sdk.authenticateCronRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
    if (!await db.isFocusedNewsRefreshTask(user.taskUid)) return res.json({ ok: true, skipped: "orphaned-or-unrecognized-task" });
    const result = await refreshFocusedNews();
    return res.json({ ok: true, ...result, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("[news-refresh] scheduled refresh failed", error);
    return res.status(500).json({ error: "The scheduled refresh could not complete.", timestamp: new Date().toISOString() });
  }
}
