# Roadmap: Stordalen Skytterlag PWA

## Overview

Four phases modernize a working range-day PWA: strip dead code and upgrade the dependency chain in order (Phase 1), migrate GraphQL to server-side loaders and eliminate tech debt (Phase 2), redesign the UI for outdoor one-handed use (Phase 3), then add loading polish and service worker housekeeping (Phase 4). Each phase ships a working, improved app.

## Phases

- [ ] **Phase 1: Cleanup & Dependencies** - Remove dead code, upgrade deps in mandatory sequence
- [ ] **Phase 2: Security & Tech Debt** - Server-side GraphQL, rune migration, error handling
- [ ] **Phase 3: UX Redesign** - Bottom tabs, outdoor palette, solid badges, sticky headers
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
**Plans**: TBD

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
**Plans**: TBD
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
**Plans**: TBD
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
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Cleanup & Dependencies | 0/TBD | Not started | - |
| 2. Security & Tech Debt | 0/TBD | Not started | - |
| 3. UX Redesign | 0/TBD | Not started | - |
| 4. Polish | 0/TBD | Not started | - |
