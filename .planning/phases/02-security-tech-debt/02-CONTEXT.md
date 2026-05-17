# Phase 2: Security & Tech Debt - Context

**Gathered:** 2026-05-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Move all GraphQL data fetching to server-side loaders (`+page.server.ts`) so the auth token never reaches the browser. Migrate all Svelte 4 syntax to Svelte 5 runes for consistency. Improve error handling: fix premieliste silent failure, extract duplicated Felt grouping logic, and add a styled `+error.svelte` page.

No UI redesign, no new features — this phase repairs architecture and eliminates tech debt.

</domain>

<decisions>
## Implementation Decisions

### Server-Side Migration (SEC-01)
- **D-01:** Create `src/lib/server/graphql/client.ts` as the new server-only GraphQL client. Uses `$env/static/private` to read `AUTH_TOKEN`. SvelteKit enforces server-only by virtue of the `$lib/server/` path — cannot be accidentally imported client-side.
- **D-02:** Move `src/lib/graphql/queries.ts` → `src/lib/server/graphql/queries.ts`. Co-locate with the server client. The existing `src/lib/graphql/` directory retains only `types.ts` (pure types, safe for client import).
- **D-03:** All three route loaders rename from `+page.ts` → `+page.server.ts` and import from the new server paths. Delete the old `+page.ts` files; `+page.server.ts` is the sole source of truth.
- **D-04:** Vercel env var renamed from `VITE_AUTH_TOKEN` to `AUTH_TOKEN`. Document the required rename in a code comment or README note so the deployment step is not missed.

### Error Page (DEBT-04)
- **D-05:** `+error.svelte` uses the full app nav (reuse the sticky nav from `+layout.svelte`) plus an error card — styled to match the rest of the app, not a minimal plain-text page.
- **D-06:** Error text: **"Kunne ikke laste data. Sjekk nettforbindelsen og prøv igjen."** with a retry link. Show SvelteKit's `$page.error.message` in smaller muted text below the main message if available.

### Claude's Discretion
- **SEC-02 validation failure behavior:** If `?c=` fails `/^\d+$/` validation, fall back to `DEFAULT_CLUB_ID` silently. The club-ID switcher has no UI; an invalid param is almost certainly a typo or bot probe — silent fallback is correct for this app.
- **DEBT-01 + DEBT-03 task ordering:** Whether to migrate runes and extract Felt grouping in the same task per page or in separate passes — Claude decides based on what minimises diff complexity.
- **Retry link target in error page:** `window.history.back()` or `href="/"` — Claude picks whichever is more useful in context.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements and Goals
- `.planning/REQUIREMENTS.md` — SEC-01, SEC-02, DEBT-01, DEBT-02, DEBT-03, DEBT-04 definitions and acceptance criteria
- `.planning/ROADMAP.md` — Phase 2 goal and success criteria (5 checkable conditions)

### Files to Migrate (Server-Side)
- `src/lib/graphql/client.ts` — current GraphQL client using `VITE_AUTH_TOKEN`; migrate to `src/lib/server/graphql/client.ts`
- `src/lib/graphql/queries.ts` — current query functions; migrate to `src/lib/server/graphql/queries.ts`
- `src/routes/+page.ts` — universal loader; becomes `+page.server.ts`
- `src/routes/skyttere/+page.ts` — universal loader; becomes `+page.server.ts`
- `src/routes/premieliste/+page.ts` — universal loader; becomes `+page.server.ts` (also fix DEBT-02 error field here)

### Reference Implementations
- `src/routes/premieliste/+page.svelte` — already uses `$props()`, `$derived` — canonical Svelte 5 rune pattern for DEBT-01
- `src/routes/+layout.svelte` — nav bar source; reuse structure in `+error.svelte` (DEBT-04)
- `src/lib/utils/helpers.ts` — target file for extracted `groupFeltEvents()` helper (DEBT-03)

### Types (stays client-safe)
- `src/lib/graphql/types.ts` — pure domain types; stays at `$lib/graphql/types.ts`, no migration needed

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/routes/premieliste/+page.svelte` — Svelte 5 rune reference: `let { data } = $props()`, `$derived(...)` pattern to replicate in the other pages
- Nav markup in `src/routes/+layout.svelte` — copy/adapt sticky nav for `+error.svelte`
- `DEFAULT_CLUB_ID` from `$lib/constants` — already centralized (Phase 1); use in server loaders unchanged

### Established Patterns
- Error pattern in `+page.ts` and `skyttere/+page.ts`: try/catch wraps GraphQL call, returns `{ error: string | null }` — premieliste `+page.server.ts` must match this (DEBT-02)
- `PageServerLoad` from `./$types` replaces `Load` from `@sveltejs/kit` once loaders become server-only
- `$env/static/private` is imported as `import { AUTH_TOKEN } from '$env/static/private'`

### Integration Points
- `src/lib/index.ts` barrel exports `getShootersByClub` — after queries move to `$lib/server/`, this export must move to `src/lib/server/index.ts` or the barrel must be updated (server-only re-export)
- `PullToRefresh` and `RefreshButton` call `invalidateAll()` — this re-runs `+page.server.ts` loaders fine; no changes needed to those components
- `src/lib/graphql/types.ts` stays at current path; both server and client code can import it

</code_context>

<specifics>
## Specific Ideas

- New server GraphQL directory: `src/lib/server/graphql/` (two files: `client.ts`, `queries.ts`)
- Error page message: "Kunne ikke laste data. Sjekk nettforbindelsen og prøv igjen."
- Error page includes a retry link and shows `$page.error.message` in muted small text below

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 2-security-tech-debt*
*Context gathered: 2026-05-18*
