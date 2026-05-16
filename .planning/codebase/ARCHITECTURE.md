<!-- refreshed: 2026-05-17 -->
# Architecture

**Analysis Date:** 2026-05-17

## System Overview

```text
┌──────────────────────────────────────────────────────────────────┐
│                        Browser / PWA                             │
│                    SvelteKit 5 (SSR + CSR)                       │
├──────────────┬───────────────────────┬───────────────────────────┤
│  / (Skyteplan│  /skyttere            │  /premieliste             │
│  schedule)   │  (shooter list)       │  (prize list)             │
│ `routes/+page│  `routes/skyttere/`   │  `routes/premieliste/`    │
└──────┬───────┴──────────┬────────────┴────────────┬──────────────┘
       │                  │                          │
       ▼                  ▼                          ▼
┌──────────────────────────────────────────────────────────────────┐
│                    $lib/graphql/queries.ts                        │
│   getShootersByClub()  |  getShooterWithDistinctions()           │
│   getShootersWithDistinctions()                                  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│              $lib/graphql/client.ts                              │
│        GraphQLClient → leonls.kongsberg-ts.no/api               │
└──────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Root layout | Nav, QueryClientProvider, PWA init | `src/routes/+layout.svelte` |
| Schedule page | Flatten + group shooter events by date, auto-scroll today | `src/routes/+page.svelte` |
| Schedule loader | Fetch shooters by club ID from URL param `?c=` | `src/routes/+page.ts` |
| Shooters page | Per-shooter event list with collapsible detail | `src/routes/skyttere/+page.svelte` |
| Shooters loader | Same fetch as schedule page | `src/routes/skyttere/+page.ts` |
| Premieliste page | Display distinctions per shooter + prize summary | `src/routes/premieliste/+page.svelte` |
| Premieliste loader | Fan-out: fetch all shooters then distinctions in parallel | `src/routes/premieliste/+page.ts` |
| GraphQL client | Singleton client with Bearer auth | `src/lib/graphql/client.ts` |
| GraphQL queries | Three exported async functions | `src/lib/graphql/queries.ts` |
| Types | Domain types: Shot, Series, Event, Shooter, Distinction | `src/lib/graphql/types.ts` |
| Formatters | Norwegian date/time formatting, parseAsLocalTime | `src/lib/utils/formatters.ts` |
| Helpers | Event status logic (completed/ongoing/did_not_start/upcoming) | `src/lib/utils/helpers.ts` |
| EventStatusBadge | Renders status pill from event data | `src/lib/components/EventStatusBadge.svelte` |
| ShooterExternalLink | External link to lsres.no search | `src/lib/components/ShooterExternalLink.svelte` |
| RefreshButton | Calls `invalidateAll()` to re-run load functions | `src/lib/components/RefreshButton.svelte` |
| PullToRefresh | Touch gesture → `invalidateAll()` + SW skip-waiting | `src/lib/components/PullToRefresh.svelte` |
| InstallPrompt | Deferred PWA install banner | `src/lib/components/InstallPrompt.svelte` |
| Splash | Session-scoped splash screen (sessionStorage gate) | `src/lib/components/Splash.svelte` |
| Service worker | Cache-first for static, network-first for API | `static/sw.js` |
| PWA init | Registers SW, handles install lifecycle | `src/lib/pwa.ts` |

## Pattern Overview

**Overall:** SvelteKit file-based routing with server-side load functions feeding page components. No server-side rendering on the API layer — all data fetching happens in `+page.ts` (runs on both server and client, treated as universal loaders).

**Key Characteristics:**
- Each route has a paired `+page.ts` loader that calls GraphQL and returns data to `+page.svelte` via `data` prop
- All three routes share the same club ID resolution: `url.searchParams.get('c') || '10782'`
- `@sveltestack/svelte-query` is mounted in the layout (`QueryClientProvider`) but individual pages use direct `load` functions rather than reactive queries
- Svelte 5 runes (`$state`, `$derived`, `$props`) used in newer components; Svelte 4 reactive syntax (`$:`, `export let`) still present in older pages
- Data refresh: `invalidateAll()` re-runs all active load functions — triggered by RefreshButton and PullToRefresh

## Layers

