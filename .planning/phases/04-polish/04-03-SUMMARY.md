---
phase: 04-polish
plan: 03
subsystem: infra
tags: [vite-plugin, service-worker, pwa, cache-versioning, git-hash]

# Dependency graph
requires:
  - phase: 04-polish
    provides: existing static/sw.js with manual stordalen-v2 cache name
provides:
  - Automated SW cache versioning: each production build injects current git hash into cache name
  - static/sw.template.js as committed SW source with __CACHE_VERSION__ placeholder
  - swVersionPlugin Vite plugin: dev=stordalen-dev, prod=stordalen-{7-char-hash}
affects: [pwa, deployment, cache-busting]

# Tech tracking
tech-stack:
  added: ["@types/node ^25.9.1 (devDependency)"]
  patterns:
    - "Vite plugin with configResolved + buildStart hooks to capture mode and generate files"
    - "Template file pattern: sw.template.js committed, sw.js gitignored and generated at build"

key-files:
  created:
    - static/sw.template.js
  modified:
    - vite.config.ts
    - .gitignore
    - package.json
    - yarn.lock

key-decisions:
  - "swVersionPlugin inline in vite.config.ts (not a separate file) — keeps the plugin co-located with its config, ~15 lines"
  - "Mode captured via configResolved closure, not buildStart — Vite 8 does not expose mode directly in buildStart context"
  - "VERCEL_GIT_COMMIT_SHA fallback for environments where git is unavailable at build time"
  - "stordalen-dev for development builds — no cache churn on local iteration"

requirements-completed: [POL-03]

# Metrics
duration: 2min
completed: 2026-05-19
---

# Phase 4 Plan 03: SW Cache Versioning Summary

**swVersionPlugin Vite plugin auto-injects git hash into SW cache name at build time, replacing manual stordalen-v2 bump with stordalen-{7-char-hash} per deployment**

## Performance

- **Duration:** 2 min
- **Started:** 2026-05-19T19:58:48Z
- **Completed:** 2026-05-19T20:01:03Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- static/sw.js renamed to sw.template.js with __CACHE_VERSION__ placeholder on line 1; all other lines verbatim
- swVersionPlugin added to vite.config.ts: reads template, writes static/sw.js with resolved version at buildStart
- static/sw.js added to .gitignore; file is generated at build time and never committed
- Production builds produce stordalen-{7-char-git-hash}; dev builds produce stordalen-dev (no churn)
- Existing activate handler evicts all prior caches automatically — no code changes needed there

## Task Commits

1. **Task 1: Rename sw.js to sw.template.js** - `92662e3` (feat)
2. **Task 2: Vite plugin + .gitignore** - `085fc05` (feat)
3. **Task 3: Verify build output** - verification only, no commit

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `static/sw.template.js` - SW source with __CACHE_VERSION__ placeholder; renamed from sw.js
- `vite.config.ts` - swVersionPlugin added; node:fs + node:child_process imports; type Plugin added
- `.gitignore` - static/sw.js entry added under # Generated section
- `package.json` - @types/node added to devDependencies (Rule 3 fix)
- `yarn.lock` - updated for @types/node

## Decisions Made
- swVersionPlugin inlined in vite.config.ts per D-09 (planner decision, not changed)
- Mode captured via configResolved closure — Vite 8 does not expose mode in buildStart
- VERCEL_GIT_COMMIT_SHA as fallback for Vercel CI environments without git

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added @types/node devDependency**
- **Found during:** Task 2 (Vite plugin implementation)
- **Issue:** node:fs, node:child_process, and process not recognized by svelte-check — 3 type errors introduced by vite.config.ts changes. SvelteKit's generated tsconfig.json already requests types:["node"] but @types/node was not installed.
- **Fix:** `yarn add -D @types/node` — standard DefinitelyTyped package; verified legitimate
- **Files modified:** package.json, yarn.lock
- **Verification:** npx svelte-check returned 0 errors after install; yarn build passed
- **Committed in:** 085fc05 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 - blocking)
**Impact on plan:** Required for svelte-check to pass. @types/node is the standard Node.js type definitions package, no scope creep.

## Issues Encountered
None — @types/node install resolved the only blocker cleanly.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- SW cache versioning fully automated. Each Vercel deployment will produce a unique cache name without manual intervention.
- Phase 4 plans: check remaining PLAN files for further polish tasks.

---
*Phase: 04-polish*
*Completed: 2026-05-19*
