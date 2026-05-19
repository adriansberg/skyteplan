# Roadmap: Stordalen Skytterlag PWA

## Overview

Four phases modernize a working range-day PWA: strip dead code and upgrade the dependency chain in order (Phase 1), migrate GraphQL to server-side loaders and eliminate tech debt (Phase 2), redesign the UI for outdoor one-handed use (Phase 3), then add loading polish and service worker housekeeping (Phase 4). Each phase ships a working, improved app.

## Phases

- [x] **Phase 1: Cleanup & Dependencies** - Remove dead code, upgrade deps in mandatory sequence
- [x] **Phase 2: Security & Tech Debt** - Server-side GraphQL, rune migration, error handling (completed 2026-05-17)
- [x] **Phase 3: UX Redesign** - Bottom tabs, outdoor palette, solid badges, sticky headers (completed 2026-05-19)
- [ ] **Phase 4: Polish** - Skeleton screens, iOS meta, automated SW cache versioning

## Phase Details

### Phase 1: Cleanup & Dependencies
**Goal**: App builds cleanly on the target dependency stack with all dead code removed
**Mode**: mvp
**Depends on**: Nothing (first phase)
**Requirements**: CLEAN-01, CLEAN-02, CLEAN-03, CLEAN-04, SEC-03, DEPS-01, DEPS-02, DEPS-03, DEPS-04
**Success Criteria** (what must be TRUE):
  1. `yarn build` and `yarn check` pass with zero errors on the updated stack (SvelteKit 2.59, Vite 8, TypeScript 6)
  2. No `@sveltestack/svelte-query` import exists anywhere in the codebase
  3. Club ID `'10782'` appears in exactly one shared constant file; no other file contains the raw string
  4. External lsres.no link URL contains the current year from `new Date().getFullYear()`, not a hardcoded literal
  5. Deprecated formatter functions and duplicate pwa.ts logic are absent from the codebase
**Plans**: 5 plans
Plans:

**Wave 1**
- [x] 01-01-PLAN.md — Cleanup pass: remove svelte-query, deprecated formatters, duplicate pwa.ts logic; centralize club ID constant; apply dynamic year to external link

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 01-02-PLAN.md — DEPS-01: patch/minor bumps (svelte 5.55.7, svelte-check, eslint, prettier, graphql-request, @vercel/analytics)

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 01-03-PLAN.md — DEPS-02: @sveltejs/kit 2.22 → 2.59.1

**Wave 4** *(blocked on Wave 3 completion)*
- [x] 01-04-PLAN.md — DEPS-03: Vite 7→8, vite-plugin-svelte 6→7, adapter-vercel 5→6 (single wave)

**Wave 5** *(blocked on Wave 4 completion)*
- [x] 01-05-PLAN.md — DEPS-04: TypeScript 5 → 6.0.3 (with tsconfig types-array contingency)

**Cross-cutting constraints:**
- `yarn check && yarn build` must pass after every wave — each dep upgrade is independently verified before the next begins

### Phase 2: Security & Tech Debt
**Goal**: Auth token is server-only and all three routes have consistent, rune-based implementations
**Mode**: mvp
**Depends on**: Phase 1
**Requirements**: SEC-01, SEC-02, DEBT-01, DEBT-02, DEBT-03, DEBT-04
**Success Criteria** (what must be TRUE):
  1. `grep -r "AUTH_TOKEN" .svelte-kit/output/client/` returns zero results after `yarn build`
  2. A `?c=` value containing non-digit characters is rejected before reaching the GraphQL query
  3. All three route pages use `$props`, `$derived`, `$state` — no `export let` or `$:` reactive statements remain
  4. The premieliste route returns an `error` field on API failure so the UI can show a distinct error state (not empty results)
  5. An unhandled load failure on any route renders the Norwegian-language `+error.svelte` page, not a blank screen
**Plans**: 3 plans
Plans:

