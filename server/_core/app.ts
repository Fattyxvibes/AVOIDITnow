import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { streamAssistantResponse } from "../assistantStream";
import { refreshFocusedNewsHandler } from "../newsRefreshSchedule";
import { createContext } from "./context";
import { ENV } from "./env";
import { browserSecurityHeaders, publicRateLimit, PUBLIC_REQUEST_POLICIES, requestBodyErrorHandler, trpcBatchOperationLimit } from "../requestControls";

/**
 * Builds the complete Express application without binding a port. The managed
 * runtime starts this app from `index.ts`; Vercel imports the same app through
 * its serverless `/api/index.ts` entrypoint.
 */
export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  // Production runs behind exactly one managed edge proxy. Do not trust an
  // arbitrary forwarded-header chain supplied by a public client.
  app.set("trust proxy", process.env.NODE_ENV === "production" ? 1 : false);
  app.use(browserSecurityHeaders);

  // The guide checks its rate limit before parsing and has a deliberate,
  // text-only cap sized for the allowed conversation history.
  app.post(
    "/api/assistant/stream",
    publicRateLimit(PUBLIC_REQUEST_POLICIES.assistant),
    express.json({ limit: "96kb" }),
    streamAssistantResponse,
  );
  // There are no public uploads. Keep all other API bodies small.
  app.use(express.json({ limit: "64kb" }));
  app.use(express.urlencoded({ limit: "16kb", extended: true }));

  // Static product media is copied into Vercel's public directory. Preserve
  // the managed storage proxy only where its runtime credentials are present.
  if (ENV.forgeApiUrl && ENV.forgeApiKey) registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.route("/api/scheduled/refresh-focused-news")
    .get(refreshFocusedNewsHandler)
    .post(refreshFocusedNewsHandler);
  app.use(
    "/api/trpc",
    trpcBatchOperationLimit,
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );
  app.use(requestBodyErrorHandler);
  return app;
}

export default createApp();
