# Requirements: Stordalen Skytterlag PWA

**Defined:** 2026-05-17
**Core Value:** Shooters can instantly see today's schedule and their results on their phone at the range — no friction, no loading confusion.

## v1 Requirements

### Cleanup

- [x] **CLEAN-01**: Unused `@sveltestack/svelte-query` removed from layout and package.json
- [x] **CLEAN-02**: Deprecated `formatNorwegianDateLocal` and `formatNorwegianTimeLocale` functions deleted from formatters.ts
- [x] **CLEAN-03**: Duplicate install-prompt logic in `src/lib/pwa.ts` deleted (InstallPrompt.svelte is sole owner)
- [x] **CLEAN-04**: Hardcoded club ID `'10782'` extracted to a single shared constant used by all three loaders

### Security

- [ ] **SEC-01**: All GraphQL calls moved to `+page.server.ts` server-only loaders; `AUTH_TOKEN` read from `$env/static/private` and never present in client bundle
- [ ] **SEC-02**: Club ID from `?c=` query param validated against `/^\d+$/` before passing to GraphQL query
- [x] **SEC-03**: External lsres.no link URL uses `new Date().getFullYear()` instead of hardcoded `2025`

### Dependencies

- [ ] **DEPS-01**: All patch/minor dependency bumps applied (svelte, svelte-check, graphql-request, eslint, prettier, @vercel/analytics)
- [x] **DEPS-02**: SvelteKit bumped from 2.22 to 2.59 (required prerequisite for Vite 8)
- [x] **DEPS-03**: Vite bumped from 7 to 8 and `@sveltejs/adapter-vercel` bumped to 6; vite.config.ts updated for Rolldown/renamed config keys; build passes
- [x] **DEPS-04**: TypeScript bumped from 5 to 6; tsconfig updated for new `types` defaults; type-check passes

### Tech Debt

- [ ] **DEBT-01**: `src/routes/+page.svelte`, `src/routes/skyttere/+page.svelte`, and `src/lib/components/Splash.svelte` migrated from Svelte 4 (`export let`, `$:`) to Svelte 5 runes (`$props`, `$derived`, `$state`)
- [ ] **DEBT-02**: `src/routes/premieliste/+page.ts` returns an `error` field on failure so the UI can distinguish an API error from genuinely empty results
- [ ] **DEBT-03**: Felt event grouping / sub-event collapsing logic extracted from `+page.svelte` and `skyttere/+page.svelte` into a shared helper in `src/lib/utils/helpers.ts`
- [ ] **DEBT-04**: `src/routes/+error.svelte` added with a Norwegian-language error message covering unhandled load failures

### UX Redesign

- [x] **UX-01**: Fixed bottom tab bar replaces top navigation; tabs: Skyteplan / Skyttere / Premieliste; 56px height + `env(safe-area-inset-bottom)` for iOS; touch targets ≥ 44px
- [ ] **UX-02**: Outdoor-optimized color and typography applied globally: `neutral-50`/`neutral-900` base, `emerald-600` accent, minimum `text-base font-semibold` for data, monospace for times and scores, no gradients or box shadows
- [ ] **UX-03**: Status badges replaced with solid-fill pills across all views: green pulse (Pågår), slate (Ferdig), amber (Kommende), gray (Møtte ikke)
- [ ] **UX-04**: Schedule view has sticky date section headers; today's section header shows "I dag" label; page auto-scrolls to today's section on load

### Polish

- [ ] **POL-01**: Skeleton loading screens shown on initial data load across all three routes instead of blank white
- [ ] **POL-02**: iOS PWA meta tags set: `viewport-fit=cover`, `apple-mobile-web-app-status-bar-style: black-translucent`, `apple-mobile-web-app-capable: yes`
- [ ] **POL-03**: Service worker cache name automated via Vite plugin injecting git hash at build time; `activate` handler evicts all caches except the current version

## v2 Requirements

### Future Enhancements

- **FEAT-01**: "My name" filter — user can pin their own name to see personal results first
- **FEAT-02**: Density toggle — compact vs comfortable row height for different screen sizes
- **FEAT-03**: Haptic feedback on pull-to-refresh
- **FEAT-04**: Dynamic date range in GraphQL query (current year ± N) instead of hardcoded 2017–2030
- **FEAT-05**: API result limit raised or paginated (current cap: 100 shooters)

## Out of Scope

| Feature | Reason |
|---------|--------|
| User login / authentication | App is read-only, single club Bearer token is sufficient |
| Multi-club UI | `?c=` param works; no UI needed for this use case |
| Real-time / websocket scores | API is polling-based; not feasible without API owner changes |
| Native mobile app | PWA with bottom tabs and iOS meta is sufficient |
| Dark mode | Light background outperforms dark outdoors on LCD; defer until clear demand |
| Server-side batching for premieliste | Requires API owner change; N+1 pattern with Promise.all is acceptable for club scale |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CLEAN-01 | Phase 1 | Complete |
| CLEAN-02 | Phase 1 | Complete |
| CLEAN-03 | Phase 1 | Complete |
| CLEAN-04 | Phase 1 | Complete |
| SEC-01 | Phase 2 | Pending |
| SEC-02 | Phase 2 | Pending |
| SEC-03 | Phase 1 | Complete |
| DEPS-01 | Phase 1 | Pending |
| DEPS-02 | Phase 1 | Complete |
| DEPS-03 | Phase 1 | Complete |
| DEPS-04 | Phase 1 | Complete |
| DEBT-01 | Phase 2 | Pending |
| DEBT-02 | Phase 2 | Pending |
| DEBT-03 | Phase 2 | Pending |
| DEBT-04 | Phase 2 | Pending |
| UX-01 | Phase 3 | Complete |
| UX-02 | Phase 3 | Pending |
| UX-03 | Phase 3 | Pending |
| UX-04 | Phase 3 | Pending |
| POL-01 | Phase 4 | Pending |
| POL-02 | Phase 4 | Pending |
| POL-03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-17*
*Last updated: 2026-05-17 after initial definition*
