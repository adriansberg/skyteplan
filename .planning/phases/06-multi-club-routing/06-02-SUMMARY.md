---
phase: 06-multi-club-routing
plan: 02
subsystem: server
tags: [sveltekit, hooks, server, routing]
dependency_graph:
  requires: [06-01]
  provides: [hooks.server.ts, +layout.server.ts, locals.club pipeline]
  affects: [src/routes/+layout.svelte (Plan 03 consumes data.club)]
tech_stack:
  added: []
  patterns: [SvelteKit handle hook, LayoutServerLoad, locals.club propagation]
key_files:
  created:
    - src/hooks.server.ts
    - src/routes/+layout.server.ts
  modified:
    - src/routes/+page.server.ts
    - src/routes/skyttere/+page.server.ts
    - src/routes/premieliste/+page.server.ts
  deleted:
    - src/lib/constants.ts
    - static/stordalen.jpg
decisions:
  - D-01/D-10: Club resolved server-side exactly once per request in hooks.server.ts
  - D-02: VITE_DEV_CLUB absence in dev throws Error — no silent fallback
  - D-05/D-06: Unknown subdomain → error(404, 'Siden finnes ikke') before any loader runs
  - D-09: +layout.server.ts returns { club: locals.club } for Plan 03 consumption
  - D-11: All url.searchParams.get('c') and DEFAULT_CLUB_ID usage removed from src/routes/
metrics:
  duration: 15m
  completed: 2026-05-21T22:05:00Z
  tasks_completed: 3
  files_created: 2
  files_modified: 3
  files_deleted: 2
---

# Phase 6 Plan 2: Server-Side Club Resolution Pipeline Summary

SvelteKit handle hook resolving club from host header (or VITE_DEV_CLUB in dev), wiring into event.locals.club, exposed via +layout.server.ts, consumed by all three page loaders — ?c= param mechanism fully retired.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create hooks.server.ts | 81f6cd6 | src/hooks.server.ts (created) |
| 2 | Create +layout.server.ts + refactor 3 loaders | 068f2d0 | src/routes/+layout.server.ts (created), 3× +page.server.ts (modified) |
| 3 | Delete constants.ts and stale stordalen.jpg | d156352 | src/lib/constants.ts (deleted), static/stordalen.jpg (deleted) |

## Verification Gates

- [x] `grep -rn "searchParams" src/routes/` → no matches
- [x] `grep -rn "DEFAULT_CLUB_ID" src/` → no matches
- [x] `grep -rn "from '$lib/constants'" src/` → no matches
- [x] `! test -e src/lib/constants.ts`
- [x] `! test -e static/stordalen.jpg`
- [x] `static/clubs/stordalen.jpg` still present (canonical copy from Plan 01)
- [x] `npx svelte-check` — 1 pre-existing error (AUTH_TOKEN env not in check env), 1 pre-existing warning; no new errors

## Type Contract Delivered

`src/hooks.server.ts`:
- localhost/127.0.0.1 → reads `import.meta.env.VITE_DEV_CLUB`; throws `Error` if unset
- production → `slug = event.url.hostname.split('.')[0]`
- unknown slug → `error(404, 'Siden finnes ikke')` (exact copy per D-05/D-06)
- sets `event.locals.club = club` then returns `resolve(event)`

`src/routes/+layout.server.ts`:
- returns `{ club: locals.club }` — consumed by Plan 03 layout UI

All three `+page.server.ts` loaders:
- signature changed from `async ({ url })` to `async ({ locals })`
- clubId derivation changed from 2-line searchParams pattern to `const { clubId } = locals.club;`
- try/catch shape and return object keys unchanged

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] svelte-kit sync required before LayoutServerLoad resolves**
- **Found during:** Task 2 verification (svelte-check)
- **Issue:** `LayoutServerLoad` reported "not exported" from `./$types` until generated types were refreshed
- **Fix:** Ran `npx svelte-kit sync` before svelte-check; types generated correctly, error disappeared
- **Files modified:** None (generated .svelte-kit/ only)
- **Commit:** N/A (no source change needed)

## Known Stubs

None.

## Threat Surface Scan

No new network endpoints, auth paths, or schema changes introduced. The host-header validation (T-06-04) and ?c= param removal (T-06-05) were explicitly planned mitigations — both implemented as specified.

## Self-Check: PASSED

- `src/hooks.server.ts` — exists, verified
- `src/routes/+layout.server.ts` — exists, verified
- Commits 81f6cd6, 068f2d0, d156352 — all present in git log
- All grep verification gates return zero matches
