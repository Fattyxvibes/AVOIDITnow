# Vercel portability notes

These notes record the deployment constraints verified on 27 August 2026 while preparing an independent Vercel export of AVOIDITnow.

| Concern | Verified Vercel behavior | Export decision |
|---|---|---|
| Express runtime | Vercel can run an Express application as a serverless function when the application is exported from a supported root or `api` entrypoint. | Add a dedicated `/api/index.ts` entrypoint that exports the existing Express app without listening on a port. |
| Static Vite assets | Vercel serves root `public/**` assets through its CDN; `express.static()` is ignored in that environment. | Build the Vite client into root `/public`, retain assets there, and let Vercel serve them. |
| SPA routes | A Vite SPA needs an explicit rewrite so deep links return the client entrypoint. | Route `/api/:path*` to the Express function first, then send all remaining routes to `/index.html`. |
| Scheduled refresh | Vercel Cron invokes production routes with `GET`; a `CRON_SECRET` is sent as a `Bearer` authorization header when configured. | Support an authenticated Vercel cron request for the existing news-refresh path and document the required secret. |
| Functions | Vercel Functions scale independently and have plan-dependent duration limits. | Keep the existing durable database-backed rate controls; document that the AI stream needs an adequate configured function duration. |

The export must not include any existing secret, database credential, platform token, or locally created environment file. The original managed deployment remains supported independently of this portability configuration.

## Asset migration finding

The active site currently resolves its logo, hero poster, hero video, and About Us banner through a managed storage proxy. Those relative `/manus-storage/` paths are specific to the managed deployment and would not resolve on Vercel. The hero video was retrieved from its current public deployment for inclusion as a static export asset; the other three media files will likewise be included under the Vercel `public/media/` directory. The application will select these static files only when `VITE_DEPLOYMENT_TARGET=vercel` is explicitly set at build time.

The current 1280×720 WebP hero-poster file was also preserved for the static bundle. It remains the source poster associated with the exported MP4 hero video.

The current 1920×1920 transparent AVOIDITnow mark was preserved for the static bundle as well. The export will retain the existing small red arrow-tip overlay in the application, so the visible wordmark treatment remains unchanged.

## Deployment handoff

The GitHub export contains the Vercel configuration, a serverless Express entrypoint, the static Vite build configuration, and the reviewed media bundle. Connect the `Fattyxvibes/AVOIDITnow` repository to a new Vercel project, retain the detected **pnpm** package manager, and allow the included build command to run. Do not manually change the output directory, rewrites, headers, or API function settings in a way that contradicts `vercel.json`.

Before the first deployment, set the following values in **Vercel Project Settings → Environment Variables** for Production and Preview. Values are deliberately not included in the repository.

| Variable | Required for | Secure configuration guidance |
|---|---|---|
| `DATABASE_URL` | Product checker, news, request limits, dashboard | Use a TLS-enabled, serverless-friendly MySQL/TiDB connection URL. Restrict the database user to the application schema and required operations only. |
| `JWT_SECRET` | Signed HTTP-only browser sessions and one-way request-control keys | Create a long random secret, keep it server-only, and use a distinct value from all other credentials. |
| `DASHBOARD_OWNER_EMAIL` | Private analytics access | Set exactly to the confirmed owner email: `adegokefaatihat@gmail.com`. |
| `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL` | Existing private-dashboard sign-in flow | Confirm the OAuth application explicitly allows `https://YOUR_VERCEL_DOMAIN/api/oauth/callback` before enabling public dashboard sign-in. |
| `AI_API_BASE_URL`, `AI_API_KEY`, `AI_MODEL` | Islamic Guidance stream and focused-news classification | Use an OpenAI-compatible provider endpoint root, a server-only provider key, and a model identifier supported by that provider. Never use a `VITE_` prefix for the key. |
| `CRON_SECRET` | Daily focused-news refresh | Generate an independent random secret of at least 16 characters. Vercel sends it in the scheduled request’s bearer authorization header. |
| `VITE_DEPLOYMENT_TARGET` | Portable media URLs at client build time | `vercel.json` now sets this automatically to `vercel`; keep it non-secret and do not override it. |

> The managed platform’s injected `BUILT_IN_FORGE_*`, analytics, OAuth, and storage credentials are not portable secrets. They must **not** be copied into GitHub or Vercel. The Vercel export substitutes a self-contained static media bundle and accepts an independently configured OpenAI-compatible provider for guidance. If the existing OAuth provider cannot allow the new Vercel callback URL, the public website and product checker still work, but the private dashboard remains unavailable until a compatible sign-in provider is configured.

After a Vercel Preview deployment, test `/`, `/directory`, `/assistant`, `/about`, `/privacy`, `/terms`, and `/dashboard`; submit one product check; test the guidance stream; verify the security headers; and confirm the scheduled job appears under **Settings → Cron Jobs**. Promote only after those checks pass. The configured daily `08:00 UTC` refresh is suitable for Vercel’s once-daily Hobby restriction; plans with more frequent cron capacity can adjust the schedule in `vercel.json` and redeploy.

## Sources

1. [Vercel: Express on Vercel](https://vercel.com/docs/frameworks/backend/express)
2. [Vercel: Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite)
3. [Vercel: Rewrites](https://vercel.com/docs/routing/rewrites)
4. [Vercel: Managing Cron Jobs](https://vercel.com/docs/cron-jobs/manage-cron-jobs)
