# AVOIDITnow Launch Security Hardening Assessment

**Prepared:** 26 August 2026  
**Scope:** Public product checker, source-linked news, Islamic-guidance assistant, Volunteer Portal, private analytics dashboard, server, database, and AI-assisted development workflow.

## Executive conclusion

AVOIDITnow's original Excel workbook is **not the live public database**. It has been imported into server-side MySQL/TiDB tables. The browser does not receive the raw workbook or database credentials. This is the correct foundation. However, no public website can guarantee that “hackers will never access anything.” The practical goal is **defence in depth**: make unauthorised access difficult, limit what a compromised component can do, detect unusual activity early, and be able to recover safely.

The verified boycott information is deliberately used to answer public searches, so it cannot be treated as a secret in the same way as passwords, database credentials, or private analytics. The most important protection is therefore the **integrity** of the source data: only authorised maintainers may change it, imports must be reviewed, and backups must make restoration possible.

> **Launch decision:** The dependency, shared rate-limit, and request-size actions below were verified on 27 August 2026. Do not treat the codebase as fully hardened until the remaining production-session, backup/restore, provider-access, edge/WAF, monitoring, and security-header work has also been completed.

## What the current code already does well

| Area | Current position observed in the code review | Why it helps |
|---|---|---|
| Product source data | The raw workbook is represented in server-side tables; the public checker returns a limited matching result rather than exposing a database login or raw file. | A visitor cannot download database credentials or connect to the database from the browser. |
| Query handling | tRPC uses Zod schemas with length/type checks, and Drizzle query-builder calls rather than string-built SQL in the reviewed product-search path. | This is a strong starting control against malformed input and common injection mistakes. OWASP recommends strict server-side validation and constrained inputs. [5] |
| Authentication | Signed session tokens are verified on the server, and normal login sessions use `httpOnly` cookies. The OAuth callback validates a one-time state value. | `httpOnly` cookies are less exposed to page JavaScript than tokens deliberately stored in browser storage. |
| Dashboard authorisation | `/dashboard` analytics and export procedures are checked on the server against one approved email address. | A hidden route alone is not security; the server-side check is the important part. OWASP recommends deny-by-default and validating authorisation on every request. [4] |
| Sensitive service credentials | Database and Forge/API credentials are read from server environment variables instead of being embedded in public React code. | Secrets should be centrally managed, scoped, audited, and rotated rather than committed to source code. [2] |
| Search analytics | The dashboard stores only normalised product-query text and timestamps, without an account ID, email, IP address, session identifier, or device identifier. | This reduces privacy impact while allowing aggregate reporting. |
| Scheduled refresh route | The news-refresh route verifies a cron identity and recognised task before refreshing. | This is materially safer than leaving a public “refresh now” endpoint. |

## Important gaps to close before public launch

The following are **observed code-level gaps or verification gaps**, not evidence of a successful intrusion. They are ordered by the practical risk they create for this application.

