---
phase: 06-multi-club-routing
plan: 01
subsystem: config
tags: [sveltekit, typescript, config, club-routing]
dependency_graph:
  requires: []
  provides: [ClubConfig type, clubs map, App.Locals.club typing, /clubs/stordalen.jpg asset]
  affects: [src/routes/+layout.server.ts (Plan 02), src/hooks.server.ts (Plan 02), premieliste loader (Plan 03)]
tech_stack:
  added: []
  patterns: [typed static config map, App.Locals augmentation, static/clubs/ asset convention]
key_files:
  created:
    - src/lib/clubs.ts
    - static/clubs/stordalen.jpg (moved from src/lib/assets/)
  modified:
    - src/app.d.ts
    - .env.example
decisions:
  - D-07: stordalen entry uses clubId '10782', name 'Stordalen Skytterlag', logoPath '/clubs/stordalen.jpg'
  - D-03/D-04: logo moved via git mv — rename tracked, not delete+add
  - D-01: .env.local holds VITE_DEV_CLUB=stordalen; .env.example has empty template
  - D-09: App.Locals.club typed as ClubConfig
metrics:
  duration: 15m
  completed: 2026-05-21T21:48:37Z
  tasks_completed: 3
  files_created: 2
  files_modified: 2
---

# Phase 6 Plan 1: Club Config Foundation Summary

Typed ClubConfig interface and clubs static map in src/lib/clubs.ts, App.Locals.club augmentation in src/app.d.ts, logo relocated to static/clubs/ via git mv, dev env scaffolded with VITE_DEV_CLUB.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create src/lib/clubs.ts | 3354084 | src/lib/clubs.ts (created) |
| 2 | Extend App.Locals with club: ClubConfig | a11551d | src/app.d.ts (modified) |
| 3 | Move logo + scaffold .env files | 276b9da | static/clubs/stordalen.jpg, .env.example |
| - | Prettier formatting fix | 3246889 | src/lib/clubs.ts, src/app.d.ts |

## Type Contracts Established

`ClubConfig` interface (src/lib/clubs.ts):
```typescript
export interface ClubConfig {
  clubId: string;
  name: string;
  logoPath: string;
}
```

`clubs` map (src/lib/clubs.ts):
- key `stordalen` → `{ clubId: '10782', name: 'Stordalen Skytterlag', logoPath: '/clubs/stordalen.jpg' }`

`App.Locals` augmentation (src/app.d.ts):
- `club: ClubConfig` — consumed by hooks.server.ts and layout.server.ts in Plan 02

## Asset Move

`src/lib/assets/stordalen.jpg` → `static/clubs/stordalen.jpg` via `git mv`.
Public URL: `/clubs/stordalen.jpg`. Tracked as rename (R) in git, not delete+add.

## .env.local Gitignore Confirmation

`.gitignore` contains `.env.*` which covers `.env.local`. File not staged, not committed. Contains `VITE_DEV_CLUB=stordalen` for local development.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Style] Prettier formatting on clubs.ts and app.d.ts**
- **Found during:** Post-task verification (`yarn lint`)
- **Issue:** Prettier expected semicolons after field declarations; my writes omitted them
- **Fix:** Ran `prettier --write` on both files; committed as `style(06-01)` separately
- **Files modified:** src/lib/clubs.ts, src/app.d.ts
- **Commit:** 3246889

Note: `yarn lint` still reports failures on 9 pre-existing files (BottomTabBar.svelte, EventStatusBadge.svelte, etc.) that were not touched in this plan. These are out-of-scope pre-existing issues.

## Verification Gates

- [x] `yarn svelte-check` exits 0 (0 errors, 1 pre-existing warning)
- [x] `prettier --check src/lib/clubs.ts src/app.d.ts` passes
- [x] `eslint src/lib/clubs.ts src/app.d.ts` passes
- [x] `grep "export interface ClubConfig" src/lib/clubs.ts` matches
- [x] `grep "export const clubs: Record<string, ClubConfig>" src/lib/clubs.ts` matches
- [x] `grep "club: ClubConfig" src/app.d.ts` matches
- [x] `test -f static/clubs/stordalen.jpg && ! test -e src/lib/assets/stordalen.jpg`
- [x] `grep "VITE_DEV_CLUB=" .env.example` matches
- [x] `grep "VITE_DEV_CLUB=stordalen" .env.local` matches
- [x] `.env.local` excluded by .gitignore (.env.* pattern)

## Self-Check: PASSED
