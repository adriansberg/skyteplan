# Roadmap: Stordalen Skytterlag PWA

## Milestones

- ✅ **v2 MVP Modernization** — Phases 1–4 (shipped 2026-05-19)
- 📋 **v3 Multi-Club** — Phases 5–6 (planned)

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

- [x] **Phase 5: Generic Branding** — Replace all hardcoded "Stordalen Skytterlag" strings; choose and document app name; document domain registration as a manual prerequisite (completed 2026-05-21)
- [ ] **Phase 6: Multi-Club Routing** — Implement clubs.ts config, resolve club from host header in all server loaders, render dynamic club name + logo in top bar, Norwegian 404 for unknown subdomain, retire ?c= param

## Phase Details

### Phase 5: Generic Branding
**Goal**: App carries no club-specific identity in code — all hardcoded "Stordalen Skytterlag" strings replaced with a chosen generic app name, and domain registration prerequisites are documented
**Depends on**: Phase 4 (complete)
**Requirements**: BRAND-01, BRAND-02
**Success Criteria** (what must be TRUE):
  1. Browser tab title and PWA install banner show the generic app name, not "Stordalen Skytterlag"
  2. manifest.json `name` and `short_name` fields contain the generic app name
  3. README and any other documentation files contain no hardcoded "Stordalen Skytterlag" in user-facing headings or descriptions
  4. A documented note (in README or PROJECT.md) states the chosen domain and that wildcard DNS must be configured before Phase 6 goes live — no code change required to fulfill this
**Plans**: 2 plans
Plans:
- [x] 05-01-PLAN.md — Rename all user-facing "Stordalen Skytterlag" / "Stordalen" strings to "Skytterappen" across PWA manifest, app.html, route titles, layout/error/splash alts, and the service-worker cache prefix (regenerate static/sw.js)
- [x] 05-02-PLAN.md — Replace default SvelteKit scaffold README with a project-specific README naming the app as "Skytterappen" and documenting the wildcard DNS + Vercel wildcard domain prerequisites for Phase 6 (BRAND-02)

### Phase 6: Multi-Club Routing
**Goal**: Any configured rifle club can use the app under its own subdomain — club resolved server-side from host header, no query params, unknown subdomain gets a Norwegian error page
**Depends on**: Phase 5
**Requirements**: CLUB-01, CLUB-02, ROUTE-01, ROUTE-02, ROUTE-03
**Success Criteria** (what must be TRUE):
  1. `src/lib/clubs.ts` exports a typed static map; adding a new club requires only one entry in that file
  2. Visiting `stordalen.example.app` shows "Stordalen Skytterlag" in the top bar with correct logo; visiting `myclub.example.app` shows that club's name and logo
  3. Visiting an unconfigured subdomain (e.g. `unknown.example.app`) returns a Norwegian-language error page — not a blank screen or JS exception
  4. `?c=` query param is absent from all loader code; appending `?c=12345` to any URL has no effect on which club loads
  5. All three route loaders (schedule, shooters, premieliste) derive club ID from the host header, not from query params
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Cleanup & Dependencies | v2 | 5/5 | Complete | 2026-05-17 |
| 2. Security & Tech Debt | v2 | 3/3 | Complete | 2026-05-17 |
| 3. UX Redesign | v2 | 3/3 | Complete | 2026-05-19 |
| 4. Polish | v2 | 3/3 | Complete | 2026-05-19 |
| 5. Generic Branding | v3 | 2/2 | Complete   | 2026-05-21 |
| 6. Multi-Club Routing | v3 | 0/? | Not started | — |
