---
phase: 03-ux-redesign
plan: 01
subsystem: ui
tags: [svelte5, tailwind, bottom-nav, layout, pwa]

requires: []
provides:
  - Fixed bottom tab bar component (BottomTabBar.svelte) with emerald-600 active indicator
  - Slim 40px sticky top bar (logo + RefreshButton only)
  - pb-16 layout wrapper so content clears fixed bottom tab bar
affects: [03-02, 03-03, 03-04, 03-05]

tech-stack:
  added: []
  patterns:
    - Svelte 5 runes active-route detection via $derived(page.url.pathname)
    - env(safe-area-inset-bottom) applied as inline style (not Tailwind)
    - Fixed bottom nav z-50 above sticky top bar z-40

key-files:
  created:
    - src/lib/components/BottomTabBar.svelte
  modified:
    - src/routes/+layout.svelte

key-decisions:
  - "pb-16 applied at layout level (children wrapper) rather than per-page — one change covers all routes"
  - "BottomTabBar active-route detection duplicates pattern from layout rather than passing active state as props — keeps component self-contained"
  - "Removed isSchedulePage/isShootersPage/isPremielistePage derived constants from layout — no longer needed after nav links removed"

patterns-established:
  - "BottomTabBar pattern: fixed bottom-0, z-50, h-14, border-t, env(safe-area-inset-bottom) inline style, $derived active state"
  - "Slim top bar pattern: sticky top-0, z-40, h-10, logo-only, RefreshButton right-aligned"

requirements-completed: [UX-01]

duration: 8min
completed: 2026-05-19
---

# Phase 03 Plan 01: Bottom Tab Bar and Slim Header Summary

**Replaced emoji-pill top nav with a 40px logo-only header and a new fixed bottom tab bar (56px, emerald-600 active indicator, safe-area-aware) satisfying UX-01.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-05-19T19:10:00Z
- **Completed:** 2026-05-19T19:18:03Z
- **Tasks:** 2 / 2
- **Files modified:** 2 (1 created, 1 edited)

## Accomplishments

- Created `BottomTabBar.svelte`: Svelte 5 runes, three Norwegian text tabs, emerald-600 active top-border indicator, env(safe-area-inset-bottom) padding, no emojis, no icons
- Replaced 38-line emoji-pill header in `+layout.svelte` with a 5-line slim sticky bar (logo image + RefreshButton)
- Added `pb-16` children wrapper at layout level — all three routes automatically clear the fixed bottom tab bar

## Task Commits

1. **Task 1: Create BottomTabBar.svelte component** - `4a5e06a` (feat)
2. **Task 2: Replace top nav with slim header and mount BottomTabBar** - `79e0b74` (feat)

## Files Created/Modified

- `src/lib/components/BottomTabBar.svelte` — New fixed bottom nav component, 37 lines, Svelte 5 runes
- `src/routes/+layout.svelte` — Slim header replacing full nav; BottomTabBar mounted; pb-16 wrapper

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `src/lib/components/BottomTabBar.svelte` exists
- `src/routes/+layout.svelte` contains slim header, BottomTabBar import/mount, pb-16 wrapper
- `yarn run check` exits 0 (0 errors)
- `yarn run build` exits 0 (Vercel adapter output produced)
- Commits 4a5e06a and 79e0b74 present in git log
