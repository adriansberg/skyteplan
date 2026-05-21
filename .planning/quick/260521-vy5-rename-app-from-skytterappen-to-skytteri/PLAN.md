---
quick_id: 260521-vy5
slug: rename-app-from-skytterappen-to-skytteri
description: Rename app display name from Skytterappen to Skytterinfo
date: 2026-05-21
status: planned
---

# Quick Task: Rename Skytterappen → Skytterinfo

## Objective

Replace all user-facing "Skytterappen" / "skytterappen" strings with "Skytterinfo" / "skytterinfo".
Asset filenames (stordalen.jpg, stordalenLogo) stay unchanged — Phase 6 scope.

## Substitutions

| Find | Replace |
|------|---------|
| `Skytterappen` | `Skytterinfo` |
| `skytterappen` | `skytterinfo` |

## Files

1. `static/manifest.json` — name, short_name, description
2. `src/app.html` — apple-mobile-web-app-title content
3. `vite.config.ts` — swVersionPlugin cache prefix literals
4. `src/lib/components/Splash.svelte` — sessionStorage key + alt text
5. `src/routes/+page.svelte` — svelte:head title
6. `src/routes/skyttere/+page.svelte` — svelte:head title
7. `src/routes/premieliste/+page.svelte` — svelte:head title
8. `src/routes/+layout.svelte` — header img alt
9. `src/routes/+error.svelte` — img alt + span text
10. `README.md` — all occurrences

## Tasks

### Task 1: Rename all source occurrences
Apply replace_all edits across all 10 files. Then run `npx svelte-check` — must exit 0.
Commit: `feat(quick): rename app to Skytterinfo`

### Task 2: Regenerate static/sw.js
Run `yarn build` — triggers swVersionPlugin to write `skytterinfo-<hash>` into static/sw.js.
Verify `grep -n "skytterinfo-" static/sw.js` matches, `grep -n "skytterappen-" static/sw.js` has zero matches.
Commit: `feat(quick): regenerate sw.js with skytterinfo- cache prefix`

## Verification

- `grep -rn "Skytterappen" src/ static/manifest.json README.md` → zero matches
- `grep -rn "skytterappen" src/ static/manifest.json` → zero matches
- `npx svelte-check` → 0 errors
- `grep -n "skytterinfo-" static/sw.js` → at least one match
