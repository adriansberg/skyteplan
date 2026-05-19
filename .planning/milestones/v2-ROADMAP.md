# Milestone v2: MVP Modernization

**Status:** ✅ SHIPPED 2026-05-19
**Phases:** 1–4
**Total Plans:** 14
**Git range:** v1..v2

## Overview

Full modernization of the Stordalen Skytterlag PWA: dependency stack upgraded to Vite 8 / TypeScript 6 / SvelteKit 2.59, auth token moved server-side, all routes migrated to Svelte 5 runes, mobile UI redesigned for outdoor legibility with bottom tab navigation, and PWA polish (skeletons, iOS safe area, automated SW versioning) shipped.

## Phases

### Phase 1: Cleanup & Dependencies

**Goal:** App builds cleanly on the target dependency stack with all dead code removed
**Plans:** 5 plans (4 with summaries — 01-02 executed without summary)

Plans:
- [x] 01-01: Remove svelte-query, deprecated formatters, duplicate pwa.ts logic; centralize club ID constant; apply dynamic year to external link
- [x] 01-02: Patch/minor bumps (svelte 5.55.7, svelte-check, eslint, prettier, graphql-request, @vercel/analytics)
- [x] 01-03: @sveltejs/kit 2.22 → 2.59.1
- [x] 01-04: Vite 7→8, vite-plugin-svelte 6→7, adapter-vercel 5→6
- [x] 01-05: TypeScript 5 → 6.0.3

**Key outcomes:**
- Phase 1 target stack complete: SvelteKit 2.59.1 + Vite 8.0.13 (Rolldown) + TypeScript 6.0.3
- `DEFAULT_CLUB_ID` constant centralized; `@sveltestack/svelte-query` removed
- `.prettierignore` excludes `.planning/` and `.claude/`

### Phase 2: Security & Tech Debt

**Goal:** Auth token is server-only and all three routes have consistent, rune-based implementations
**Plans:** 3 plans

Plans:
- [x] 02-01: Create `$lib/server/graphql/`, rename loaders to `+page.server.ts`, validate `?c=` with `/^\d+$/`, add error field to premieliste loader
- [x] 02-02: Extract `groupFeltEvents` to helpers, migrate `+page.svelte`, `skyttere/+page.svelte`, and `Splash.svelte` to Svelte 5 runes
- [x] 02-03: Create `+error.svelte` with Norwegian message and retry link

**Key outcomes:**
- AUTH_TOKEN absent from client bundle (confirmed via build output grep)
- All three routes on `$props`, `$derived`, `$state` — no `export let` or `$:` remain
- premieliste returns `error` field on API failure
- Norwegian error boundary covers all unhandled load failures

### Phase 3: UX Redesign

**Goal:** Users navigate the app via a bottom tab bar and read data clearly in bright outdoor light
**Plans:** 3 plans

Plans:
- [x] 03-01: Slim 40px top bar, new `BottomTabBar.svelte` with three Norwegian text tabs, layout `pb-16` children wrapper
- [x] 03-02: Solid-fill `EventStatusBadge` variants with Norwegian labels (Pågår/Ferdig/Kommende/Møtte ikke)
- [x] 03-03: Sticky date headers, neutral palette + `font-mono` times/scores + `text-base font-semibold` across all routes; Norwegian copy on skyttere page

**Key outcomes:**
- Fixed 56px bottom tab bar with safe-area padding on all routes
- Status badges solid-fill with Norwegian text, `animate-pulse` on ongoing
- All data text minimum `text-base font-semibold`; times/scores in `font-mono`
- Today's date section auto-scrolls into view on schedule load

### Phase 4: Polish

**Goal:** Initial load shows progress feedback, iOS installability properly configured, SW versioning automatic
**Plans:** 3 plans

Plans:
- [x] 04-01: iOS meta tags (viewport-fit=cover, black-translucent, #fafafa theme-color), `--top-bar-height` CSS variable, safe-area padding on top bar, sticky header fix
- [x] 04-02: Skeleton loading screens on all three routes using `{#if navigating}` from `$app/state`
- [x] 04-03: `sw.template.js` with `__CACHE_VERSION__` placeholder; `swVersionPlugin` Vite plugin injecting git hash at buildStart; `.gitignore` entry

**Key outcomes:**
- iOS PWA: no white gap, status bar overlays correctly with env(safe-area-inset-top) compensation
- Pulse-bar skeletons on all routes during tab navigation; SSR unaffected (navigating=null)
- Each production build gets unique `stordalen-{7-char-hash}` cache name; activate handler evicts old caches

---

## Milestone Summary

**Key Decisions:**

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Dep upgrade order: patch → kit 2.59 → Vite 8+adapter+plugin → TS 6 | Each wave independently bisectable | ✓ No regression; each wave passed yarn check+build |
| No global `runes: true` — per-file `<svelte:options>` only | Avoid breaking Svelte 4 components mid-migration | ✓ Smooth migration without compatibility surprises |
| Vite `define` can't reach `static/sw.js` — use Vite plugin at buildStart | Runtime: Vite define is for JS modules, not static assets | ✓ swVersionPlugin generates sw.js from template at every build |
| `export {}` in pwa.ts — TypeScript module semantics | TS requires at least one export for dynamic import() to treat file as module | ✓ PWA init loads correctly |
| env() CSS functions via inline style (not Tailwind arbitrary values) | Tailwind purge may strip arbitrary values with env() in non-standard contexts | ✓ safe-area-inset-top works on all tested iOS versions |
| @types/node added as devDependency | SvelteKit tsconfig requests Node types; vite.config.ts uses node:fs/node:child_process | ✓ svelte-check 0 errors after install |

**Issues Resolved:**
- AUTH_TOKEN was embedded in client JS bundle — fixed via `$env/static/private` + server loaders
- Manual SW cache name bumps (`stordalen-v1`, `stordalen-v2`) — eliminated via Vite plugin
- Blank flash during tab navigation — eliminated via `{#if navigating}` skeleton screens

**Issues Deferred to Human Verification (Phase 02):**
- SEC-02 runtime fallback: `/?c=abc` loads default club data (browser only)
- RefreshButton reactivity after `invalidateAll()` (browser only)
- `+error.svelte` activation under real network failure (browser only)
- Splash screen + auto-scroll with fresh sessionStorage (browser only)

**Technical Debt Incurred:**
- `premieliste/+page.svelte` does not render `data.error` in template despite loader returning it (pre-existing; DEBT-02 fixed the loader only)
- `VITE_AUTH_TOKEN` appears in a comment in `src/lib/server/graphql/client.ts` line 1 as deployment reminder — not a functional reference

---

*For current project status, see .planning/ROADMAP.md*
