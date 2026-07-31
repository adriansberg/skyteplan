---
quick_id: 260731-ppc
description: Fix bottom nav bar spacing and scroll-with-page bugs in installed PWA
date: 2026-07-31
mode: quick
---

# Quick Task 260731-ppc: Fix bottom nav bar bugs (installed PWA)

## Problem

In the installed (standalone) PWA on iOS, the bottom tab bar has two bugs:

1. **Cramped internal spacing.** `BottomTabBar.svelte` sets a fixed `h-14` (56px)
   height *and* `padding-bottom: env(safe-area-inset-bottom)`. With Tailwind's
   global `box-sizing: border-box`, the safe-area padding is subtracted from the
   56px instead of added to it. On home-indicator devices `safe-area-inset-bottom`
   ≈ 34px, so the label region collapses to ~22px — noticeably tighter than the
   header. The header (`+layout.svelte`) does it correctly by *adding* the inset
   to the height.

2. **Nav scrolls with the page.** The `position: fixed` bar detaches and moves
   during iOS standalone rubber-band overscroll because nothing caps overscroll
   on the document scroller.

## Tasks

### Task 1: Fix nav height/spacing and content padding

- **files:** `src/lib/components/BottomTabBar.svelte`, `src/routes/+layout.svelte`
- **action:**
  - In `BottomTabBar.svelte`, on the `<nav>`: remove the `h-14` utility class and
    change the inline `style` to add the inset to the height (mirroring the header):
    `style="height: calc(3.5rem + env(safe-area-inset-bottom)); padding-bottom: env(safe-area-inset-bottom)"`.
    Keep all other classes (`fixed right-0 bottom-0 left-0 z-50 flex border-t border-neutral-200 bg-neutral-50`).
  - In `+layout.svelte`, change the content wrapper (currently `<div class="pb-16">`)
    to `<div class="pb-[calc(3.5rem+env(safe-area-inset-bottom))]">` so content is
    never hidden behind the now-taller bar.
- **verify:** `yarn build` (or `npx svelte-check`) passes; visually the nav labels
  are vertically centered with full 3.5rem region.
- **done:** nav height = 3.5rem + safe-area inset; labels centered; content clears the bar.

### Task 2: Stop the fixed nav bouncing on overscroll

- **files:** `src/app.css`
- **action:** Add an `html, body { overscroll-behavior: none; }` rule (top-level,
  after the `:root` block) so the document scroller doesn't rubber-band, which is
  what visually drags the `fixed` nav during standalone overscroll. Keep body as
  the scroll container — `PullToRefresh.svelte` relies on
  `document.documentElement.scrollTop`, so do NOT introduce an inner scroll
  container or `overflow: hidden` on body.
- **verify:** `yarn build` passes; PullToRefresh still triggers at top of page.
- **done:** overscroll-behavior applied to root scroller; pull-to-refresh unaffected.

## Notes

- Do not change the scroll ownership model (body stays the scroller).
- `3.5rem` corresponds to the removed `h-14`.
