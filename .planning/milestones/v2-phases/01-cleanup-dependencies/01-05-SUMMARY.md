---
phase: 01-cleanup-dependencies
plan: 05
subsystem: infra
tags: [typescript, svelte, svelte5, eslint, prettier, build-tooling]

requires:
  - phase: 01-cleanup-dependencies plan 04
    provides: Vite 8 + vite-plugin-svelte 7 + adapter-vercel 6 stack building clean

provides:
  - TypeScript 6.0.3 installed and building clean
  - Phase 1 target stack complete: SvelteKit 2.59.1 + Vite 8.0.13 + TypeScript 6.0.3
  - .prettierignore excluding GSD planning artifacts (.planning/, .claude/)
  - Pre-existing ESLint errors fixed: BeforeInstallPromptEvent type, SvelteSet/SvelteMap reactivity, {#each} keys

affects: [all future phases — TypeScript 6 compiler active for all source]

tech-stack:
  added: [typescript@6.0.3]
  patterns:
    - BeforeInstallPromptEvent interface pattern for PWA install prompt
    - SvelteSet/SvelteMap from svelte/reactivity for reactive collections in Svelte components
    - Keyed {#each} blocks with composite string keys for non-id entities

key-files:
  created: []
  modified:
    - package.json
    - yarn.lock
    - .prettierignore
    - .prettierrc
    - CLAUDE.md
    - eslint.config.js
    - src/lib/components/InstallPrompt.svelte
    - src/routes/+page.svelte
    - src/routes/premieliste/+page.svelte
    - src/routes/skyttere/+page.svelte

key-decisions:
  - "TS6 types default held (Assumption A3 from RESEARCH.md) — tsconfig.json unchanged, no types[] override needed"
  - "Pre-existing lint errors fixed as Rule 1/2 deviations since they were unblocked by fixing the prettier gate"
  - ".planning/ and .claude/ excluded from prettier to prevent GSD artifact churn in lint"

patterns-established:
  - "BeforeInstallPromptEvent: define custom interface extending Event for non-standard browser APIs"
  - "SvelteSet/SvelteMap: use svelte/reactivity wrappers for Set/Map in reactive Svelte contexts"
  - "Keyed {#each}: use composite string key '${a}-${b}' for entities lacking unique id fields"

requirements-completed: [DEPS-04]

duration: 25min
completed: 2026-05-17
---

# Phase 1 Plan 05: TypeScript 6.0.3 Upgrade Summary

**TypeScript bumped 5→6.0.3 completing the SvelteKit 2.59.1 + Vite 8.0.13 + TypeScript 6.0.3 target stack; tsconfig unchanged; all three verification gates green**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-05-17T22:00:00Z
- **Completed:** 2026-05-17T22:25:00Z
- **Tasks:** 1 (Task 2; Task 1 pre-approved)
- **Files modified:** 10

## Accomplishments

- TypeScript 6.0.3 installed; tsconfig.json required no changes (TS6 types default held)
- Phase 1 goal achieved: SvelteKit 2.59.1 + Vite 8.0.13 + TypeScript 6.0.3 stack builds and type-checks clean
- 23 pre-existing ESLint errors fixed (hidden behind failing prettier gate; unblocked by this task)
- GSD planning artifacts excluded from prettier via .prettierignore

## Task Commits

1. **Task 2: Bump typescript to 6.0.3 and verify tsconfig types defaults** - `e4d969d` (chore)

**Plan metadata:** (pending final commit)

## Files Created/Modified

- `package.json` — typescript pinned to 6.0.3
- `yarn.lock` — resolved tree with typescript 6.0.3
- `.prettierignore` — added .planning/ and .claude/ exclusions
- `.prettierrc` — prettier formatting applied
- `CLAUDE.md` — prettier formatting applied (GSD-generated content)
- `eslint.config.js` — prettier formatting applied
- `src/lib/components/InstallPrompt.svelte` — BeforeInstallPromptEvent interface replacing `any`; cast on event listener assignment
- `src/routes/+page.svelte` — SvelteSet for processedEvents; keys on {#each} loops; dateKey replacing unused `_`
- `src/routes/premieliste/+page.svelte` — removed unused onMount import; SvelteMap replacing Map; keys on {#each} loops
- `src/routes/skyttere/+page.svelte` — keys on all 8 {#each} loops

## Decisions Made

- tsconfig.json left unchanged — `yarn run check` passed immediately after TS6 install, confirming Assumption A3 from RESEARCH.md held
- Pre-existing lint errors fixed inline (Rule 1/2) rather than deferred — they were correctness/reactivity issues previously masked by the prettier failure short-circuiting `&&` in `yarn lint`
- .prettierignore updated to exclude .planning/ and .claude/ — these are GSD tooling artifacts, not project source; reformatting them on every run would produce noisy diffs

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] prettier gate failing prevented yarn lint exit 0**
- **Found during:** Task 2 (lint verification)
- **Issue:** `prettier --check .` was failing on .planning/ docs, .claude/settings.local.json, CLAUDE.md, .prettierrc, eslint.config.js — pre-existing since GSD tooling created those files without formatting them
- **Fix:** Added .planning/ and .claude/ to .prettierignore; ran prettier --write on CLAUDE.md, .prettierrc, eslint.config.js
- **Files modified:** .prettierignore, .prettierrc, CLAUDE.md, eslint.config.js
- **Verification:** `prettier --check .` passes
- **Committed in:** e4d969d

**2. [Rule 1 - Bug] InstallPrompt.svelte used `any` for BeforeInstallPromptEvent**
- **Found during:** Task 2 (lint verification — unblocked by fix #1)
- **Issue:** 3x `@typescript-eslint/no-explicit-any` errors; non-standard browser API typed as any
- **Fix:** Added `BeforeInstallPromptEvent` interface extending Event with `prompt()` and `userChoice`; typed deferredPrompt; cast on listener assignment
- **Files modified:** src/lib/components/InstallPrompt.svelte
- **Verification:** svelte-check 0 errors, eslint 0 errors
- **Committed in:** e4d969d

**3. [Rule 2 - Missing Critical] {#each} blocks missing keys in 3 route pages**
- **Found during:** Task 2 (lint verification — unblocked by fix #1)
- **Issue:** 15x `svelte/require-each-key` errors across +page.svelte, premieliste/+page.svelte, skyttere/+page.svelte; Svelte requires keyed loops for correct DOM reconciliation
- **Fix:** Added composite string keys `(a.name + "-" + b)` pattern using available unique fields; shooter loops use organizationId
- **Files modified:** src/routes/+page.svelte, src/routes/premieliste/+page.svelte, src/routes/skyttere/+page.svelte
- **Verification:** eslint 0 errors, svelte-check 0 errors, build passes
- **Committed in:** e4d969d

**4. [Rule 1 - Bug] SvelteSet/SvelteMap used instead of native Set/Map in reactive contexts**
- **Found during:** Task 2 (lint verification — unblocked by fix #1)
- **Issue:** `svelte/prefer-svelte-reactivity` on Set in +page.svelte:52 and Map in premieliste/+page.svelte:46
- **Fix:** Imported SvelteSet from svelte/reactivity in +page.svelte; imported SvelteMap in premieliste/+page.svelte; replaced usages
- **Files modified:** src/routes/+page.svelte, src/routes/premieliste/+page.svelte
- **Verification:** eslint 0 errors
- **Committed in:** e4d969d

**5. [Rule 1 - Bug] Unused onMount import in premieliste/+page.svelte**
- **Found during:** Task 2 (lint verification — unblocked by fix #1)
- **Issue:** `@typescript-eslint/no-unused-vars` on onMount at line 2; was imported but never called
- **Fix:** Removed onMount import
- **Files modified:** src/routes/premieliste/+page.svelte
- **Verification:** eslint 0 errors
- **Committed in:** e4d969d

---

**Total deviations:** 5 auto-fixed (1 blocking, 2 bug, 2 missing critical)
**Impact on plan:** All fixes necessary for yarn lint exit 0 (plan acceptance criterion). The prettier gate had been masking 23 ESLint errors since prior plans. No new bugs introduced, no scope creep.

## Issues Encountered

- `yarn check` (yarn's built-in integrity command) was run instead of `yarn run check` (project script) on first attempt — the former tests peer dependency satisfaction and showed TS 6 peer mismatches with typescript-eslint. Those are warnings-as-errors in yarn v1 integrity check, not actual failures. Running `yarn run check` (which runs svelte-check) confirmed zero TS errors.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

Phase 1 complete. All success criteria met:
- SvelteKit 2.59.1 + Vite 8.0.13 + TypeScript 6.0.3 stack builds clean
- All Phase 1 grep gates pass (no svelte-query, no deprecated formatters, no old PWA events, single '10782' location, no old lsres.no domain)
- `yarn run check`, `yarn build`, `yarn lint` all exit 0

Ready for Phase 2.

## Known Stubs

None — this plan installs a compiler version, not UI/data features.

---
*Phase: 01-cleanup-dependencies*
*Completed: 2026-05-17*
