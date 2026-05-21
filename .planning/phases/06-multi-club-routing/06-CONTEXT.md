# Phase 6: Multi-Club Routing - Context

**Gathered:** 2026-05-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement subdomain-based multi-club routing: `clubs.ts` static config map, host-header resolution in all three server loaders, dynamic club name + logo in layout top bar, Norwegian 404 for unknown subdomains, and full retirement of the `?c=` query param.

</domain>

<decisions>
## Implementation Decisions

### Dev Environment Fallback
- **D-01:** In local development (when host is `localhost` or `127.0.0.1`), resolve the club from the `VITE_DEV_CLUB` environment variable (set in `.env.local`). Example: `VITE_DEV_CLUB=stordalen`.
- **D-02:** If `VITE_DEV_CLUB` is not set in development, throw a clear error — do NOT silently fall back to a default club. Developers must explicitly configure which club to test with.

### Club Logo Storage
- **D-03:** Club logos live in `static/clubs/{slug}.jpg`. The `logoPath` field in `clubs.ts` is a public URL path: `/clubs/stordalen.jpg`. No build-time import required.
- **D-04:** The existing `src/lib/assets/stordalen.jpg` moves to `static/clubs/stordalen.jpg` as part of this phase. All imports of `stordalenLogo` in layout/error/splash are replaced with the clubs.ts-resolved path.

### Unknown Subdomain Handling
- **D-05:** Unknown or unconfigured subdomains throw `error(404, 'Siden finnes ikke')` in `+layout.server.ts`. This renders the existing `+error.svelte` — no new error page needed.
- **D-06:** Error message is Norwegian: "Siden finnes ikke" (generic 404 copy).

### clubs.ts Initial Content
- **D-07:** Stordalen's subdomain key is `stordalen`. Full entry:
  ```ts
  stordalen: { clubId: '10782', name: 'Stordalen Skytterlag', logoPath: '/clubs/stordalen.jpg' }
  ```
- **D-08:** Display name in top bar and alt text: **"Stordalen Skytterlag"** (official name; layout shows logo image, name is used for alt and any text rendering).

### Club Data Flow to Layout
- **D-09:** A new `+layout.server.ts` resolves the club from the host header (or `VITE_DEV_CLUB` in dev) and returns `{ club }` to the layout. The layout `data` prop receives `club: { clubId, name, logoPath }`.
- **D-10:** The three page server loaders (`+page.server.ts`, `skyttere/+page.server.ts`, `premieliste/+page.server.ts`) receive `clubId` from the layout's parent data via `event.locals` or re-read the host header directly. Researcher/planner decides the cleanest mechanism (locals vs. per-loader resolution).

### ?c= Param Retirement
- **D-11:** `url.searchParams.get('c')` is removed from all three loaders entirely. `DEFAULT_CLUB_ID` constant is no longer used in loaders (may be deleted or kept only for `VITE_DEV_CLUB` fallback resolution if needed).

### Claude's Discretion
- How `clubId` flows from layout to page loaders — via `event.locals` (set in `hooks.server.ts`) vs. re-resolving per loader. Either is valid; researcher/planner picks the idiomatic SvelteKit approach.
- Whether a `hooks.server.ts` is introduced to set `locals.club` once for all routes, or each loader independently resolves from host.
- Exact TypeScript type for the `clubs` map in `clubs.ts`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — CLUB-01, CLUB-02, ROUTE-01, ROUTE-02, ROUTE-03

### Existing Server Loaders (all three must be updated)
- `src/routes/+page.server.ts` — schedule loader, currently uses `?c=` param
- `src/routes/skyttere/+page.server.ts` — shooters loader, same pattern
- `src/routes/premieliste/+page.server.ts` — premieliste loader, same pattern

### Existing Layout (must receive dynamic club data)
- `src/routes/+layout.svelte` — currently hardcodes `stordalenLogo`; needs `data.club` prop

### Existing Infrastructure
- `src/lib/server/graphql/client.ts` — GraphQL client (server-only, uses `AUTH_TOKEN`)
- `src/lib/server/graphql/queries.ts` — query functions (server-only)
- `src/lib/constants.ts` — `DEFAULT_CLUB_ID = '10782'` (review for retirement)
- `src/routes/+error.svelte` — existing error page (reused for unknown subdomain 404)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/routes/+error.svelte`: existing error page renders Norwegian error messages — reused for unknown subdomain 404 via `error(404, 'Siden finnes ikke')`
- Three server loaders share identical `url.searchParams.get('c') || DEFAULT_CLUB_ID` pattern — uniform replacement

### Established Patterns
- All data fetching is in `+page.server.ts` files (server-only) — club resolution follows the same server-only pattern
- `$env/static/private` for secret env vars (AUTH_TOKEN) — `VITE_DEV_CLUB` is public (prefixed `VITE_`) and accessed via `import.meta.env.VITE_DEV_CLUB` or `$env/static/public`
- SvelteKit `error()` helper already used (implied by existing +error.svelte)

### Integration Points
- New `src/routes/+layout.server.ts` — resolves club, passes `{ club }` down to all routes
- New `src/lib/clubs.ts` — single source of truth for club config
- `static/clubs/` — new directory for club logo files
- Possible `src/hooks.server.ts` — if club resolution is centralized in locals

</code_context>

<specifics>
## Specific Ideas

- `VITE_DEV_CLUB` is the exact env var name for dev club override
- `static/clubs/{slug}.jpg` is the exact logo path pattern
- Subdomain key for Stordalen is `stordalen` (not `stordalen-skytterlag`)
- clubs.ts Stordalen entry: `{ clubId: '10782', name: 'Stordalen Skytterlag', logoPath: '/clubs/stordalen.jpg' }`
- 404 Norwegian copy: "Siden finnes ikke"

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 6-multi-club-routing*
*Context gathered: 2026-05-21*
