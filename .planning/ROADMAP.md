# Roadmap: Stordalen Skytterlag PWA

## Milestones

- ✅ **v2 MVP Modernization** — Phases 1–4 (shipped 2026-05-19)
- 📋 **v3 Multi-Club** — Phase 5 (planned)

## Phases

<details>
<summary>✅ v2 MVP Modernization (Phases 1–4) — SHIPPED 2026-05-19</summary>

- [x] Phase 1: Cleanup & Dependencies — 5/5 plans complete
- [x] Phase 2: Security & Tech Debt — 3/3 plans complete (2026-05-17)
- [x] Phase 3: UX Redesign — 3/3 plans complete (2026-05-19)
- [x] Phase 4: Polish — 3/3 plans complete (2026-05-19)

Full archive: `.planning/milestones/v2-ROADMAP.md`

</details>

### 📋 v3 Multi-Club (Planned)

- [ ] Phase 5: Multi-Club Support

**Goal:** App is deployable for any rifle club via subdomain routing and a static club config file. No club-specific code or branding hardcoded.

**Requirements:** MC-01, MC-02, MC-03, MC-04, MC-05

**Scope:**
- `src/lib/clubs.ts` — static map of `subdomain → { clubId, name, logoPath }`
- Wildcard subdomain routing: server loaders read `request.headers.get('host')`, extract subdomain, look up club
- Club name + logo rendered in top bar (logo replaces current logo placeholder)
- Unknown subdomain → Norwegian 404/landing page
- `?c=` query param retired (subdomain is the config mechanism)
- App name and domain TBD (see seed: app-name-domain)

**Depends on:** Phase 4 (complete)

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Cleanup & Dependencies | v2 | 5/5 | Complete | 2026-05-17 |
| 2. Security & Tech Debt | v2 | 3/3 | Complete | 2026-05-17 |
| 3. UX Redesign | v2 | 3/3 | Complete | 2026-05-19 |
| 4. Polish | v2 | 3/3 | Complete | 2026-05-19 |
| 5. Multi-Club Support | v3 | 0/? | Planned | — |