**Wave 1**
- [x] 02-01-PLAN.md — SEC-01 + SEC-02 + DEBT-02: create `$lib/server/graphql/`, rename all three loaders to `+page.server.ts`, validate `?c=` with `/^\d+$/`, add error field to premieliste loader, delete legacy files and barrel export

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 02-02-PLAN.md — DEBT-01 + DEBT-03: extract `groupFeltEvents` to `$lib/utils/helpers`, migrate `+page.svelte`, `skyttere/+page.svelte`, and `Splash.svelte` to Svelte 5 runes (`$props`, `$derived`, `$state`, `$bindable`)
- [x] 02-03-PLAN.md — DEBT-04: create `+error.svelte` with Norwegian message, replicated nav header, conditional `$page.error.message`, and `href="/"` retry link
**UI hint**: yes

### Phase 3: UX Redesign
**Goal**: Users navigate the app via a bottom tab bar and read schedule, shooter, and prize data clearly in bright outdoor light
**Mode**: mvp
**Depends on**: Phase 2
**Requirements**: UX-01, UX-02, UX-03, UX-04
**Success Criteria** (what must be TRUE):
  1. A fixed bottom tab bar with Skyteplan / Skyttere / Premieliste tabs is visible on all three routes, 56px tall with safe-area padding
  2. All data text is minimum `text-base font-semibold`; times and scores use monospace; no gradients or box shadows appear anywhere
  3. Status badges are solid-fill pills: green pulse (Pågår), slate (Ferdig), amber (Kommende), gray (Møtte ikke)
  4. The schedule view has sticky date section headers; today's header shows "I dag"; the page auto-scrolls to today's section on load
**Plans**: 3 plans
Plans:

**Wave 1**
- [x] 03-01-PLAN.md — UX-01: slim 40px top bar (logo + RefreshButton only), new `BottomTabBar.svelte` with three Norwegian text tabs, layout `pb-16` children wrapper
- [x] 03-02-PLAN.md — UX-03: solid-fill `EventStatusBadge` variants with Norwegian labels (Pågår/Ferdig/Kommende/Møtte ikke); ongoing keeps `animate-pulse`

**Wave 2** *(blocked on Wave 1 completion — sticky offset depends on slim top bar height)*
- [x] 03-03-PLAN.md — UX-02 + UX-04: schedule sticky date headers at `top-10`, neutral palette + `font-mono` times/scores + `text-base font-semibold` data across all three route pages; remove shadows/gradients/emoji; Norwegian copy on skyttere page
**UI hint**: yes

### Phase 4: Polish
**Goal**: Initial load shows progress feedback, iOS installability is properly configured, and service worker versioning is automatic
**Mode**: mvp
**Depends on**: Phase 3
**Requirements**: POL-01, POL-02, POL-03
**Success Criteria** (what must be TRUE):
  1. All three routes show skeleton loading screens on initial data load instead of a blank white page
  2. Installed PWA on iOS uses `viewport-fit=cover` and `black-translucent` status bar with no white gap at top or bottom
  3. Each production build generates a unique SW cache name derived from the git hash; the `activate` handler evicts all previous cache versions
**Plans**: 3 plans
Plans:

**Wave 1** *(parallel — no shared files)*
- [x] 04-01-PLAN.md — POL-02: iOS meta tags (viewport-fit=cover, black-translucent, #fafafa theme-color), CSS variable --top-bar-height, top bar safe-area padding, sticky header fix
- [ ] 04-03-PLAN.md — POL-03: rename sw.js → sw.template.js with __CACHE_VERSION__ placeholder; inline Vite plugin injecting git hash at buildStart; .gitignore entry

**Wave 2** *(blocked on 04-01 — both touch +page.svelte)*
- [ ] 04-02-PLAN.md — POL-01: skeleton screens on all three routes using {#if navigating} from $app/state; inline markup per route, no shared component

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Cleanup & Dependencies | 4/5 | In Progress|  |
| 2. Security & Tech Debt | 3/3 | Complete   | 2026-05-17 |
| 3. UX Redesign | 3/3 | Complete   | 2026-05-19 |
| 4. Polish | 1/3 | In Progress|  |
