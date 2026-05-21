---
phase: 05-generic-branding
plan: 01
subsystem: branding
tags:
  - svelte
  - sveltekit
  - pwa
  - branding
dependency_graph:
  requires: []
  provides:
    - BRAND-01: all user-facing "Stordalen Skytterlag" strings replaced with "Skytterappen"
  affects:
    - static/manifest.json
    - src/app.html
    - vite.config.ts
    - src/lib/components/Splash.svelte
    - src/routes/+page.svelte
    - src/routes/skyttere/+page.svelte
    - src/routes/premieliste/+page.svelte
    - src/routes/+layout.svelte
    - src/routes/+error.svelte
tech_stack:
  added: []
  patterns:
    - In-place string replacement across PWA shell and route templates
key_files:
  created: []
  modified:
    - static/manifest.json
    - src/app.html
    - vite.config.ts
    - src/lib/components/Splash.svelte
    - src/routes/+page.svelte
    - src/routes/skyttere/+page.svelte
    - src/routes/premieliste/+page.svelte
    - src/routes/+layout.svelte
    - src/routes/+error.svelte
decisions:
  - "Asset filenames (stordalen.jpg, stordalenLogo import) preserved unchanged — Phase 6 scope"
  - "static/sw.js is gitignored; regenerated at build/deploy time from vite.config.ts swVersionPlugin"
metrics:
  duration: ~5 minutes
  completed: 2026-05-21
---

# Phase 5 Plan 1: Rename PWA shell and route identity to Skytterappen

Replaced all "Stordalen Skytterlag" / "Stordalen" identity strings with "Skytterappen" across 9 source files; service worker cache prefix updated to `skytterappen-` via vite.config.ts swVersionPlugin.

## Files Modified

| File | Change |
|------|--------|
| `static/manifest.json` | `name`, `short_name`, `description` set to `Skytterappen` / generic description |
| `src/app.html` | `apple-mobile-web-app-title` content changed from `Stordalen` to `Skytterappen` |
| `vite.config.ts` | SW cache version prefix changed from `stordalen-` to `skytterappen-` (both dev and prod literals) |
| `src/lib/components/Splash.svelte` | sessionStorage key renamed to `skytterappen-splash-shown`; `alt` changed to `Skytterappen` |
| `src/routes/+page.svelte` | `<title>` changed to `Skyteplan - Skytterappen` |
| `src/routes/skyttere/+page.svelte` | `<title>` changed to `Skyttere - Skytterappen` |
| `src/routes/premieliste/+page.svelte` | `<title>` changed to `Premieliste - Skytterappen` |
| `src/routes/+layout.svelte` | Header `<img>` `alt` changed to `Skytterappen` |
| `src/routes/+error.svelte` | Header `<img>` `alt` and visible `<span>` text changed to `Skytterappen` |

## Service Worker Cache Prefix

Build produced `static/sw.js` with:
```
const CACHE_NAME = 'skytterappen-360dcd6';
```
Cache prefix is `skytterappen-` (git short SHA `360dcd6` from the Task 2 commit).

## Asset Imports Preserved for Phase 6

All of the following are unchanged per plan specification:
- `import stordalenLogo from '$lib/assets/stordalen.jpg'` — in `+layout.svelte`, `+error.svelte`, `Splash.svelte`
- `src/lib/assets/stordalen.jpg` — asset file untouched
- `static/stordalen.jpg` — asset file untouched
- `"src": "/stordalen.jpg"` in `static/manifest.json` icons array — untouched
- `%sveltekit.assets%/stordalen.jpg` favicon hrefs in `src/app.html` — untouched
- `package.json` `"name": "stordalen"` — internal npm name, untouched

Phase 6 will replace static logo/import with dynamic per-club rendering.

## Deviations from Plan

### Auto-noted: static/sw.js is gitignored

The plan specified "Stage the regenerated static/sw.js and commit". However, `static/sw.js` is listed in `.gitignore` and is not a tracked file. The file is a build artifact regenerated at each `yarn build` / Vercel deploy by `vite.config.ts` `swVersionPlugin`. Committing it is not possible without `-f`, and not appropriate since it changes on every build.

Resolution: The source of truth (`vite.config.ts`) was updated and committed in Task 1 (commit `c67ab27`). The build output was verified to carry `skytterappen-360dcd6`. No commit of `static/sw.js` made — correct behavior for a gitignored build artifact.

No other deviations.

## Verification Results

| Check | Result |
|-------|--------|
| `grep -rn "Stordalen Skytterlag" src/ static/manifest.json` | PASS — 0 matches |
| `grep -n "skytterappen-" static/sw.js` | PASS — `skytterappen-360dcd6` on line 1 |
| `grep -n "stordalen-" static/sw.js` | PASS — 0 matches |
| `yarn run check` (svelte-check) | PASS — 0 errors, 1 pre-existing warning |
| `yarn build` | PASS — exits 0 |

## Commits

| Task | Commit | Message |
|------|--------|---------|
| Task 1 | `c67ab27` | `feat(05-01): rename PWA shell identity to Skytterappen` |
| Task 2 | `360dcd6` | `feat(05-01): update route titles and visual identity to Skytterappen` |
| Task 3 | N/A | sw.js is gitignored; vite.config.ts source committed in Task 1 |

## Self-Check: PASSED

All source files modified. Build and type-check clean. Zero "Stordalen Skytterlag" occurrences in src/ or manifest. SW cache prefix updated. Asset imports preserved.
