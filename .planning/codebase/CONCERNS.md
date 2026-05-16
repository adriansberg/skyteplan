# Codebase Concerns

**Analysis Date:** 2026-05-17

## Overview

Small SvelteKit PWA (3 routes, ~10 source files). Codebase is lean and mostly clean. Primary concerns are: auth token exposed to client bundle via VITE_ prefix, hardcoded domain strings scattered across multiple files, mixed Svelte 4/5 API patterns, an unused dependency, and N+1 API call pattern on the premieliste route. No tests exist.

---

## Tech Debt

### High

**Hardcoded default club ID in all three load functions:**
- Issue: `'10782'` repeated in `src/routes/+page.ts:6`, `src/routes/skyttere/+page.ts:6`, `src/routes/premieliste/+page.ts:6`. Change requires editing three files.
- Impact: Breaking if club changes; inconsistency risk if only some are updated.
- Fix: Extract to a shared constant in `src/lib/graphql/client.ts` or a new `src/lib/constants.ts`.

**Hardcoded date range in GraphQL query:**
- Issue: `fromDate: "2017-01-01"` and `toDate: "2030-12-31"` hard-coded in `src/lib/graphql/queries.ts:17-18`. Query will silently stop including future events after 2030.
- Impact: Silent data truncation after the hard-coded toDate.
- Fix: Make dates dynamic (current year ± N) or move to env config.

**Hardcoded API result limit:**
- Issue: `limit: 100` in `src/lib/graphql/queries.ts:16`. Will silently drop shooters if club exceeds 100 members.
- Impact: Invisible data loss for larger clubs.
- Fix: Paginate or raise + document the cap.

**Year-hardcoded external link:**
- Issue: `https://2025.lsres.no/search/` in `src/lib/components/ShooterExternalLink.svelte:11`. Will break in 2026.
- Impact: All external shooter profile links return 404 after season rollover.
- Fix: Make URL configurable via env var or derive year from `new Date().getFullYear()`.

### Medium

**Mixed Svelte 4 / Svelte 5 API:**
- Issue: `premieliste/+page.svelte` uses Svelte 5 runes (`$props()`, `$derived`). `+page.svelte` and `skyttere/+page.svelte` use Svelte 4 `export let data` and `$:` reactive declarations. `Splash.svelte` uses `export let show`.
- Files: `src/routes/premieliste/+page.svelte`, `src/routes/+page.svelte`, `src/routes/skyttere/+page.svelte`, `src/lib/components/Splash.svelte`
- Impact: Inconsistent mental model; Svelte 5 compat layer adds runtime overhead; future Svelte upgrades may break the legacy files.
- Fix: Migrate all components to Svelte 5 runes (`$props`, `$state`, `$derived`).

**Deprecated formatter functions still present:**
- Issue: `formatNorwegianDateLocal` and `formatNorwegianTimeLocale` are marked `@deprecated` in `src/lib/utils/formatters.ts:35,61` but never removed.
- Impact: Future contributors may use them; dead code adds noise.
- Fix: Delete both functions; no callers exist in source.

**Duplicated domain logic across pages:**
- Issue: Event grouping / Felt sub-event collapsing logic is implemented inline in `src/routes/+page.svelte:43-134`. The same `event.name !== 'Felt'` guard and `SUB_SERIES` check appear verbatim in `src/routes/skyttere/+page.svelte` (lines 188, 227, 239, 308, 322).
- Impact: Bug fixes must be applied in multiple places.
- Fix: Extract to a helper in `src/lib/utils/helpers.ts`.

**`@sveltestack/svelte-query` imported but unused:**
- Issue: `QueryClient` and `QueryClientProvider` are imported and rendered in `src/routes/+layout.svelte:4,11,69-71`. No route uses `useQuery`. The library wraps all children for no benefit.
- Impact: Adds bundle weight (~15 KB); creates false impression of query caching.
- Fix: Remove import, dependency, and the `<QueryClientProvider>` wrapper. Remove `@sveltestack/svelte-query` from `package.json`.

### Low