| Priority | Gap and risk | Recommended resolution |
|---|---|---|
| **Resolved 27 August** | The production dependency audit run on 26 August reported **1 critical, 21 high, 49 moderate, and 10 low** findings. | Reviewed direct and transitive upgrades, including tRPC, AWS SDK, Express, Drizzle, Axios, Streamdown, Nano ID, and Recharts, now produce **0 critical, 0 high, 0 moderate, and 0 low** findings in `pnpm audit --prod`. Type checking, 63 automated tests, and a bounded-memory production build passed. Continue weekly audit review. [3] [6] |
| **Resolved 27 August — edge control still recommended** | Public product checks and the public Islamic-guidance streaming endpoint previously had no application-level rate limit. | The application now applies MySQL-backed, shared fixed-window controls across autoscaled instances: **30 product checks/minute/client** and **5 guidance requests/minute/client**, returning HTTP 429 with `Retry-After`. A short-lived shared lease limits each client to one active guidance stream. Client keys are one-way HMAC values derived from request IPs, not raw addresses. Provider edge/WAF controls remain a recommended independent layer. [7] |
| **Resolved 27 August — further batching/timeouts remain recommended** | Express previously accepted JSON and URL-encoded request bodies up to **50 MB**, although this public app has no public file-upload feature. | The ordinary JSON cap is now **64 KB**, URL-encoded cap is **16 KB**, and the text-only guidance endpoint has a separate **96 KB** JSON cap after its rate check. Oversized bodies receive a generic HTTP 413 response. Add explicit tRPC batch-operation and upstream timeout limits in a future hardening pass. [5] [7] |
| **Resolved 27 August** | A preview compatibility fallback previously read a session token from `sessionStorage` and sent it as a bearer token when cookies were unavailable. | Production builds now use the signed `HttpOnly`, `Secure`, `SameSite=Lax` session cookie only. The browser bearer fallback is development-preview-only. Scheduled callbacks have a separate cron-only authentication path. |
| **P1 — complete before accepting volunteers or donations** | Dashboard authority is hard-coded to a Gmail address. The address has needed several corrections, showing why source-code authorisation is brittle. A single personal account is also a single point of failure. | Move the authorised admin identity into protected environment configuration, verify it on every request, keep an explicit deny-by-default test, and protect that Google/identity-provider account with MFA, recovery methods, and alerting. Do not share that account or dashboard access. When a second trusted administrator is needed, use a documented allow-list and separate named identities. [4] |
| **Resolved 27 August — revocation remains future work** | The normal session configuration used `SameSite=None` and a one-year signed session. | Production now issues seven-day `Secure; HttpOnly; SameSite=Lax` sessions. Add server-side session revocation before adding more privileged administrators or write-sensitive features. [5] |
| **Resolved 27 August — edge/WAF pending** | No production evidence previously existed of a complete application security-header policy. | The server now sets HSTS, an enforced Content Security Policy, `frame-ancestors 'none'`, MIME-sniffing prevention, clickjacking denial, restrictive referrer handling, and a Permissions Policy. No user-configurable independent edge/WAF control is exposed in the managed project configuration, so an external WAF requires an organisation-controlled domain and provider account. [5] |
| **P1** | The product-check implementation reads the reviewed listings and alternatives from the database before filtering matches in application memory. Under high public traffic this creates avoidable database work. | Replace the broad reads with indexed, constrained server-side queries or a reviewed cache of public result data. This improves availability and reduces the impact of scraping or traffic spikes. Keep the cache read-only from the public path. |
| **Resolved 27 August** | A scheduled route previously returned caught error messages to the client. | The route now logs operational detail server-side and returns a generic failure response only. [5] |
| **P0 — provider action pending** | The 27 August effective-grant check shows that the current runtime database credential has global administrative privileges, including the ability to grant access. This is not a least-privilege application identity. The configured connection uses TLS validation, but transport encryption does not reduce the consequences of an over-privileged credential. | The database provider must replace the runtime credential with a dedicated application user restricted to this database and the required `SELECT`, `INSERT`, `UPDATE`, and `DELETE` operations. Schema migrations should use a separate maintainer credential. Do not place either credential in source code, browser code, a report, or chat. [8] |
| **P2** | The public site contains a third-party analytics script placeholder. Third-party scripts can affect privacy and the client-side attack surface. | Maintain an inventory of every browser-side vendor, remove unused scripts, pin/review vendors, use a strict CSP, and update the Privacy/Cookie Policy to match actual operation. |

## Recommended protection architecture

The following model is appropriate for AVOIDITnow. It does **not** require making the public product checker difficult to use.

| Layer | Required control | AVOIDITnow implementation objective |
|---|---|---|
| Edge and transport | Managed HTTPS, DDoS/WAF protection, bot/rate controls, request-size limits. | Protect the public checker and AI endpoint before traffic reaches application code. Block common automated abuse and return 429 for sustained bursts. |
| Application server | Validate every input; allow-list actions; generic public errors; security headers; no direct database endpoint. | Keep tRPC schemas, add global rate-limit middleware, lower body limits, protect AI streaming, and ensure every sensitive operation is server-authorised. |
| Data layer | Private network path, TLS, one least-privilege non-root user, separate production/staging credentials, encrypted backups. | The web browser must never receive `DATABASE_URL` or raw database credentials. The application account should have only the tables and operations it needs. [8] |
| Source-data integrity | Reviewed imports, two-person approval for material boycott-list changes, immutable source links/review dates, rollback copy. | Treat the workbook as an editorial source artifact. Store a dated, access-controlled original and import log; test a rollback before changes go live. |
| Administration | MFA-protected named account, server-side allow-list, short-lived admin sessions, audit records, no shared login. | Keep `/dashboard` unlinked publicly; require identity verification on every request; notify the owner about failed dashboard attempts and admin changes. [4] |
| AI assistant | Per-client limits, capped prompts/history/output, explicit system boundaries, safe Markdown rendering, no privileged tool access. | The current system prompt and message-size caps are positive controls. Do not give the Islamic assistant database-write, shell, deployment, email, or credential access. |
| Monitoring and recovery | Centralised logs, alert thresholds, vulnerability monitoring, tested backup restore, incident runbook. | Alert on unusual search/AI volume, repeated 401/403/429 responses, dashboard access failures, deployment changes, and dependency advisories. [2] [3] |

