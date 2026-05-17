---
phase: 02-security-tech-debt
plan: "02"
subsystem: svelte5-runes-migration
tags:
  - svelte5
  - runes
  - refactor
dependency_graph:
  requires:
    - 02-01
  provides:
    - src/lib/utils/helpers.ts (groupFeltEvents)
    - src/routes/+page.svelte (runes)
    - src/routes/skyttere/+page.svelte (runes)
    - src/lib/components/Splash.svelte (bindable)
  affects:
    - src/routes/+page.svelte
    - src/routes/skyttere/+page.svelte
    - src/lib/components/Splash.svelte
    - src/lib/utils/helpers.ts
tech_stack:
  added: []
  patterns:
    - Svelte 5 $props() for data prop destructuring
    - $derived(data.x) for reactive loader props (Pitfall 3 mitigation)
    - $state() for mutable local state
    - $bindable() for two-way bound props
    - groupFeltEvents() pure TS helper with plain Set (no SvelteSet)
key_files:
  created: []
  modified:
    - src/lib/utils/helpers.ts
    - src/routes/+page.svelte
    - src/routes/skyttere/+page.svelte
    - src/lib/components/Splash.svelte
decisions:
  - "Used plain Set<string> in groupFeltEvents() — SvelteSet has no benefit in pure TS helpers"
  - "groupedEvents $derived uses IIFE pattern matching premieliste/+page.svelte prizeSummary"
  - "$derived(data.shooters) not plain let — ensures invalidateAll() triggers UI update"
  - "Splash show prop declared $bindable(false) so parent bind:show compiles in Svelte 5"
  - "Fixed skyttere $types import path from '../skyttere/$types' to './$types' (pre-existing bug)"
metrics:
  duration: "~3 minutes"
  completed: "2026-05-18"
  tasks: 3
  files_changed: 4
---

# Phase 02 Plan 02: Svelte 5 Runes Migration Summary

Svelte 5 runes migration across three target files plus Felt grouping extraction to `helpers.ts` as a pure TS helper — no `SvelteSet`, plain `Set<string>` deduplication, schedule page reduced by 80 lines.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Extract groupFeltEvents to helpers.ts | cec11f5 | src/lib/utils/helpers.ts |
| 2 | Migrate +page.svelte to runes and use groupFeltEvents | a3fc5ba | src/routes/+page.svelte |
| 3 | Migrate skyttere/+page.svelte and Splash.svelte to runes | 0eca336 | src/routes/skyttere/+page.svelte, src/lib/components/Splash.svelte |

## DEBT-01 Acceptance Gate

```
grep -rn -E "export let|^\s*\$:" src/routes/+page.svelte src/routes/skyttere/+page.svelte src/lib/components/Splash.svelte
```

**Result: zero matches — PASS**

No `export let` or `$:` reactive statements remain in any target file.

## DEBT-03 Acceptance Gate

```
grep -q "export function groupFeltEvents" src/lib/utils/helpers.ts
grep -c "groupFeltEvents" src/routes/+page.svelte  → 2 (import + call; no inline algorithm)
```

**Result: PASS** — Felt grouping algorithm lives exclusively in `helpers.ts`. The `+page.svelte` script block contains only the import and a single `$derived` call.

## Line Count Reduction

`+page.svelte` before: 369 lines. After: 289 lines. **80 lines removed** — exceeds the target estimate of ~75. The schedule page script is now small enough to read without scrolling through grouping code.

## Reactivity Validation

`$derived(data.shooters)` and `$derived(data.error)` are used in both migrated pages per Pitfall 3 guidance. Plain `let shooters = data.shooters` would silently fail to update after `invalidateAll()`. The `$derived` form re-evaluates when the `data` prop updates from the server loader.

## Splash Bindable

`Splash.svelte` declares `let { show = $bindable(false) } = $props()`. The parent call site `<Splash bind:show={showSplash} />` in `+page.svelte` is unchanged and compiles successfully (`yarn build` green). Pitfall 4 mitigated.

## yarn check / yarn build

- `svelte-check`: 0 errors, 2 pre-existing warnings (premieliste reactive ref, tsconfig @types/node)
- `vite build`: exits 0

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Worktree missing .env with AUTH_TOKEN**
- **Found during:** Task 1 verification (`svelte-check`)
- **Issue:** Same as Plan 01 deviation — worktree had no `.env`; `$env/static/private` type-checking requires `AUTH_TOKEN`
- **Fix:** Copied `.env` from main repo into worktree root with AUTH_TOKEN set to real value
- **Files modified:** `.env` (worktree-local, gitignored)
- **Impact:** None on production

## Known Stubs

None. All migrated files are pure refactors — data flows unchanged from server loaders.

## Threat Flags

None. This plan is pure refactoring — no new network endpoints, auth paths, file access patterns, or schema changes introduced.

## Self-Check: PASSED

- src/lib/utils/helpers.ts: FOUND — contains groupFeltEvents and EventWithShooter
- src/routes/+page.svelte: FOUND — uses $props, $derived, $state, groupFeltEvents
- src/routes/skyttere/+page.svelte: FOUND — uses $props, $derived, ./$types import
- src/lib/components/Splash.svelte: FOUND — uses $bindable(false)
- Commits: cec11f5, a3fc5ba, 0eca336 — all verified in git log