**`src/lib/pwa.ts` duplicates install-prompt logic:**
- Issue: `src/lib/pwa.ts` captures `beforeinstallprompt` and stores `deferredPrompt`, but `src/lib/components/InstallPrompt.svelte` independently captures the same event. Both run on load.
- Impact: Two competing listeners; `pwa.ts` export is never consumed.
- Fix: Delete `src/lib/pwa.ts`; keep all logic in `InstallPrompt.svelte`.

**Magic numbers in scroll/timing logic:**
- Issue: `300`, `100` (ms delay), `THREE_HOURS_IN_MS`, `EIGHT_HOURS_IN_MS` thresholds in `src/lib/utils/helpers.ts:41-42` and `src/routes/+page.svelte:150,155` are without external documentation.
- Impact: Business-logic thresholds are invisible to non-domain readers.
- Fix: Add inline comment explaining the shooting-session duration assumption.

---

## Security Concerns

**Auth token exposed in client-side bundle:**
- Risk: `VITE_AUTH_TOKEN` is read in `src/lib/graphql/client.ts:8`. Any env var prefixed `VITE_` is inlined into the client JavaScript bundle at build time and visible to anyone who inspects the page source or network tab.
- Files: `src/lib/graphql/client.ts`
- Current mitigation: None. Token is visible in built JS.
- Recommendation: Move the GraphQL call to a SvelteKit server route (`+server.ts`) or server-only load function (`+page.server.ts`). Use `$env/static/private` (not `import.meta.env.VITE_*`) so the token never reaches the browser.

**No input validation on `c` query parameter:**
- Risk: `url.searchParams.get('c')` is passed directly to the GraphQL query as `clubId` in all three load files. No format validation or sanitisation.
- Files: `src/routes/+page.ts:6`, `src/routes/skyttere/+page.ts:6`, `src/routes/premieliste/+page.ts:6`
- Current mitigation: GraphQL server likely rejects invalid IDs, but error surfaces as a generic "Unknown error" to the UI.
- Recommendation: Validate `clubId` matches expected format (e.g., `/^\d+$/`) before sending.

**External link uses year-scoped subdomain:**
- Risk: `https://2025.lsres.no` will break yearly; no `rel="noopener noreferrer"` missing (actually it is present). Low security impact, high UX impact — see Tech Debt above.

---

## Performance Risks

**N+1 API call pattern on premieliste route:**
- Problem: `getShootersWithDistinctions` in `src/lib/graphql/queries.ts:85-119` first fetches all club shooters (1 request), then fires one `getShooter` request per shooter in parallel via `Promise.all`. For 100 shooters this is 101 HTTP requests per page load.
- Files: `src/lib/graphql/queries.ts:85-119`, `src/routes/premieliste/+page.ts:8`
- Cause: API does not support bulk distinction lookup; parallel mitigation is applied but the total request count is still O(N).
- Improvement: Request server-side batching from the API owner, or cache results in a server route with a TTL.

**Heavy inline reactive computation in `+page.svelte`:**
- Problem: Event grouping runs inside a `$:` block on every reactive update (`src/routes/+page.svelte:43-134`). Involves nested loops, `Set` operations, `Array.sort`, and `Array.find` on the full shooter × events Cartesian product.
- Files: `src/routes/+page.svelte:43-134`
- Cause: No memoisation; any reactive dependency change re-runs the full algorithm.
- Improvement: Move to a derived store or extract to a memoised function.

**Service worker caches API responses without TTL:**
- Problem: `static/sw.js:60-79` caches all responses from `leonls.kongsberg-ts.no` indefinitely in `dynamic-stordalen-v2`. Stale results are served until a cache name version bump.
- Impact: Users may see hours-old shooting results without realising it.
- Improvement: Set `Cache-Control` max-age or implement timestamp-based cache invalidation in the SW.

---

## Missing Error Handling

**`premieliste/+page.ts` silently returns empty array on error:**
- File: `src/routes/premieliste/+page.ts:14-18`
- Problem: Catch block returns `{ shootersWithDistinctions: [], clubId }` with no `error` field. The page renders "Ingen premier funnet" — indistinguishable from a real empty state.
- Fix: Return an `error` field and display it in the template, matching the pattern in `+page.ts` and `skyttere/+page.ts`.

