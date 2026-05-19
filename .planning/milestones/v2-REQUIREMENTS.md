# Requirements Archive: v2 Milestone

**Archived:** 2026-05-19
**Milestone:** v2 MVP Modernization
**Status:** All 22 v1 requirements shipped

---

## v1 Requirements (All Complete)

### Cleanup

- [x] **CLEAN-01**: Unused `@sveltestack/svelte-query` removed from layout and package.json — ✓ v2
- [x] **CLEAN-02**: Deprecated `formatNorwegianDateLocal` and `formatNorwegianTimeLocale` functions deleted from formatters.ts — ✓ v2
- [x] **CLEAN-03**: Duplicate install-prompt logic in `src/lib/pwa.ts` deleted (InstallPrompt.svelte is sole owner) — ✓ v2
- [x] **CLEAN-04**: Hardcoded club ID `'10782'` extracted to a single shared constant used by all three loaders — ✓ v2

### Security

- [x] **SEC-01**: All GraphQL calls moved to `+page.server.ts` server-only loaders; `AUTH_TOKEN` read from `$env/static/private` and never present in client bundle — ✓ v2
- [x] **SEC-02**: Club ID from `?c=` query param validated against `/^\d+$/` before passing to GraphQL query — ✓ v2
- [x] **SEC-03**: External lsres.no link URL uses `new Date().getFullYear()` instead of hardcoded `2025` — ✓ v2

### Dependencies

- [x] **DEPS-01**: All patch/minor dependency bumps applied (svelte, svelte-check, graphql-request, eslint, prettier, @vercel/analytics) — ✓ v2
- [x] **DEPS-02**: SvelteKit bumped from 2.22 to 2.59 — ✓ v2
- [x] **DEPS-03**: Vite bumped from 7 to 8 and `@sveltejs/adapter-vercel` bumped to 6 — ✓ v2
- [x] **DEPS-04**: TypeScript bumped from 5 to 6 — ✓ v2

### Tech Debt

- [x] **DEBT-01**: `+page.svelte`, `skyttere/+page.svelte`, and `Splash.svelte` migrated to Svelte 5 runes — ✓ v2
- [x] **DEBT-02**: `premieliste/+page.ts` returns `error` field on failure — ✓ v2
- [x] **DEBT-03**: Felt event grouping extracted from `+page.svelte` into `groupFeltEvents` in helpers.ts — ✓ v2
- [x] **DEBT-04**: `+error.svelte` with Norwegian-language error message — ✓ v2

### UX Redesign

- [x] **UX-01**: Fixed bottom tab bar with Skyteplan / Skyttere / Premieliste tabs; 56px + safe-area-inset-bottom — ✓ v2
- [x] **UX-02**: Outdoor-optimized palette: neutral-50/neutral-900 base, emerald-600 accent, text-base font-semibold data, font-mono times/scores — ✓ v2
- [x] **UX-03**: Status badges solid-fill pills: Pågår (emerald), Ferdig (slate), Kommende (amber), Møtte ikke (gray) — ✓ v2
- [x] **UX-04**: Sticky date section headers; "I dag" label today; auto-scroll to today on load — ✓ v2

### Polish

- [x] **POL-01**: Skeleton loading screens on all three routes via `{#if navigating}` — ✓ v2
- [x] **POL-02**: iOS meta tags: `viewport-fit=cover`, `black-translucent`, `#fafafa` theme-color — ✓ v2
- [x] **POL-03**: SW cache name automated via Vite plugin injecting git hash — ✓ v2

---

## v2 Requirements (Carry Forward)

### Future Enhancements

- **FEAT-01**: "My name" filter — user can pin their own name to see personal results first
- **FEAT-02**: Density toggle — compact vs comfortable row height for different screen sizes
- **FEAT-03**: Haptic feedback on pull-to-refresh
- **FEAT-04**: Dynamic date range in GraphQL query (current year ± N) instead of hardcoded 2017–2030
- **FEAT-05**: API result limit raised or paginated (current cap: 100 shooters)

---

## Traceability

| Requirement | Phase | Final Status | Notes |
|-------------|-------|--------------|-------|
| CLEAN-01 | Phase 1 | ✓ Complete | |
| CLEAN-02 | Phase 1 | ✓ Complete | |
| CLEAN-03 | Phase 1 | ✓ Complete | |
| CLEAN-04 | Phase 1 | ✓ Complete | |
| SEC-01 | Phase 2 | ✓ Complete | AUTH_TOKEN confirmed absent from client bundle |
| SEC-02 | Phase 2 | ✓ Complete | Runtime fallback deferred to manual browser test |
| SEC-03 | Phase 1 | ✓ Complete | |
| DEPS-01 | Phase 1 | ✓ Complete | |
| DEPS-02 | Phase 1 | ✓ Complete | |
| DEPS-03 | Phase 1 | ✓ Complete | |
| DEPS-04 | Phase 1 | ✓ Complete | |
| DEBT-01 | Phase 2 | ✓ Complete | |
| DEBT-02 | Phase 2 | ✓ Complete | Loader fixed; template rendering of error deferred |
| DEBT-03 | Phase 2 | ✓ Complete | |
| DEBT-04 | Phase 2 | ✓ Complete | |
| UX-01 | Phase 3 | ✓ Complete | |
| UX-02 | Phase 3 | ✓ Complete | |
| UX-03 | Phase 3 | ✓ Complete | |
| UX-04 | Phase 3 | ✓ Complete | |
| POL-01 | Phase 4 | ✓ Complete | |
| POL-02 | Phase 4 | ✓ Complete | |
| POL-03 | Phase 4 | ✓ Complete | |

---

*Archived: 2026-05-19 after v2 milestone close*
