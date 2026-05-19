---
phase: 02-security-tech-debt
verified: 2026-05-18T00:00:00Z
status: human_needed
score: 6/6 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Load schedule page with ?c=abc, confirm default club data renders"
    expected: "Page loads with default club (10782) shooter data — not a blank or error screen"
    why_human: "SEC-02 regex validated in code; runtime fallback behavior requires a live dev server"
  - test: "Click RefreshButton on schedule page, confirm shooter list updates"
    expected: "Data refreshes after invalidateAll() — list changes if API data changed"
    why_human: "$derived(data.shooters) reactivity cannot be exercised without a running browser"
  - test: "Go offline, reload any route, confirm +error.svelte renders"
    expected: "Sticky logo header, red card with Norwegian heading, small muted error message, 'Ga til forsiden' link"
    why_human: "SvelteKit error boundary activation requires a real browser navigation under a failing load"
  - test: "Load schedule page in fresh session, confirm Splash appears and dismisses"
    expected: "Splash visible ~1.5s, then schedule renders with today's section scrolled into view"
    why_human: "sessionStorage gate and scroll behaviour require a real browser environment"
---

# Phase 02: Security & Tech Debt Verification Report

**Phase Goal:** Auth token is server-only and all three routes have consistent, rune-based implementations
**Verified:** 2026-05-18
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `grep -r "AUTH_TOKEN" .svelte-kit/output/client/` returns zero results after build | VERIFIED | Build output exists; grep returned zero matches. `src/lib/server/graphql/client.ts` imports `AUTH_TOKEN` from `$env/static/private` (line 3), not `import.meta.env`. The string `VITE_AUTH_TOKEN` appears only in a comment on line 1 — not a functional import. |
| 2 | A `?c=` value with non-digit characters is rejected before reaching the GraphQL query | VERIFIED | All three `+page.server.ts` files contain `/^\d+$/.test(raw) ? raw : DEFAULT_CLUB_ID` at line 7. Pattern present in `src/routes/+page.server.ts`, `src/routes/skyttere/+page.server.ts`, `src/routes/premieliste/+page.server.ts`. |
| 3 | All three route pages use `$props`, `$derived`, `$state` — no `export let` or `$:` remain | VERIFIED | grep for `export let` and `^\s*\$:` across `+page.svelte`, `skyttere/+page.svelte`, `Splash.svelte` — zero matches. All three use `$props()`, `$derived()`. `Splash.svelte` uses `$bindable(false)`. |
| 4 | premieliste route returns `error` field on API failure so UI can show distinct error state | VERIFIED | `src/routes/premieliste/+page.server.ts` line 10 returns `error: null` in success branch; lines 13-17 return `error: error instanceof Error ? error.message : 'Unknown error occurred'` in catch. Both branches typed consistently. |
| 5 | An unhandled load failure renders the Norwegian-language `+error.svelte` page | VERIFIED | `src/routes/+error.svelte` exists (23 lines). Contains exact text "Kunne ikke laste data. Sjekk nettforbindelsen og prøv igjen." at line 17. Imports `page` from `$app/state`. Renders `{page.error?.message}` conditionally. Has `href="/"` retry link. |
| 6 | `groupFeltEvents` is exported from `src/lib/utils/helpers.ts`; schedule page calls it | VERIFIED | `helpers.ts` line 103: `export function groupFeltEvents`. `+page.svelte` imports it at line 10 and calls it at line 47 inside a `$derived` block. No inline grouping algorithm remains in the page. |