**Routing / View Layer:**
- Purpose: Page templates, reactive derived state, template logic
- Location: `src/routes/`
- Contains: `+page.svelte`, `+page.ts`, `+layout.svelte`
- Depends on: `$lib` utilities, components, graphql types
- Used by: Browser

**Component Layer:**
- Purpose: Reusable UI pieces with no data fetching
- Location: `src/lib/components/`
- Contains: `.svelte` files accepting props
- Depends on: `$lib/utils/helpers`, `$lib/graphql/types`
- Used by: Route pages

**Data Access Layer:**
- Purpose: All GraphQL queries encapsulated here
- Location: `src/lib/graphql/`
- Contains: `client.ts` (singleton), `queries.ts` (functions), `types.ts` (domain types)
- Depends on: `graphql-request`, `VITE_AUTH_TOKEN` env var
- Used by: `src/routes/*/+page.ts`, `src/lib/index.ts`

**Utilities:**
- Purpose: Pure functions for formatting and business logic
- Location: `src/lib/utils/`
- Contains: `formatters.ts` (date/time), `helpers.ts` (event status)
- Depends on: nothing internal
- Used by: pages, components

**PWA Layer:**
- Purpose: Offline capability and installability
- Location: `static/sw.js`, `src/lib/pwa.ts`
- Contains: service worker (cache strategy), install prompt lifecycle
- Depends on: browser APIs
- Used by: layout (dynamically imports `pwa.ts` on browser)

## Data Flow

### Primary Request Path (Schedule / Shooters)

1. Browser navigates to `/` or `/skyttere`
2. `+page.ts` load function runs — reads `?c=` URL param, defaults to `'10782'` (`src/routes/+page.ts:5`)
3. `getShootersByClub(clubId)` called (`src/lib/graphql/queries.ts:9`)
4. GraphQL client sends POST to `https://leonls.kongsberg-ts.no/api` with `Authorization: Bearer $VITE_AUTH_TOKEN` (`src/lib/graphql/client.ts:6`)
5. Response typed as `Shooter[]` with nested `Event[]` and `Series[]`
6. Data returned to `+page.svelte` as `data.shooters`
7. Schedule page groups events by date, deduplicates Felt + sub-events (`src/routes/+page.svelte:42-133`)
8. Renders per-date sections; auto-scrolls to today's section on mount

### Premieliste Fan-out Path

1. Browser navigates to `/premieliste`
2. `+page.ts` calls `getShootersWithDistinctions(clubId)` (`src/routes/premieliste/+page.ts:8`)
3. `getShootersWithDistinctions` first calls `getShootersByClub` to get all shooter IDs
4. Then fans out `getShooterWithDistinctions(organizationId)` for each shooter in parallel via `Promise.all` (`src/lib/graphql/queries.ts:94`)
5. Filters to shooters with non-empty `distinctions` arrays
6. Page derives prize summary with `$derived` grouped by Gavepremie / Beger / Medalje

### Refresh Path

1. User triggers refresh (RefreshButton click or PullToRefresh gesture)
2. `invalidateAll()` called (`src/lib/components/RefreshButton.svelte:6`, `src/lib/components/PullToRefresh.svelte:66`)
3. SvelteKit re-runs all active `load` functions
4. PullToRefresh also posts `SKIP_WAITING` to service worker to activate any pending SW update

**State Management:**
- No global store. All data flows downward from `load` → `data` prop → component
- `@sveltestack/svelte-query` QueryClient is initialized in layout but not actively used by current pages
- Local component state uses Svelte 5 `$state` runes or Svelte 4 reactive declarations

## Key Abstractions

**Shooter:**
- Purpose: Core domain entity — a person registered in the club
- Examples: `src/lib/graphql/types.ts:27`
- Pattern: Plain TypeScript type; no class or ORM

**Event:**
- Purpose: A shooting session a shooter participates in (Bane, Felt, Finale, etc.)
- Examples: `src/lib/graphql/types.ts:15`
- Pattern: Nested under `Shooter.events[]`; contains `Series[]`

