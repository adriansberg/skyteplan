# Roadmap: Stordalen Skytterlag PWA

## Milestones

- ✅ **v2 MVP Modernization** — Phases 1–4 (shipped 2026-05-19)
- ✅ **v3 Multi-Club** — Phases 5–6 (code-complete 2026-05-26; go-live pending BRAND-02 domain registration)

## Phases

<details>
<summary>✅ v2 MVP Modernization (Phases 1–4) — SHIPPED 2026-05-19</summary>

- [x] Phase 1: Cleanup & Dependencies — 5/5 plans complete
- [x] Phase 2: Security & Tech Debt — 3/3 plans complete (2026-05-17)
- [x] Phase 3: UX Redesign — 3/3 plans complete (2026-05-19)
- [x] Phase 4: Polish — 3/3 plans complete (2026-05-19)

Full archive: `.planning/milestones/v2-ROADMAP.md`

</details>

### ✅ v3 Multi-Club (Code-complete 2026-05-26)

- [x] **Phase 5: Generic Branding** — Replace all hardcoded "Stordalen Skytterlag" strings; choose and document app name; document domain registration as a manual prerequisite (completed 2026-05-21)
- [x] **Phase 6: Multi-Club Routing** — Implement clubs.ts config, resolve club from host header in all server loaders, render dynamic club name + logo in top bar, Norwegian 404 for unknown subdomain, retire ?c= param (completed 2026-05-26)

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

**Plans**: 3 plans
**UI hint**: yes
Plans:
**Wave 1**

- [ ] 06-01-PLAN.md — Foundation: create clubs.ts typed map, extend App.Locals, move stordalen logo to static/clubs/, scaffold .env files

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 06-02-PLAN.md — Server resolution: hooks.server.ts, +layout.server.ts, refactor three +page.server.ts loaders to read locals.club, delete constants.ts

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 06-03-PLAN.md — UI wiring + verification: +layout.svelte consumes data.club, +error.svelte uses static favicon fallback, human-verify three subdomain scenarios

## Backlog

### Phase 999.1: Facebook post drafting (semi-manual, text-only) (BACKLOG)

**Goal:** Club member can generate ready-to-post Facebook text in the app and post it manually — no auto-posting, no Meta app review, no server token, no cron. Keeps a human gate on partial/late API data and fits the current all-client-loader architecture.

**Scope (decided during ideation):**
- New route generates shareable **plain text** (no images — added manually if wanted) with copy-to-clipboard + `navigator.share()`.
- Two post types: (1) **morning post** listing today's shooters grouped by relay/time; (2) **end-of-day summary** of all results.
- Build post-text composition as a **pure function** so a future automation upgrade (Vercel Cron + `+server.ts` + Page Access Token) can reuse it without rewrite.
- Reuses existing `+page.ts` club-by-id loaders, `formatters.ts`, and `getEventStatus()`.

**Why semi-manual (rejected alternatives):**
- Fully automated cron posting requires Meta app review + business verification (weeks) + a server-side Page token, and risks auto-publishing partial/late results. Not worth it for a small club.
- "Day closes" has no server trigger in manual mode — end-of-day summary is whatever a member opens after the last relay. Acceptable; only cron gives true timed posting (future upgrade path).

**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready)

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Cleanup & Dependencies | v2 | 5/5 | Complete | 2026-05-17 |
| 2. Security & Tech Debt | v2 | 3/3 | Complete | 2026-05-17 |
| 3. UX Redesign | v2 | 3/3 | Complete | 2026-05-19 |
| 4. Polish | v2 | 3/3 | Complete | 2026-05-19 |
| 5. Generic Branding | v3 | 2/2 | Complete   | 2026-05-21 |
| 6. Multi-Club Routing | v3 | 3/3 | Complete | 2026-05-26 |
