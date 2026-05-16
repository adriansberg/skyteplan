<!-- refreshed: 2026-05-17 -->
# Codebase Structure

**Analysis Date:** 2026-05-17

## Overview

Small SvelteKit 5 app. All source in `src/`. Three routes, one shared lib. No server-only files. Static assets and service worker in `static/`.

## Directory Layout

```
stordalen/
├── src/
│   ├── app.html                   # HTML shell, PWA manifest link, iOS meta
│   ├── app.css                    # Global styles (Tailwind base imports)
│   ├── app.d.ts                   # SvelteKit ambient type declarations
│   ├── lib/
│   │   ├── index.ts               # $lib barrel — exports getShootersByClub
│   │   ├── pwa.ts                 # Service worker registration + install lifecycle
│   │   ├── assets/
│   │   │   └── stordalen.jpg      # Club logo (used in layout header + splash)
│   │   ├── components/
│   │   │   ├── EventStatusBadge.svelte    # Status pill: completed/ongoing/DNS/upcoming
│   │   │   ├── InstallPrompt.svelte       # PWA install banner (bottom sheet)
│   │   │   ├── PullToRefresh.svelte       # Touch gesture refresh overlay
│   │   │   ├── RefreshButton.svelte       # Header refresh icon button
│   │   │   ├── ShooterExternalLink.svelte # External link icon → lsres.no
│   │   │   └── Splash.svelte             # Session-scoped splash screen
│   │   ├── graphql/
│   │   │   ├── client.ts          # GraphQL singleton client with auth header
│   │   │   ├── queries.ts         # getShootersByClub, getShooterWithDistinctions, getShootersWithDistinctions
│   │   │   └── types.ts           # Shot, Series, Event, Shooter, Distinction, response wrappers
│   │   └── utils/
│   │       ├── formatters.ts      # Norwegian date/time formatting, parseAsLocalTime
│   │       └── helpers.ts         # hasPartialResults, hasAllResults, getEventStatus
│   └── routes/
│       ├── +layout.svelte         # Sticky nav, QueryClientProvider, PWA init, PullToRefresh
│       ├── +page.svelte           # Schedule (Skyteplan) — events grouped by date
│       ├── +page.ts               # Load: getShootersByClub(?c= || '10782')
│       ├── skyttere/
│       │   ├── +page.svelte       # Shooters list with collapsible event detail
│       │   └── +page.ts           # Load: getShootersByClub(?c= || '10782')
│       └── premieliste/
│           ├── +page.svelte       # Prize list + summary by category
│           └── +page.ts           # Load: getShootersWithDistinctions (fan-out)
├── static/
│   ├── sw.js                      # Service worker (cache-first static, network-first API)
│   ├── manifest.json              # PWA manifest
│   ├── favicon.ico
│   ├── stordalen.jpg              # PWA icon source
│   └── robots.txt
├── .planning/
│   └── codebase/                  # GSD map documents
├── package.json
├── svelte.config.js               # adapter-vercel, vitePreprocess
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js
└── .prettierrc
```

## Module Responsibilities

**`src/routes/+layout.svelte`**
Global shell shared by all pages. Renders sticky header nav with active-route highlighting using `$derived(page.url.pathname)`. Wraps children in `QueryClientProvider`. Conditionally imports `$lib/pwa` on browser. Renders `PullToRefresh` and `InstallPrompt` as overlay singletons.

**`src/routes/+page.svelte` (Skyteplan)**
Most complex page. Reactive block flattens `Shooter[].events[]` into a single list, deduplicates Felt sub-events (Minne, Felthurtig, Stang) by grouping them under the parent Felt entry. Sorts by `shootingDateTime`, groups into `Record<dateKey, Event[]>`. Auto-scrolls to today's date section on mount using a Svelte action (`registerTodaySection`).

**`src/routes/skyttere/+page.svelte`**
Renders shooters as collapsible `<details>` elements. Derives next upcoming event and event scores per shooter inline in `{@const}` blocks. Uses Svelte 4 reactive syntax (`$:`, `export let`).

**`src/routes/premieliste/+page.svelte`**
Uses Svelte 5 `$props()` and `$derived`. Derives `prizeSummary` object grouping distinctions into Gavepremie / Beger / Medalje categories by name keyword matching.

