---
phase: 03-ux-redesign
plan: 03
plan_id: 03-03
status: completed
subsystem: ui/routes
tags: [ux, palette, typography, sticky-headers, monospace, norwegian-copy]
dependency_graph:
  requires: [03-01]
  provides: [schedule-sticky-headers, neutral-palette-all-routes, monospace-data, norwegian-copy]
  affects: [src/routes/+page.svelte, src/routes/skyttere/+page.svelte, src/routes/premieliste/+page.svelte]
tech_stack:
  added: []
  patterns: [sticky-positioning, font-mono, neutral-tailwind-palette]
key_files:
  created: []
  modified:
    - src/routes/+page.svelte
    - src/routes/skyttere/+page.svelte
    - src/routes/premieliste/+page.svelte
decisions:
  - Wrapped mobile oppropstid div and desktop oppropstid div with font-mono class rather than individual span wrappers — cleaner markup, same visual result
  - Next-event and upcoming-event time spans in shooter summary received font-mono on the containing span (date+time mixed inline) — isolating just the time portion would require splitting the expression
metrics:
  duration: ~15min
  completed: 2026-05-19
  tasks_completed: 3
  files_modified: 3
---

# Phase 03 Plan 03: Palette, Typography, Sticky Headers Summary

All three route pages updated in one wave to apply the outdoor-optimized palette (UX-02) and CSS-sticky date headers (UX-04).

## What Changed

### Task 1 — Schedule page (`src/routes/+page.svelte`)

- Outer date section wrapper: `scroll-mt-10` only — removed `overflow-hidden rounded-lg border bg-white shadow-md sm:scroll-mt-20 sm:rounded-xl sm:shadow-lg`. Removing `overflow-hidden` is required for `position: sticky` to escape the parent stacking context.
- Inner date header: `sticky top-10 z-30 bg-neutral-50 border-b border-neutral-200 px-3 py-3 sm:px-6 sm:py-4` — no gradient, no shadow. Aligns with Wave 1 `h-10` top bar.
- h2: `text-xl font-bold text-neutral-900` (was `text-lg font-semibold text-gray-900 sm:text-xl`)
- Event name h3: `text-base font-semibold` (was `text-sm font-semibold`)
- `font-mono` added to: time span, final score div, ongoing score div, sub-event score div

### Task 2 — Shooters page (`src/routes/skyttere/+page.svelte`)

- `<details>` wrapper: removed `shadow-md sm:shadow-lg`, `border-gray-200` → `border-neutral-200`
- `<summary>`: replaced full gradient (`bg-gradient-to-r from-blue-50 to-indigo-50 ... hover:from-blue-100 hover:to-indigo-100`) with `bg-neutral-100`; removed `transition-colors`
- `font-mono` added to: mobile time span, mobile lastSeries.sum div, mobile series.sum span, next-event time span, upcoming-event time span, mobile oppropstid div, desktop oppropstid div, desktop series.sum span
- Norwegian copy: `Loading shooters data...` → `Laster inn skyttere...`, `Error loading data:` → `Feil ved lasting av data:`, `Error: {error}` → `Feil: {error}`, `No results yet` → `Ingen resultater enda`, `No events scheduled` → `Ingen skytinger planlagt`
- `<style>` block (lines 370-394) preserved verbatim

### Task 3 — Premieliste page (`src/routes/premieliste/+page.svelte`)

- Shooter card: removed `shadow-sm` from class attribute
- Empty state: deleted `<div class="mb-4 text-4xl">🎯</div>`
- Distinction pill: removed `🏆 ` prefix from `{distinction.name}`
- Section headers: deleted `<span class="text-2xl">🎁</span>`, `<span class="text-2xl">🏆</span>`, `<span class="text-2xl">🥇</span>`

## How This Satisfies UX-02 and UX-04

**UX-02 (outdoor-optimized palette and typography):** All shadows (`shadow-sm`, `shadow-md`, `shadow-lg`) and all gradient backgrounds removed across all three routes. Neutral palette (`bg-neutral-50`, `bg-neutral-100`, `border-neutral-200`) replaces blue gradient headers. Data numerals (times, scores) carry `font-mono` for alignment and legibility in outdoor light. Event names use `text-base font-semibold` baseline (was `text-sm`).

**UX-04 (sticky date headers + auto-scroll):** Schedule page date section headers are `sticky top-10 z-30` — they pin just below the `h-10` top bar set in Plan 01. Outer wrapper uses `scroll-mt-10` so `scrollIntoView` clears the bar. The existing `registerTodaySection` action and `onMount` auto-scroll logic are untouched.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `src/routes/+page.svelte` contains `sticky top-10 z-30 bg-neutral-50`: FOUND
- `src/routes/+page.svelte` contains `scroll-mt-10`: FOUND
- `src/routes/+page.svelte` contains `font-mono`: FOUND
- `src/routes/skyttere/+page.svelte` contains `bg-neutral-100`: FOUND
- `src/routes/skyttere/+page.svelte` contains `Feil ved lasting av data:`: FOUND
- `src/routes/skyttere/+page.svelte` contains `font-mono`: FOUND
- `src/routes/skyttere/+page.svelte` contains `details[open] summary .arrow`: FOUND
- `src/routes/premieliste/+page.svelte` does NOT contain `shadow-sm`: CONFIRMED
- `src/routes/premieliste/+page.svelte` does NOT contain emoji (🎯 🏆 🎁 🥇): CONFIRMED
- `yarn check`: 0 errors
- `yarn build`: exits 0
- Commits: a8901d5, 64ca1b7, e04b447