**Score:** 6/6 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/server/graphql/client.ts` | Server-only GraphQL client with `$env/static/private` | VERIFIED | Exists, 12 lines. `AUTH_TOKEN` from `$env/static/private` at line 3. No `import.meta.env`. |
| `src/lib/server/graphql/queries.ts` | Three exported query functions | VERIFIED | Exports `getShootersByClub` (line 9), `getShooterWithDistinctions` (line 53), `getShootersWithDistinctions` (line 85). |
| `src/routes/+page.server.ts` | PageServerLoad with club ID validation | VERIFIED | 19 lines. `PageServerLoad`, `/^\d+$/.test`, imports from `$lib/server/graphql/queries`. |
| `src/routes/skyttere/+page.server.ts` | PageServerLoad with club ID validation | VERIFIED | 19 lines. Identical shape to schedule loader. |
| `src/routes/premieliste/+page.server.ts` | PageServerLoad with club ID validation and error field | VERIFIED | 19 lines. Returns `error: null` in success, `error: ...` in catch. |
| `src/lib/utils/helpers.ts` | Exports `groupFeltEvents` and `EventWithShooter` | VERIFIED | Lines 98-158. Plain `Set<string>` dedup, no `SvelteSet`. Existing `hasPartialResults`, `hasAllResults`, `getEventStatus` preserved. |
| `src/routes/+page.svelte` | Svelte 5 runes, calls `groupFeltEvents` | VERIFIED | `$props()` line 19, `$derived(data.shooters)` line 21, `$derived(data.error)` line 22, `$state(false)` line 24, `groupFeltEvents(shooters)` line 47. No `export let`, no `$:`. |
| `src/routes/skyttere/+page.svelte` | Svelte 5 runes, `./$types` import | VERIFIED | `$props()` line 10, `$derived` lines 12-13. Import from `./$types` line 8. No `export let`, no `$:`. |
| `src/lib/components/Splash.svelte` | `$bindable` for `show` prop | VERIFIED | Line 5: `let { show = $bindable(false) } = $props()`. No `export let`. |
| `src/routes/+error.svelte` | Norwegian error boundary, 20+ lines | VERIFIED | 23 lines. Norwegian heading, `$app/state` import, `page.error?.message`, `href="/"` link, sticky nav header. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/lib/server/graphql/client.ts` | `$env/static/private` | named import `AUTH_TOKEN` | WIRED | Line 3: `import { AUTH_TOKEN } from '$env/static/private'` |
| `src/routes/+page.server.ts` | `$lib/server/graphql/queries` | named import | WIRED | Line 2: `import { getShootersByClub } from '$lib/server/graphql/queries'` |
| `src/routes/+page.server.ts` | club ID validation | regex test | WIRED | Line 7: `/^\d+$/.test(raw) ? raw : DEFAULT_CLUB_ID` |
| `src/routes/skyttere/+page.server.ts` | `$lib/server/graphql/queries` | named import | WIRED | Line 2: same pattern |
| `src/routes/premieliste/+page.server.ts` | `$lib/server/graphql/queries` | named import | WIRED | Line 2: `getShootersWithDistinctions` |
| `src/routes/+page.svelte` | `src/lib/utils/helpers.ts` | named import `groupFeltEvents` | WIRED | Line 10 import, line 47 call inside `$derived` |
| `src/routes/+error.svelte` | `$app/state` | named import `page` | WIRED | Line 3: `import { page } from '$app/state'` |
| `src/lib/index.ts` | (barrel export removed) | no re-export | WIRED | File contains only comments; no `export { getShootersByClub }` |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `src/routes/+page.svelte` | `shooters` via `$derived(data.shooters)` | `+page.server.ts` → `getShootersByClub(clubId)` → GraphQL | Yes — live GraphQL query against `leonls.kongsberg-ts.no` | FLOWING |
| `src/routes/skyttere/+page.svelte` | `shooters` via `$derived(data.shooters)` | `skyttere/+page.server.ts` → `getShootersByClub(clubId)` → GraphQL | Yes | FLOWING |
| `src/routes/premieliste/+page.svelte` | `shootersWithDistinctions` (plain let, not `$derived`) | `premieliste/+page.server.ts` → `getShootersWithDistinctions(clubId)` | Yes — GraphQL fan-out per shooter | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| AUTH_TOKEN absent from client bundle | `grep -r "AUTH_TOKEN" .svelte-kit/output/client/` | zero matches | PASS |
| Legacy loader files deleted | file existence checks | all 5 legacy files absent | PASS |
| Club ID regex present in all loaders | `grep -n '/^\d+$/` in 3 server files | 3 matches | PASS |
| No Svelte 4 syntax in target files | `grep -E "export let\|^\s*\$:"` | zero matches | PASS |
| `groupFeltEvents` exported and imported | grep helpers.ts + +page.svelte | found at lines 103, 10, 47 | PASS |
| Error page has Norwegian text | `grep "Kunne ikke laste"` | found at line 17 | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| SEC-01 | 02-01 | AUTH_TOKEN absent from client bundle | SATISFIED | `$env/static/private` import; build output clean |
| SEC-02 | 02-01 | Club ID non-digit input rejected | SATISFIED | `/^\d+$/.test(raw)` in all 3 loaders |
| DEBT-01 | 02-02 | No `export let` or `$:` in route pages | SATISFIED | Zero matches in all three target files |
| DEBT-02 | 02-01 | premieliste returns `error` field on failure | SATISFIED | Both branches of try/catch return `error` field |
| DEBT-03 | 02-02 | `groupFeltEvents` extracted to helpers.ts | SATISFIED | Exported at line 103; called from +page.svelte |
| DEBT-04 | 02-03 | `+error.svelte` with Norwegian message | SATISFIED | File exists, 23 lines, all acceptance criteria pass |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/lib/server/graphql/client.ts` | 1 | `VITE_AUTH_TOKEN` in comment | Info | Comment-only; not a functional reference. Required by plan spec as deployment reminder. Not a stub or debt marker. |
| `src/routes/premieliste/+page.svelte` | 7 | `data.error` not consumed by template | Warning | Loader returns `error` field (DEBT-02 fixed) but premieliste page template does not currently render it. This was pre-existing before Phase 2 and is not a phase regression — the page was already on runes and was out of scope for DEBT-01 migration. No blocker. |

No `TBD`, `FIXME`, or `XXX` debt markers found in any file modified by this phase.

### Human Verification Required

#### 1. SEC-02 Runtime Fallback

**Test:** Start dev server (`yarn dev`), navigate to `/?c=abc`
**Expected:** Page loads with default club (10782) shooter data, no error, no crash
**Why human:** Regex validated in source; actual runtime URL parsing and GraphQL call require a live server

#### 2. Rune Reactivity After Refresh

**Test:** Load schedule page, click the RefreshButton in the nav
**Expected:** Data re-fetches and the shooter list updates (or stays consistent if unchanged)
**Why human:** `$derived(data.shooters)` reactivity after `invalidateAll()` cannot be verified without a running browser

#### 3. Error Boundary Activation

**Test:** Temporarily break the API endpoint (e.g. set `endpoint` to `https://invalid.example.com` in `client.ts`), rebuild, load any route
**Expected:** Sticky logo header visible, red card with "Kunne ikke laste data. Sjekk nettforbindelsen og prøv igjen.", underlying error in small muted text, "Ga til forsiden" link navigable
**Why human:** `+error.svelte` only activates when a server load function throws — requires a real browser navigation

#### 4. Splash Screen and Auto-Scroll

**Test:** Clear session storage in devtools, reload schedule page
**Expected:** Splash screen appears for ~1.5 seconds, dismisses, schedule page renders with today's date section scrolled into view
**Why human:** `sessionStorage` gating and scroll behaviour require a real browser

### Gaps Summary

No gaps. All 6 observable truths verified against actual codebase. All artifacts exist, are substantive, and are wired. Legacy files deleted. Build output clean. Four items deferred to human verification (runtime behaviour, UI interaction, error boundary activation) — standard end-of-phase manual checks.

---

_Verified: 2026-05-18_
_Verifier: Claude (gsd-verifier)_
