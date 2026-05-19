# Requirements: Stordalen Skytterlag PWA

**Defined:** 2026-05-19
**Core Value:** Shooters can instantly see today's schedule and their results on their phone at the range — no friction, no loading confusion.

## v3 Requirements

Requirements for v3 Multi-Club milestone. Each maps to roadmap phases.

### Branding & Identity

- [ ] **BRAND-01**: User sees a generic app name (not "Stordalen Skytterlag") in manifest.json, browser tab title, and README
- [ ] **BRAND-02**: App domain is registered with wildcard subdomain support; clubs.ts subdomain keys match the domain pattern

### Club Configuration

- [ ] **CLUB-01**: `src/lib/clubs.ts` defines a static map of subdomain → `{ clubId, name, logoPath }` for all initial clubs
- [ ] **CLUB-02**: Club name and logo render in top bar, resolved dynamically per subdomain at server load time

### Routing & Server

- [ ] **ROUTE-01**: All server loaders resolve the active club from the HTTP host header instead of `?c=` query param
- [ ] **ROUTE-02**: Unknown or unconfigured subdomain returns a Norwegian 404 page (not a JS error or blank screen)
- [ ] **ROUTE-03**: `?c=` query param removed from all loaders and no longer accepted

## Future Requirements

No future requirements identified for this milestone.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Dynamic club management UI | `clubs.ts` is the single source of truth; no admin panel needed |
| Club-specific themes or color schemes | One shared outdoor-optimized design for all clubs |
| API batching for premieliste | Requires API owner change; N+1 with Promise.all acceptable at club scale |
| Real-time / websocket scores | API is polling-based; not feasible without API owner changes |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BRAND-01 | Phase 5 | Pending |
| BRAND-02 | Phase 5 | Pending |
| CLUB-01 | Phase 5 | Pending |
| CLUB-02 | Phase 6 | Pending |
| ROUTE-01 | Phase 6 | Pending |
| ROUTE-02 | Phase 6 | Pending |
| ROUTE-03 | Phase 6 | Pending |

**Coverage:**
- v3 requirements: 7 total
- Mapped to phases: 7
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-19*
*Last updated: 2026-05-19 after initial definition*
