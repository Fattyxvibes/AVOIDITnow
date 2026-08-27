# Dashboard Privacy and Data-Minimisation Audit

## Search flow

The public product checker submits a query only after a visitor accepts the existing policy acknowledgement. The client sends the submitted query to the `platform.productCheck` procedure. This is the appropriate point to record a minimised analytics event.

## Existing data model

The current schema has no product-search event table. It includes optional account, community, donation, and audit-log tables, but no searcher identity is needed for the requested dashboard.

## Proposed analytics model

Store only a normalised product-query phrase and a UTC timestamp. Do not store IP address, cookie identifier, device data, user ID, session ID, email, or raw request metadata in the new search-event table. The dashboard will aggregate these events by selected date range.

## Access model

Expose `/dashboard` without a public navigation link. Enforce access in the server procedure by requiring a signed-in user whose email exactly equals `aderokefati@gmail.com`; client-side routing alone is not sufficient.

## Backend implementation findings

The public checker reads from `platform.productCheck`, backed by `checkDatabaseProduct`. The event recording can occur in this public product-check procedure after normalising and validating the search phrase. The main application router currently exposes `platformRouter` and does not yet define an owner-only procedure, so a dedicated dashboard router will be added with explicit user-email verification.

## Query design

The date-range dashboard can use UTC `createdAt` boundaries and database aggregation by normalised query. It will return total searches, unique query count, daily search totals, and ranked query lists. It will return an empty state rather than fabricated data until real visitor searches are recorded.

## Dashboard UI findings

The supplied `DashboardLayout` provides a responsive internal sidebar, sign-in prompt, account menu, and mobile header. It will be reused with a single unlinked “Search analytics” item at `/dashboard`. The private dashboard page will perform its own owner-email check and handle unauthorised and loading states, while the server is the final access-control boundary.

## Route and policy findings

`/dashboard` is not currently registered and can be added without modifying the public navigation. The current Privacy Policy includes account, community, donation, Data Protection Officer, and broad technical-data language. The revision will remove the Data Protection Officer table row, remove public-registration/account and community statements, and describe the new search analytics accurately as a normalised product-search term and timestamp without searcher identity, IP address, device identifier, email, account ID, or session ID.

## Access correction

The owner has corrected the permitted sign-in address to `adaugo.fatigba@gmail.com`. The dashboard gate will use this address alone and will remove the previous project-owner and admin-role fallback paths, so no other Gmail address can receive analytics access.

## Export refinement

The owner has corrected the permitted sign-in address again to `adegokefaatihat@gmail.com`. The dashboard will export a CSV for the currently selected date range only, with aggregate normalised product terms and counts. It will not export raw event timestamps or any visitor-identity field, because those are not recorded by the analytics model.

## Privacy-policy implication

Remove the Data Protection Officer row and reduce the policy’s public-checker language. Retain disclosures that remain accurate for contact emails, voluntary Islamic-guidance prompts, necessary security/technical operation, and the new aggregate product-search analytics.
