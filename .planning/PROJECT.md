# Stordalen Skytterlag PWA

## What This Is

A progressive web app for Stordalen Skytterlag members. Displays shooting schedule, shooter results, and prize lists — fetched from the leonls.kongsberg-ts.no GraphQL API. Used primarily on mobile at the range during competitions. Installable on iOS and Android with offline capability via service worker.

## Core Value

Shooters can instantly see today's schedule and their results on their phone at the range — no friction, no loading confusion.

## Current State (v2)

Shipped 2026-05-19. All v2 requirements complete.

- **Stack:** SvelteKit 2.59 + Svelte 5 + Vite 8 (Rolldown) + TypeScript 6 + TailwindCSS 4, deployed on Vercel
- **Security:** AUTH_TOKEN server-only via `$env/static/private`; club ID validated on all routes
- **UI:** Bottom tab navigation (Skyteplan/Skyttere/Premieliste), outdoor-optimized neutral palette, solid-fill Norwegian status badges, skeleton loading screens
- **PWA:** iOS `viewport-fit=cover` + `black-translucent`; SW cache auto-versioned per git hash (`stordalen-{7-char-hash}`)
- **Known gaps:** premieliste template doesn't render `data.error` in UI; Phase 02 has 4 deferred browser-only verification checks

## Requirements

### Validated

- ✓ Schedule view with event grouping by date — existing
- ✓ Per-shooter event list with detail — existing
- ✓ Prize list with distinctions — existing
- ✓ Pull-to-refresh and manual refresh — existing
- ✓ PWA installability with service worker — existing
- ✓ GraphQL calls moved to server-side loads (AUTH_TOKEN never in client bundle) — v2
- ✓ Club ID extracted to shared constant; `?c=` validated with `/^\d+$/` — v2
- ✓ External lsres.no link uses dynamic year — v2
- ✓ All routes migrated to Svelte 5 runes (`$props`, `$derived`, `$state`) — v2
- ✓ Unused `@sveltestack/svelte-query` removed — v2
- ✓ Dead code removed (deprecated formatters, pwa.ts duplicate logic) — v2
- ✓ Error handling consistent: `+error.svelte` Norwegian boundary + premieliste error field — v2
- ✓ Dependencies updated: SvelteKit 2.59, Vite 8, TypeScript 6 — v2
- ✓ Mobile-first visual redesign: bottom tabs, outdoor palette, solid badges, monospace data — v2
- ✓ iOS PWA meta tags: viewport-fit=cover, black-translucent, #fafafa theme-color — v2
- ✓ Skeleton loading screens on all three routes — v2
- ✓ SW cache auto-versioned per git hash via Vite plugin — v2

### Active

- [ ] premieliste UI renders `data.error` when API fails (loader returns it; template does not)
- [ ] Manual browser verification: Phase 02 deferred checks (SEC-02 runtime fallback, refresh reactivity, error boundary, splash+scroll)

### Out of Scope

| Feature | Reason |
|---------|--------|
| User login / authentication | App is read-only, single club Bearer token is sufficient |
| Multi-club support UI | `?c=` param works; no UI needed for this use case |
| Real-time / websocket scores | API is polling-based; not feasible without API owner changes |
| Native mobile app | PWA with bottom tabs and iOS meta is sufficient |
| Dark mode | Light background outperforms dark outdoors on LCD; defer until clear demand |
| Server-side batching for premieliste | Requires API owner change; N+1 pattern with Promise.all is acceptable for club scale |

## Constraints

- **API**: leonls.kongsberg-ts.no is external — cannot change API shape or add batching without owner cooperation
- **Deployment**: Vercel via @sveltejs/adapter-vercel — must stay on Vercel
- **Runtime**: Node 22.x, Yarn package manager
- **Design**: Must remain clean and legible on phones in outdoor lighting conditions

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Move GraphQL to +page.server.ts | AUTH_TOKEN inlined into client bundle is a security risk | ✓ Good — build output clean, no token in client JS |
| Remove @sveltestack/svelte-query | Unused, unmaintained (2021), Svelte 3-era package | ✓ Good — no regressions, reduced bundle size |
| Svelte 5 runes everywhere | Eliminate compat layer overhead, consistent API surface | ✓ Good — `$derived(data.x)` pattern handles server load reactivity correctly |
| Clean & minimal design | Readable at a glance outdoors; data-first, not decorative | ✓ Good — neutral palette + monospace + solid badges tested in target environment |
| Dep upgrade order: patch → kit 2.59 → Vite 8+adapter+plugin → TS 6 | Each wave independently bisectable | ✓ Good — no regression; every wave passed yarn check+build |
| No global `runes: true` — per-file `<svelte:options>` only | Avoid breaking Svelte 4 components mid-migration | ✓ Good — smooth migration |
| Vite `define` can't reach static assets — use buildStart plugin | Runtime constraint discovered during planning | ✓ Good — swVersionPlugin works correctly |
| env() CSS via inline style (not Tailwind arbitrary values) | Tailwind purge risks with env() in arbitrary values | ✓ Good — safe-area works on iOS |
| @types/node as devDependency | SvelteKit tsconfig requests Node types; needed for node:fs in vite.config.ts | ✓ Good — resolved svelte-check errors |

## Evolution

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-19 after v2 milestone*
