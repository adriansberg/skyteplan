---
phase: 04-polish
plan: 01
subsystem: ui
tags: [pwa, ios, safe-area, css-variables, svelte, sveltekit]

requires:
  - phase: 03-ux-redesign
    provides: top bar h-10 height, neutral-50 palette, bottom tab safe-area pattern

provides:
  - viewport-fit=cover + black-translucent iOS PWA status bar config
  - --top-bar-height CSS variable as single source of truth for dynamic header height
  - env(safe-area-inset-top) padding on top bar header
  - sticky date headers tracking dynamic top bar height

affects: [04-02-skeleton-screens, any future plans using sticky positioning]

tech-stack:
  added: []
  patterns:
    - "env() CSS functions via inline style (not Tailwind arbitrary values)"
    - "--top-bar-height CSS variable for safe-area-aware height references"

key-files:
  created: []
  modified:
    - src/app.html
    - static/manifest.json
    - src/app.css
    - src/routes/+layout.svelte
    - src/routes/+page.svelte

key-decisions:
  - "theme-color set to #fafafa (neutral-50) to match top bar background on Android Chrome"
  - "black-translucent status bar: iOS overlays content, top bar compensates with env(safe-area-inset-top) padding"
  - "--top-bar-height calc(2.5rem + env(safe-area-inset-top)) is the single source of truth; sticky headers reference it via var()"

patterns-established:
  - "Inline style for env() CSS functions — same as bottom tab bar pattern from Phase 3"
  - "CSS variable in :root for dynamic heights that sticky children need to reference"

requirements-completed: [POL-02]

duration: 8min
completed: 2026-05-19
---

# Phase 4 Plan 01: iOS Safe Area Top Bar Summary

**viewport-fit=cover + black-translucent status bar with env(safe-area-inset-top) padding on header and --top-bar-height CSS variable wiring sticky date headers**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-05-19T00:00:00Z
- **Completed:** 2026-05-19T00:08:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- iOS PWA now shows transparent status bar (black-translucent) with no white gap
- Top bar header grows by env(safe-area-inset-top) so content is never obscured by status bar overlay
- Sticky date headers track the dynamic bar height via --top-bar-height CSS variable
- theme-color matches neutral-50 (#fafafa) in both app.html and manifest.json

## Task Commits

1. **Task 1: iOS meta tags + manifest theme-color** - `16cdc4a` (feat)
2. **Task 2: CSS variable + top bar safe-area + sticky header fix** - `0d7d981` (feat)

## Files Created/Modified

- `src/app.html` - viewport-fit=cover, black-translucent status bar, #fafafa theme-color
- `static/manifest.json` - theme_color #1f2937 → #fafafa
- `src/app.css` - added :root { --top-bar-height: calc(2.5rem + env(safe-area-inset-top)) }
- `src/routes/+layout.svelte` - removed h-10, added inline style with env(safe-area-inset-top) height + padding-top
- `src/routes/+page.svelte` - sticky date header uses var(--top-bar-height) for top; section wrapper uses it for scroll-margin-top

## Decisions Made

None beyond what the plan specified — followed D-05, D-06, D-07 exactly.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

`yarn check` reports pre-existing TypeScript 6 / typescript-eslint peer dependency conflicts and `@types/node` errors in `vite.config.ts` — none caused by this plan's changes. Svelte files in this plan have zero type errors.

## Next Phase Readiness

- --top-bar-height infrastructure is live; 04-02 skeleton screens can use it for any sticky positioning needs
- Bottom tab safe-area pattern (Phase 3) + top bar safe-area pattern (this plan) both established

---
*Phase: 04-polish*
*Completed: 2026-05-19*