## AI-assisted (“vibe-coded”) development: the real risk and the solution

AI assistance can produce useful code quickly, but it should not be trusted to decide whether authentication, authorisation, input handling, dependency upgrades, deployment configuration, or database permissions are safe. Common failure modes are insecure defaults, missing server-side checks, copied vulnerable package patterns, hallucinated APIs, unreviewed secrets in prompts, and subtle regressions created by a later “small change.”

OWASP's AI-assisted secure-coding guidance recommends a written workflow, treating repository and web content as untrusted when used as AI context, prohibiting secrets and personal data in prompts, qualified human review of AI-generated code, and automated scanning on changes. [9] NIST similarly frames secure development around preparing the organisation, protecting software, producing well-secured releases, and responding to vulnerabilities. [1]

> **Practical rule:** An AI suggestion is a draft, not a security approval. Never let an AI agent approve, merge, or deploy its own code change. Require a human review for every change and a second, security-aware review for authentication, authorisation, database access, payments, deployment, and secret-management changes. [9]

### A safe workflow for future AVOIDITnow changes

1. Write a short requirement and threat note first: what data is read/written, who is allowed, what happens if the request is abused, and how to roll it back.
2. Never paste `DATABASE_URL`, API keys, session tokens, a full production export, volunteer emails, or private dashboard data into an AI chat or code prompt.
3. Keep `pnpm-lock.yaml` committed and review new dependencies. Prefer fewer, mature packages.
4. Run TypeScript, unit tests, dependency audit, secret scanning, and a security review before publishing.
5. Require a second human review for privileged code and deploy from a protected branch; turn on MFA for the source-control and hosting accounts.
6. Keep a change log, rollback checkpoint, and a tested restore plan. CISA's secure-by-design principle is that the producer, rather than the visitor, carries the responsibility for reducing avoidable risk. [10]

## Launch checklist and work order

| When | Action | Release criterion |
|---|---|---|
| **Immediately** | Remediate or formally assess every critical/high production dependency finding; remove unused dependencies. | `pnpm audit --prod` has no unreviewed critical/high findings, and the tested lockfile is committed. |
| **Immediately** | Add durable rate limiting, request-size caps, upstream timeouts, and a concurrency cap for AI streaming. | Automated bursts return 429 without breaking normal product searches. |
| **Immediately** | Remove or production-gate browser-accessible bearer-token fallback; review cookie flags and session lifetime. | Protected endpoints work with secure cookie sessions and cannot be called with stale/replayed browser tokens. |
| **Before launch** | Apply a tested security-header policy and configure edge/WAF/bot controls and billing/usage alerts. | No unexpected third-party script is allowed; basic clickjacking and MIME protections are active. |
| **Before launch** | Review database provider settings: no public database endpoint, TLS required, least-privilege application account, encrypted backup. | A documented restore test succeeds in a non-production environment. |
| **Before launch** | Move dashboard administrator identity to protected configuration and enable MFA/recovery security on the authorised account. | A non-owner test is denied on every dashboard/export procedure; an owner test succeeds. |
| **Ongoing** | Review vulnerability alerts weekly, patch deliberately, review access monthly, and rehearse incident recovery at least quarterly. | Security log alerts and restore evidence are available when needed. |

## If an incident is suspected

Immediately remove the site from write-sensitive operations, rotate database/API/session secrets, revoke dashboard access, review hosting and source-control logs, preserve evidence, restore from a known-good backup if needed, patch the root cause, and notify affected people where legally required. Do not “quietly” delete logs or overwrite the original source data during investigation.

## Verified remediation record — 27 August 2026

The remediation was deliberately limited to the requested dependency and public-endpoint controls. A fresh production dependency audit reported **0 critical, 0 high, 0 moderate, and 0 low** vulnerabilities across 387 production dependencies. The updated dependency graph, including Recharts 3 compatibility work for the private dashboard chart, passed TypeScript and the bounded-memory production build.

Public checks now use durable database-backed controls rather than process-local memory. The counters and active-stream leases carry only an HMAC-derived client key and short expiry metadata. Expired counters and leases are made unusable automatically and periodically removed; the Privacy Policy reflects this limited abuse-prevention processing. The normal public NIVEA product check, desktop owner dashboard, mobile product checker, and mobile Islamic-guidance page were also reviewed after the change. Automated tests include normal and rate-limited product checks, a duplicate guidance-stream 429 path, opaque key generation, retry timing, and the generic 413 response.

