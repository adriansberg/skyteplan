---
phase: 06-multi-club-routing
plan: 03
status: complete
completed: "2026-05-26"
---

# Plan 06-03 Summary — UI Wire + Verification

## What was done

**Task 1 — +layout.svelte wired to data.club**
- Removed static `stordalenLogo` import
- Added `data` to `$props()` destructure
- `<img src={data.club.logoPath} alt={data.club.name} class="h-8 w-auto">`

**Task 2 — +error.svelte hardened**
- Removed static `stordalenLogo` import
- `<img src="/favicon.ico" alt="Skytterinfo" class="h-8 w-auto sm:h-10">` — no `data.club` reference

**Task 3 — Human verification: approved**
- Scenario A (`VITE_DEV_CLUB=stordalen`): logo + alt correct, schedule data rendered
- Scenario B (`VITE_DEV_CLUB=does-not-exist`): Norwegian 404 rendered, no JS errors
- Scenario C (`?c=99999` etc.): Stordalen data unaffected by query param

## Post-verification fixes

Several runtime bugs surfaced during verification and were fixed:

| Commit | Fix |
|--------|-----|
| `20751a0` | `navigating.to` instead of `navigating` — `$app/state` object is never null |
| `1fb427f` | Deduplicate API events before keyed `{#each}` |
| `707b485` | Series name+index key to prevent duplicate series name crash |
| `56a1b11` | Duplicate series.name key in skyttere page |
| `e5185fb` | Duplicate eventName key in skyttere eventScores block |
| `c206f66` | Shot keys (inner shots produce 'X' value); `SvelteSet`; unused `_` bindings |
| `94b7870` | Prettier formatting |
| `fc55acb` | `shootersWithDistinctions` via `$derived` (was capturing initial value only) |

## Deviations

- Executor (Plan 02) moved GraphQL client to `src/lib/server/graphql/` and switched from `VITE_AUTH_TOKEN` to `AUTH_TOKEN` (private env). Requires `.env.local` to have `AUTH_TOKEN` set (not `VITE_AUTH_TOKEN`). Vercel dashboard also needs `AUTH_TOKEN`.
- `static/sw.js` is gitignored — must be regenerated from `sw.template.js` or rebuilt.

## Gate

`yarn lint && yarn run check` — 0 errors, 0 warnings.