**`src/lib/graphql/queries.ts`**
Three exported async functions:
- `getShootersByClub(clubId)` — used by schedule and shooters loaders
- `getShooterWithDistinctions(organizationId)` — single shooter with distinctions
- `getShootersWithDistinctions(clubId)` — club list then parallel fan-out, filters to shooters with distinctions

**`src/lib/graphql/types.ts`**
All domain types. Hierarchy: `Shooter → Event[] → Series[] → Shot[]`. Separate `ShooterWithDistinctions` extends shooter fields with `Distinction[]`. Response wrapper types match the GraphQL query root field names.

**`src/lib/utils/formatters.ts`**
`parseAsLocalTime(dateString)` strips timezone suffix to prevent UTC-shift bugs. `formatNorwegianDate`, `formatNorwegianTime` use locale `nb-NO`. `getDateLabel` returns relative labels ("I dag", "I morgen", "I går") falling back to formatted date.

**`src/lib/utils/helpers.ts`**
`getEventStatus` implements time-based heuristics: all results → completed; >3h since checkin with no results → did_not_start; >8h with partial results → completed; any partial results → ongoing; checkin in past → ongoing; else upcoming.

**`static/sw.js`**
Two-tier cache strategy: API requests (`/api/` path or cross-origin) → network-first with dynamic cache fallback. All other requests → cache-first with background network update. Handles `SKIP_WAITING` message from client. Cache name versioned (`stordalen-v2`).

## File Naming Conventions

**Routes:**
- SvelteKit convention: `+page.svelte` (template), `+page.ts` (universal loader), `+layout.svelte` (shared shell)
- No `+page.server.ts` (no server-only loaders)
- Route directories named in Norwegian (e.g., `skyttere`, `premieliste`)

**Components:**
- PascalCase `.svelte` files: `EventStatusBadge.svelte`, `ShooterExternalLink.svelte`
- Descriptive compound names stating what the component is or does

**Utilities:**
- camelCase `.ts` files: `formatters.ts`, `helpers.ts`, `client.ts`, `queries.ts`, `types.ts`
- Grouped by concern into subdirectories (`graphql/`, `utils/`)

**Assets:**
- Lowercase kebab-case: `stordalen.jpg` in both `src/lib/assets/` (imported in components) and `static/` (served directly for PWA manifest/icons)

## Where to Add New Code

**New route / page:**
- Create `src/routes/<route-name>/+page.svelte` and `src/routes/<route-name>/+page.ts`
- Use Svelte 5 syntax: `let { data } = $props()` and `$derived`
- Read club ID from `url.searchParams.get('c') || '10782'` in loader
- Add nav link to `src/routes/+layout.svelte` with active-state class pattern matching existing links

**New GraphQL query:**
- Add type(s) to `src/lib/graphql/types.ts`
- Add exported async function to `src/lib/graphql/queries.ts` using existing `graphqlClient`
- If needed at `$lib` top level, re-export from `src/lib/index.ts`

**New reusable component:**
- Create `src/lib/components/PascalCaseName.svelte`
- Accept typed props via `let { propName }: Props = $props()` (Svelte 5)
- No data fetching inside components — pass all data as props

**New utility function:**
- Date/time: add to `src/lib/utils/formatters.ts`
- Business logic / event logic: add to `src/lib/utils/helpers.ts`
- New concern category: create `src/lib/utils/<concern>.ts`

**New static file (served at root):**
- Place in `static/` — files here served at `/filename`
- Add to `STATIC_ASSETS` array in `static/sw.js` if it should be offline-cached

## Special Directories

**`.svelte-kit/`:**
- Purpose: SvelteKit generated code (route types, client/server bundles)
- Generated: Yes
- Committed: No

**`.vercel/`:**
- Purpose: Vercel build output (`vite build` writes here via adapter-vercel)
- Generated: Yes
- Committed: No

**`.planning/codebase/`:**
- Purpose: GSD architecture map documents
- Generated: Yes (by GSD map-codebase)
- Committed: Yes

**`static/`:**
- Purpose: Files served verbatim at site root — not processed by Vite
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-05-17*