## Follow-up hardening execution — 27 August 2026

The application now sets baseline browser protections on every response: MIME-sniffing prevention, clickjacking denial, restrictive referrer handling, and a Permissions Policy that disables unused browser hardware/payment capabilities. Production builds additionally set HSTS and a restrictive Content Security Policy allowing only the site, the required analytics origin, Google-hosted fonts, and HTTPS-served image/media assets. The server no longer exposes Express identification headers.

Production browser authentication now accepts the signed `HttpOnly`, `Secure`, `SameSite=Lax` cookie only. The old browser `sessionStorage` bearer fallback is compiled only into the development preview. A dedicated cron-authentication path accepts the platform’s scheduled credential shape and still requires a verified cron identity, so the scheduled news refresh remains isolated from browser authentication. Newly issued browser sessions expire after seven days rather than one year.

| Area | Verified status | Remaining action and accountable party |
|---|---|---|
| Independent edge/WAF limit | No user-configurable WAF, CDN, firewall, or edge rate-limit control is exposed in this project’s managed deployment configuration. The public site currently uses the platform-provided `manus.space` address, which is not a domain the project can proxy through an external WAF. Application-level shared rate limits remain active. | To add a truly independent WAF, connect a user-controlled custom domain, delegate its DNS to a chosen WAF/CDN provider, and proxy the domain. Configure a coarse edge rule for `/api/assistant/stream` and `/api/trpc`, then retain the stricter application limits as a second layer. Cloudflare’s documented rate-limiting rules are one example; choose and configure a provider account owned by the organisation rather than by a volunteer. [11] |
| Database least privilege | Source review found no hard-coded connection URI in tracked files; the runtime configuration file holding provider connection details is ignored. The live grant review found a global administrative account, which is unsuitable as a production application identity. | Provider administrator must issue the dedicated restricted application credential, update the managed runtime secret, revoke the broad application credential, and verify the app after rotation. This cannot be safely completed from application code because the managed platform injects the current database connection. |
| Backup and restoration | The application repository has recoverable project checkpoints, but a checkpoint alone does not back up the managed database, uploaded assets, configured secrets, or platform integrations. The website-specific Task Data Backup deadline stated in the August 2026 service guidance was 23 August 2026. | The account owner must check their official in-app notice/email to establish eligibility and whether a Task Data Backup already exists. If one exists, retain every complete export package and use the official one-time restoration flow only after verifying that all current packages are present. Do not assume a backup was created or attempt DNS changes for the short maintenance interval. [12] |

> **Release condition:** The code-level controls in this follow-up are live after checkpoint publication. A provider-level WAF and true database least privilege remain external infrastructure actions, not safeguards that can be honestly simulated in application code. Do not launch a write-sensitive feature such as payments or stored volunteer applications until the restricted runtime database identity and verified recovery plan are in place.

## References

[1]: https://csrc.nist.gov/projects/ssdf "NIST Secure Software Development Framework"
[2]: https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html "OWASP Secrets Management Cheat Sheet"
[3]: https://cheatsheetseries.owasp.org/cheatsheets/Software_Supply_Chain_Security_Cheat_Sheet.html "OWASP Software Supply Chain Security Cheat Sheet"
[4]: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html "OWASP Authorization Cheat Sheet"
[5]: https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html "OWASP REST Security Cheat Sheet"
[6]: https://cheatsheetseries.owasp.org/cheatsheets/Vulnerable_Dependency_Management_Cheat_Sheet.html "OWASP Vulnerable Dependency Management Cheat Sheet"
[7]: https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/ "OWASP API4:2023 Unrestricted Resource Consumption"
[8]: https://cheatsheetseries.owasp.org/cheatsheets/Database_Security_Cheat_Sheet.html "OWASP Database Security Cheat Sheet"
[9]: https://github.com/OWASP/AISVS/blob/main/1.0/en/0x92-Appendix-C_AI_for_Code_Generation.md "OWASP AISVS Appendix C: AI-Assisted Secure Coding"
[10]: https://www.cisa.gov/securebydesign "CISA Secure by Design"
[11]: https://developers.cloudflare.com/waf/rate-limiting-rules/ "Cloudflare WAF Rate Limiting Rules"
[12]: https://help.manus.im/en/articles/16147892-service-change-overview-how-to-back-up-your-data "Manus: How to Back Up Your Data"
