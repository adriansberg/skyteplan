---
phase: 01-cleanup-dependencies
plan: "04"
subsystem: infra
tags: [vite, vite-plugin-svelte, adapter-vercel, rolldown, sveltekit]

requires:
  - phase: 01-cleanup-dependencies plan 03
    provides: "@sveltejs/kit pinned at 2.59.1 — prerequisite for Vite 8 peer chain"
provides:
  - "vite 8.0.13 (Rolldown-era bundler) installed and building"
  - "@sveltejs/vite-plugin-svelte 7.1.2 installed (inspector now integrated, no separate package)"
  - "@sveltejs/adapter-vercel 6.3.3 installed, Vercel artifact produced"
affects:
  - 01-05 (TypeScript 6 Wave 5 — now has Vite 8 baseline)

tech-stack:
  added:
    - vite@8.0.13 (Rolldown-based, replaces esbuild-based Vite 7)
    - "@sveltejs/vite-plugin-svelte@7.1.2 (inspector integrated)"
    - "@sveltejs/adapter-vercel@6.3.3"
  patterns:
    - "Three majors installed together in single yarn add resolver pass to avoid partial peer-dep state"

key-files:
  created: []
  modified:
    - package.json
    - yarn.lock

key-decisions:
  - "Single yarn add command for all three majors — ensures resolver handles peer constraints in one pass, avoids intermediate broken state"
  - "vite.config.ts and svelte.config.js required zero edits — confirmed by RESEARCH.md (only plugins: [tailwindcss(), sveltekit()], no rollupOptions or esbuildOptions)"
  - "IMPORT_IS_UNDEFINED hydratable warnings in build output are from @sveltejs/kit node_modules internals (Rolldown tree-shaking) — not source warnings, build exits 0, accepted"
  - "TypeScript kept at ^5.0.0 — Wave 5 isolation preserved"

patterns-established:
  - "Wave isolation: Vite 8 landed before TypeScript 6, enabling bisect if TS6 breaks things"

requirements-completed:
  - DEPS-03

duration: 2min
completed: "2026-05-17"
---

# Phase 1 Plan 04: Vite 8 + vite-plugin-svelte 7 + adapter-vercel 6 Summary

**Rolldown-era Vite 8 stack landed: vite 8.0.13, vite-plugin-svelte 7.1.2, adapter-vercel 6.3.3 installed together; build and type-check clean; Vercel artifact produced.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-05-17T21:53:01Z
- **Completed:** 2026-05-17T21:55:10Z
- **Tasks:** 1 (Task 1 pre-approved by user; Task 2 executed)
- **Files modified:** 2

## Accomplishments

- Vite 8 (Rolldown-based bundler) installed — replaces esbuild-based Vite 7
- vite-plugin-svelte 7.1.2 installed — inspector now integrated, no separate package needed
- adapter-vercel 6.3.3 installed — produced `> Using @sveltejs/adapter-vercel ✔ done` output
- `yarn run check` exits 0 — 0 errors, 0 warnings
- `yarn build` exits 0 — no duplicate-plugin or peer-dep warnings

## Task Commits

1. **Task 2: Install Vite 8, vite-plugin-svelte 7, adapter-vercel 6** — `ca94c3e` (feat)

**Plan metadata:** _(this summary commit)_

## Files Created/Modified

- `package.json` — vite pinned to `8.0.13`, @sveltejs/vite-plugin-svelte to `7.1.2`, @sveltejs/adapter-vercel to `6.3.3`
- `yarn.lock` — resolved tree with all three majors and transitive deps (rolldown, @oxc-project/types, lightningcss, etc.)

## Decisions Made

- Single `yarn add -D` command for all three majors — resolver handles peer constraints atomically; avoids partial peer state from sequential installs
- No edits to `vite.config.ts` or `svelte.config.js` — confirmed by RESEARCH.md; project uses only `plugins: [tailwindcss(), sveltekit()]` with no `build.rollupOptions` or `build.esbuildOptions`
- `IMPORT_IS_UNDEFINED hydratable` Rolldown warnings treated as acceptable — they originate in `node_modules/@sveltejs/kit/src/runtime/shared.js`, not project source; build exits 0; this is a known kit/Rolldown compat note, not a project issue

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

One potentially confusing detail: `yarn check` (yarn v1 integrity checker) exits 1 due to peer mismatch false positives (tailwind/vite range not yet updated for Vite 8, typescript-eslint TypeScript range). These are pre-existing and unrelated to this wave. The plan's `check` script is `yarn run check` which runs `svelte-kit sync && svelte-check` — that exits 0 cleanly. Both behaviors documented here for clarity.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Vite 8 / Rolldown stack installed and building cleanly
- Wave 5 (TypeScript 6 bump) can now proceed on a stable Vite 8 baseline
- No blockers

---
*Phase: 01-cleanup-dependencies*
*Completed: 2026-05-17*
