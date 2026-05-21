---
phase: 6
slug: multi-club-routing
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-21
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none — no vitest/jest installed |
| **Config file** | none |
| **Quick run command** | `yarn check` |
| **Full suite command** | `yarn lint && yarn check` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn check`
- **After every plan wave:** Run `yarn lint && yarn check`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | CLUB-01 | — | `clubs[slug]` lookup; unknown slug → error(404) | type-check | `yarn check` | ❌ Wave 0 | ⬜ pending |
| 06-01-02 | 01 | 1 | CLUB-01 | V5 | typed map prevents unknown slug silently proceeding | type-check | `yarn check` | ❌ Wave 0 | ⬜ pending |
| 06-02-01 | 02 | 1 | ROUTE-01 | — | locals.club.clubId used, not ?c= | grep | `grep -rn 'searchParams' src/routes/` | N/A | ⬜ pending |
| 06-02-02 | 02 | 1 | ROUTE-03 | — | ?c= param absent from all loaders | grep | `grep -rn 'searchParams' src/routes/` | N/A | ⬜ pending |
| 06-03-01 | 03 | 2 | CLUB-02 | — | layout renders dynamic logo/name | manual | dev server visual check | N/A | ⬜ pending |
| 06-03-02 | 03 | 2 | ROUTE-02 | — | unknown subdomain → Norwegian 404 | manual | dev server with unknown VITE_DEV_CLUB | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/clubs.ts` — create before any other file imports it
- [ ] `src/app.d.ts` — update `App.Locals` with `club: ClubConfig` before hooks.server.ts type-checks
- [ ] `.env.local` — add `VITE_DEV_CLUB=stordalen` entry (template in `.env.example`)
- [ ] `static/clubs/stordalen.jpg` — move from `src/lib/assets/stordalen.jpg`

*All other phase files depend on these Wave 0 outputs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Top bar shows dynamic club logo and alt text | CLUB-02 | No visual test framework | Dev server: visit app, inspect `<img>` src and alt in top bar |
| Unknown subdomain returns Norwegian 404 | ROUTE-02 | Requires subdomain simulation | Dev server: set `VITE_DEV_CLUB=unknown-club`, visit app, verify 404 page shows "Siden finnes ikke" |
| `?c=` param has no effect | ROUTE-03 | Runtime behavior check | Dev server: append `?c=99999` to URL, verify stordalen data still loads |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
