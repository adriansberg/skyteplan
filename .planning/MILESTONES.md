# Milestones: Stordalen Skytterlag PWA

---

## v2 — MVP Modernization

**Shipped:** 2026-05-19
**Phases:** 4 | **Plans:** 14 | **Commits:** 101
**Files changed:** 105 | **Lines added:** ~14,700

### Delivered

Full modernization of a working range-day PWA: upgraded the full dependency stack (Vite 8 / TypeScript 6 / SvelteKit 2.59), moved auth token server-side, migrated all routes to Svelte 5 runes, redesigned the UI for outdoor mobile use with bottom tab navigation, and added PWA polish (skeleton screens, iOS safe area, automated service worker versioning).

### Key Accomplishments

1. **Security** — GraphQL Bearer token moved from client bundle to `$env/static/private` server-only loaders; club ID validated with `/^\d+$/` on all routes
2. **Dependency stack** — Vite 7→8 (Rolldown), TypeScript 5→6, SvelteKit 2.22→2.59 shipped in sequential bisectable waves
3. **Svelte 5 runes** — All three route pages and `Splash.svelte` migrated from `export let`/`$:` to `$props`, `$derived`, `$state`; `groupFeltEvents` extracted to shared helper
4. **Bottom tab navigation** — Fixed 56px tab bar with Skyteplan/Skyttere/Premieliste; solid-fill Norwegian status badges (Pågår/Ferdig/Kommende/Møtte ikke)
5. **Outdoor legibility** — Neutral-50 palette, emerald-600 accent, `text-base font-semibold` data, `font-mono` times/scores; no gradients or shadows
6. **PWA polish** — Pulse-bar skeleton screens on all routes; iOS `viewport-fit=cover` + `black-translucent`; SW cache auto-versioned per git hash

### Known Deferred Items at Close: 1

Phase 02 human browser checks deferred (4 items — see STATE.md Deferred Items). All automated checks passed.

### Archive

- `.planning/milestones/v2-ROADMAP.md`
- `.planning/milestones/v2-REQUIREMENTS.md`

---

*Previous milestone: v1 (pre-modernization baseline, tagged 2025)*
