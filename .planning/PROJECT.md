# Stordalen Skytterlag PWA

## What This Is

A progressive web app for Stordalen Skytterlag members. Displays shooting schedule, shooter results, and prize lists — fetched from the leonls.kongsberg-ts.no GraphQL API. Used primarily on mobile at the range during competitions.

## Core Value

Shooters can instantly see today's schedule and their results on their phone at the range — no friction, no loading confusion.

## Requirements

### Validated

- ✓ Schedule view with event grouping by date — existing
- ✓ Per-shooter event list with detail — existing
- ✓ Prize list with distinctions — existing
- ✓ Pull-to-refresh and manual refresh — existing
- ✓ PWA installability with service worker — existing

### Active

- [ ] GraphQL calls moved to server-side loads (auth token never in client bundle)
- [ ] Club ID extracted to shared constant
- [ ] External lsres.no link uses dynamic year
- [ ] Svelte 4 components migrated to Svelte 5 runes
- [ ] Unused @sveltestack/svelte-query removed
- [ ] Dead code removed (deprecated formatters, pwa.ts duplicate logic)
- [ ] Error handling consistent across all routes
- [ ] Dependencies updated to latest major versions
- [ ] Mobile-first visual redesign: clean & minimal, large touch targets, readable at a glance

### Out of Scope

- User authentication / login — app is club-wide, single read-only token
- Multi-club support UI — ?c= param works, no UI needed
- Real-time scores — API is polling-based, no websocket
- Native mobile app — PWA is sufficient

## Context

- Brownfield SvelteKit 2.x / Svelte 5.x PWA deployed on Vercel
- GraphQL backend: leonls.kongsberg-ts.no (external, not owned)
- Auth: single Bearer token — currently exposed in client JS bundle (VITE_AUTH_TOKEN), must move to server
- Mixed Svelte 4/5 syntax across pages — Svelte 5 runes preferred going forward
- Three routes: / (schedule), /skyttere (shooters), /premieliste (prize list)
- Codebase map: .planning/codebase/ (analyzed 2026-05-17)

## Constraints

- **API**: leonls.kongsberg-ts.no is external — cannot change API shape or add batching without owner cooperation
- **Deployment**: Vercel via @sveltejs/adapter-vercel — must stay on Vercel
- **Runtime**: Node 22.x, Yarn package manager
- **Design**: Must remain clean and legible on phones in outdoor lighting conditions

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Move GraphQL to +page.server.ts | VITE_AUTH_TOKEN inlined into client bundle is a security risk | — Pending |
| Remove @sveltestack/svelte-query | Unused, unmaintained (2021), Svelte 3-era package | — Pending |
| Svelte 5 runes everywhere | Eliminate compat layer overhead, consistent API surface | — Pending |
| Clean & minimal design | Readable at a glance outdoors; data-first, not decorative | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-17 after initialization*