**Event Status:**
- Purpose: Computed state (completed / ongoing / did_not_start / upcoming) from timing + result data
- Implementation: `getEventStatus()` in `src/lib/utils/helpers.ts:48`
- Logic: Compares `checkinDateTime` to `now`, checks for partial/complete results; 3-hour and 8-hour thresholds for DNS detection

**Felt event grouping:**
- Purpose: "Felt" shooting events have sub-disciplines (Minne, Felthurtig, Stang) that share the same time/target/relay — grouped as parent + subEvents on the schedule page
- Implementation: `src/routes/+page.svelte:61-107`
- Pattern: In-memory grouping in `$:` reactive block, keyed by `name+shootingDateTime+targetNumber+relayNumber`

## Entry Points

**App shell:**
- Location: `src/app.html`
- Triggers: Browser load
- Responsibilities: PWA manifest link, iOS meta tags, SvelteKit body injection

**Root layout:**
- Location: `src/routes/+layout.svelte`
- Triggers: All routes
- Responsibilities: Sticky nav, `QueryClientProvider` wrapping, PWA dynamic import, PullToRefresh and InstallPrompt mounting

**`$lib` barrel:**
- Location: `src/lib/index.ts`
- Exports: `getShootersByClub` — the only function exposed via `$lib` import

## Architectural Constraints

- **Rendering:** Universal loaders (`+page.ts`) run on both server (SSR) and client. No `+page.server.ts` used — meaning the GraphQL Bearer token (`VITE_AUTH_TOKEN`) is embedded in the client bundle.
- **Global state:** `graphqlClient` is a module-level singleton (`src/lib/graphql/client.ts:6`). `QueryClient` instantiated once in layout but unused by pages.
- **Parallel data fetching:** Premieliste makes N+1 GraphQL requests (one for club list, then one per shooter). No batching.
- **Timezone:** All datetime strings from API treated as local time by stripping timezone suffix via `parseAsLocalTime()` (`src/lib/utils/formatters.ts:11`).
- **Club ID:** Hardcoded default `'10782'` in every loader. Overridable via `?c=` query param but no UI for this.

## Anti-Patterns

### Mixed Svelte 4 and Svelte 5 syntax

**What happens:** `+page.svelte` (schedule and skyttere) uses `export let data` and `$: shooters = data.shooters` (Svelte 4). `+layout.svelte` and `premieliste/+page.svelte` use `$props()` and `$derived` (Svelte 5).
**Why it's wrong:** Inconsistent API surface; Svelte 4 syntax in Svelte 5 is a compatibility shim that may be removed.
**Do this instead:** Migrate all pages to `let { data } = $props()` and `$derived` as used in `src/routes/premieliste/+page.svelte:6`.

### Auth token exposed to client

**What happens:** `VITE_AUTH_TOKEN` is used in `src/lib/graphql/client.ts` — any `VITE_` prefixed env var is inlined into the client bundle by Vite.
**Why it's wrong:** Token is visible in browser devtools and the compiled JS bundle.
**Do this instead:** Move GraphQL fetching to `+page.server.ts` (server-only load), keeping the token in `$env/static/private` or `$env/dynamic/private`.

### Unused QueryClient

**What happens:** `@sveltestack/svelte-query` `QueryClient` is initialized in `+layout.svelte` and `QueryClientProvider` wraps all children, but no page uses `useQuery`.
**Why it's wrong:** Dead dependency adds bundle weight; the pattern suggests intended but incomplete migration to query-based data fetching.
**Do this instead:** Either adopt `useQuery` in pages for client-side reactive refetching, or remove the dependency entirely.

## Error Handling

**Strategy:** Each `+page.ts` wraps the GraphQL call in try/catch and returns an `error` string alongside null data. Pages render an error box when `data.error` is set.

**Patterns:**
- Errors surface as Norwegian-language messages in red bordered boxes
- `getShootersWithDistinctions` catches per-shooter failures silently with `console.warn` and skips failed shooters rather than failing the whole request
- No global error boundary or SvelteKit `+error.svelte` page

## Cross-Cutting Concerns

**Logging:** `console.error` / `console.warn` only. No structured logging.
**Validation:** None — API responses trusted as matching TypeScript types.
**Authentication:** Single Bearer token for all GraphQL requests; no user authentication.

---

*Architecture analysis: 2026-05-17*
