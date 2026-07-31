---
quick_id: 260731-ppc
status: complete
date: 2026-07-31
commits:
  - 80abc2a: "fix(nav): add safe-area inset to bottom nav height instead of subtracting"
  - ac73897: "fix(nav): prevent document overscroll from dragging fixed bottom nav"
files_changed:
  - src/lib/components/BottomTabBar.svelte
  - src/routes/+layout.svelte
  - src/app.css
---

# Quick Task 260731-ppc: Fix bottom nav bar bugs (installed PWA) Summary

Fixed two bugs in the installed (standalone) PWA bottom tab bar: cramped internal
spacing caused by safe-area padding being subtracted from a fixed height instead of
added, and the fixed nav bar visually dragging during iOS rubber-band overscroll.

## Task 1: Fix nav height/spacing and content padding

- `BottomTabBar.svelte`: removed the `h-14` Tailwind utility from the `<nav>` and
  replaced the inline style with `height: calc(3.5rem + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom)`, mirroring the header's pattern of
  adding the safe-area inset to the height rather than subtracting it via
  border-box padding.
- `+layout.svelte`: updated the content wrapper from `pb-16` to
  `pb-[calc(3.5rem+env(safe-area-inset-bottom))]` so page content clears the
  now-taller bar on devices with a home indicator.
- Commit: `80abc2a`

## Task 2: Stop the fixed nav bouncing on overscroll

- `app.css`: added `html, body { overscroll-behavior: none; }` after the `:root`
  block, so the document scroller no longer rubber-bands. Body remains the scroll
  container (no `overflow: hidden` introduced), preserving `PullToRefresh.svelte`'s
  reliance on `document.documentElement.scrollTop`.
- Commit: `ac73897`

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- `npx svelte-check --tsconfig ./tsconfig.json`: 0 errors, 0 warnings (run after
  each task).
- `npx prettier --check src/app.css`: passed.
- `yarn build`: succeeded (SvelteKit + Vercel adapter build completed without
  errors).
- Visual/manual verification on an installed iOS PWA (home-indicator device) was
  not performed in this session — recommend confirming nav label centering and
  overscroll behavior on-device before considering the fix fully validated.

## Self-Check: PASSED

- FOUND: src/lib/components/BottomTabBar.svelte (height calc + padding-bottom present)
- FOUND: src/routes/+layout.svelte (pb-[calc(3.5rem+env(safe-area-inset-bottom))] present)
- FOUND: src/app.css (overscroll-behavior: none present)
- FOUND commit 80abc2a in git log
- FOUND commit ac73897 in git log