**Per-shooter distinction fetch silently drops failures:**
- File: `src/lib/graphql/queries.ts:103-106`
- Problem: `console.warn` is the only signal when an individual shooter's distinction fetch fails. The shooter is silently omitted from the premieliste.
- Fix: Collect failed IDs and surface them (or retry) rather than silently dropping.

**`installApp` has no try/catch:**
- File: `src/lib/components/InstallPrompt.svelte:31-46`
- Problem: `(deferredPrompt as any).prompt()` call has no error handling. A thrown error would be an unhandled rejection.
- Fix: Wrap in try/catch.

**`pwa.ts` service worker registration failure is only `console.log`:**
- File: `src/lib/pwa.ts:10`
- Problem: SW registration failure is logged with `console.log` (not `console.error`). No user feedback.
- Fix: Use `console.error`; consider surfacing to a toast or silent analytics event.

---

## TODOs & FIXMEs

No explicit `TODO`, `FIXME`, `HACK`, or `XXX` comments found in `src/`.

Implicit deferred work noted in code comments:
- `src/routes/premieliste/+page.svelte:103-104` — "Denne funksjonen vil vise skyttere med premier når data blir tilgjengelig" (placeholder text left in empty-state UI even though data does load).

---

## Architectural Risks

**`VITE_AUTH_TOKEN` exposes credentials client-side (also listed under Security):**
- The entire data-fetching architecture assumes server-side execution but runs client-side due to `Load` (not `PageServerLoad`) being used in all route load files. All GraphQL requests originate from the browser with the auth token visible.
- Files: `src/routes/+page.ts`, `src/routes/skyttere/+page.ts`, `src/routes/premieliste/+page.ts`, `src/lib/graphql/client.ts`
- Fix: Convert to `+page.server.ts` with `$env/static/private`.

**No error boundary / `+error.svelte`:**
- `app.d.ts` has all App interfaces commented out. No `+error.svelte` exists. SvelteKit's default error page will render for any unhandled load error.
- Fix: Add `src/routes/+error.svelte` with a Norwegian-language message.

**Service worker version is a static string:**
- `CACHE_NAME = 'stordalen-v2'` in `static/sw.js:1`. Must be manually bumped for cache busting after every deploy. Forgetting = users get stale assets.
- Fix: Inject cache version from build (e.g., git hash) via Vite's `define` option.

**`$sveltestack/svelte-query` is an unmaintained package:**
- Last publish: 2021. Targets Svelte 3 / early Svelte 4. Running on Svelte 5 via compat layer.
- Risk: No security patches; API drift with Svelte 5 internals may cause silent bugs.
- Fix: Remove entirely (it is unused — see Tech Debt above).

---

## Recommended Priorities

| Priority | Action | File(s) |
|----------|--------|---------|
| 1 (Critical) | Move GraphQL calls to server-side load (`+page.server.ts`), use `$env/static/private` | `src/routes/*/+page.ts`, `src/lib/graphql/client.ts` |
| 2 (High) | Fix year-hardcoded lsres.no URL before 2026 season | `src/lib/components/ShooterExternalLink.svelte` |
| 3 (High) | Extract default club ID to shared constant | `src/routes/*/+page.ts` |
| 4 (Medium) | Remove unused `@sveltestack/svelte-query` | `src/routes/+layout.svelte`, `package.json` |
| 5 (Medium) | Migrate Svelte 4 components to Svelte 5 runes | `src/routes/+page.svelte`, `src/routes/skyttere/+page.svelte`, `src/lib/components/Splash.svelte` |
| 6 (Medium) | Fix premieliste error handling (return error field) | `src/routes/premieliste/+page.ts` |
| 7 (Medium) | Delete `src/lib/pwa.ts` (duplicate of InstallPrompt logic) | `src/lib/pwa.ts` |
| 8 (Low) | Add `src/routes/+error.svelte` | — |
| 9 (Low) | Delete deprecated formatter functions | `src/lib/utils/formatters.ts` |
| 10 (Low) | Extract duplicated Felt-grouping logic to `src/lib/utils/helpers.ts` | `src/routes/+page.svelte`, `src/routes/skyttere/+page.svelte` |

---

*Concerns audit: 2026-05-17*
