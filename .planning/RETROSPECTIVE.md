# Retrospective: Stordalen Skytterlag PWA

---

## Milestone: v2 — MVP Modernization

**Shipped:** 2026-05-19
**Phases:** 4 | **Plans:** 14 | **Commits:** 101

### What Was Built

1. Full dependency upgrade: patch/minor bumps → SvelteKit 2.59 → Vite 8 (Rolldown) → TypeScript 6
2. Server-only GraphQL: AUTH_TOKEN moved from client bundle to `$env/static/private`
3. Svelte 5 rune migration: all route pages and Splash component; `groupFeltEvents` extracted to helpers
4. UX redesign: bottom tab bar, solid-fill Norwegian status badges, outdoor neutral palette + monospace data
5. PWA polish: iOS safe area, pulse-bar skeleton screens, automated SW cache versioning via Vite plugin

### What Worked

- **Wave-based dependency upgrades** — Sequential isolation (kit → Vite stack → TS) made each upgrade independently bisectable. No regressions accumulated.
- **Parallel execution in execute-phase** — Wave 1 of Phase 4 ran 04-01 and 04-03 in parallel with no conflicts. Reduced wall time significantly.
- **Detailed PLAN.md task specs** — Plans with explicit line numbers, exact code blocks, and automated verify commands made executor subagents fast and accurate.
- **configResolved + buildStart closure pattern** for Vite plugin mode detection — the design decision to capture mode in closure rather than accessing it directly in buildStart avoided a Vite 8 / Rolldown pitfall.

### What Was Inefficient

- REQUIREMENTS.md checkboxes were never updated as plans completed — required manual audit at milestone close.
- 01-02 executed without producing a SUMMARY.md — gap in automation, minor but means one plan is undocumented.
- Phase 02 VERIFICATION.md `human_needed` items were acknowledged as deferred at milestone close rather than tested during development — ideally tested on device before closing.

### Patterns Established

- `$derived(data.x)` pattern for reactive server load props in Svelte 5 — more reliable than `$props()` direct destructuring
- env() CSS via inline style attribute (not Tailwind arbitrary values) for safe-area compatibility
- Vite plugin inline in `vite.config.ts` with `configResolved` + `buildStart` hooks for mode-aware file generation
- `{#if navigating}` skeleton branch as first branch inside page template — before error and content checks

### Key Lessons

- **Verify REQUIREMENTS.md after each phase** — checkboxes are easy to miss during fast execution; add a requirements-check step to phase completion
- **Test human_needed items on real device before milestone close** — deferred browser checks accumulate debt
- **Vite `define` only reaches JS modules** — cannot inject into static assets; always use a buildStart plugin for static file generation

---

## Cross-Milestone Trends

| Metric | v2 |
|--------|-----|
| Phases | 4 |
| Plans | 14 |
| Commits | 101 |
| Timeline | 2026-05-17 → 2026-05-19 (active dev) |
| Deferred human checks | 4 |
| Build breaks during execution | 0 |
