---
phase: 01-cleanup-dependencies
plan: "01"
subsystem: core
tags: [cleanup, constants, dead-code, pwa, formatters]
dependency_graph:
  requires: []
  provides: [DEFAULT_CLUB_ID constant, lean layout, trimmed formatters, slim pwa, dynamic external link year]
  affects: [src/routes/+page.ts, src/routes/skyttere/+page.ts, src/routes/premieliste/+page.ts, src/routes/+layout.svelte, src/lib/utils/formatters.ts, src/lib/pwa.ts, src/lib/components/ShooterExternalLink.svelte]
tech_stack:
  added: []
  removed: ['@sveltestack/svelte-query']
  patterns: [constants module for shared literals]
key_files:
  created:
    - src/lib/constants.ts
  modified:
    - src/routes/+page.ts
    - src/routes/skyttere/+page.ts
    - src/routes/premieliste/+page.ts
    - src/routes/+layout.svelte
    - src/lib/utils/formatters.ts
    - src/lib/pwa.ts
    - src/lib/components/ShooterExternalLink.svelte
    - package.json
    - yarn.lock
decisions:
  - "Add export {} to pwa.ts to keep TypeScript treating it as a module after all named exports removed"
metrics:
  duration: ~10 minutes
  completed: 2026-05-17
  tasks_completed: 3
  files_changed: 9
---

# Phase 1 Plan 01: Cleanup & Dead Code Removal Summary

**One-liner:** Dead-code removal — centralized club ID constant, @sveltestack/svelte-query excised, deprecated locale formatters deleted, pwa.ts trimmed to SW-only, ShooterExternalLink year made dynamic.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create DEFAULT_CLUB_ID constant, migrate loaders | `7e8e7cd` | constants.ts (new), +page.ts x3 |
| 2 | Remove @sveltestack/svelte-query | `00cb030` | +layout.svelte, package.json, yarn.lock |
| 3 | Delete deprecated formatters, slim pwa.ts, dynamic year | `e45ddea` | formatters.ts, pwa.ts, ShooterExternalLink.svelte |

## What Was Built

**Task 1 — DEFAULT_CLUB_ID constant**
`src/lib/constants.ts` exports `DEFAULT_CLUB_ID = '10782'`. All three loaders (`+page.ts`, `skyttere/+page.ts`, `premieliste/+page.ts`) import and use it. Hardcoded literal `'10782'` now appears in exactly one place.

**Task 2 — Remove @sveltestack/svelte-query**
Removed `QueryClient`/`QueryClientProvider` import and instantiation from layout. Unwrapped `QueryClientProvider` from around `{@render children?.()}`. Ran `yarn remove @sveltestack/svelte-query` — package.json and lockfile updated atomically. No traces remain in `src/`, `package.json`, or `yarn.lock`.

**Task 3 — Deprecated formatters, slim pwa.ts, dynamic year**
Deleted `formatNorwegianDateLocal` and `formatNorwegianTimeLocale` (plus their JSDoc blocks) from formatters.ts. Retained `parseAsLocalTime`, `formatNorwegianDate`, `formatNorwegianTime`, `getDateLabel`. Trimmed `pwa.ts` to SW registration block only — removed `deferredPrompt`, `beforeinstallprompt` listener, `appinstalled` listener, and `export { deferredPrompt }` (InstallPrompt.svelte owns this logic). Added `export {}` to keep pwa.ts treated as a TypeScript module. Updated `ShooterExternalLink.svelte` to compute `const year = new Date().getFullYear()` and use `{year}.lsres.no` in the href.

## Verification

- `yarn run check` — 0 errors, 0 warnings
- `yarn build` — clean build, 302 modules transformed
- `grep -rln "'10782'" src/` — returns only `src/lib/constants.ts`
- `grep -r "svelte-query" src/ package.json yarn.lock` — no matches
- `grep "formatNorwegianDateLocal\|formatNorwegianTimeLocale" src/lib/utils/formatters.ts` — no matches
- `grep "beforeinstallprompt\|appinstalled" src/lib/pwa.ts` — no matches
- `grep "2025.lsres.no" src/` — no matches

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added `export {}` to pwa.ts to make it a TypeScript module**
- **Found during:** Task 3 verification (`yarn run check`)
- **Issue:** After removing `export { deferredPrompt }`, pwa.ts had no exports. TypeScript treats files without exports as global scripts, not modules. `import('$lib/pwa')` in +layout.svelte failed with "File is not a module".
- **Fix:** Added `export {}` at end of pwa.ts to signal ES module intent without exporting anything.
- **Files modified:** `src/lib/pwa.ts`
- **Commit:** `e45ddea`

## Known Stubs

None. All data flows wired.

## Threat Flags

None. No new network endpoints, auth paths, file access patterns, or schema changes introduced.

## Self-Check: PASSED

- `src/lib/constants.ts` exists and exports DEFAULT_CLUB_ID
- Commits `7e8e7cd`, `00cb030`, `e45ddea` all present in git log
- `yarn run check` exits 0
- `yarn build` exits 0
