---
phase: 5
slug: generic-branding
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-19
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | svelte-check + yarn build (no unit test framework) |
| **Config file** | none |
| **Quick run command** | `yarn check` |
| **Full suite command** | `yarn build && grep -rn "Stordalen Skytterlag" src/ static/manifest.json` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn check`
- **After every plan wave:** Run `yarn build`
- **Before `/gsd:verify-work`:** Full suite green + grep confirms zero "Stordalen Skytterlag" in src/ and static/manifest.json

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | BRAND-01 | — | N/A | smoke (grep) | `grep -rn "Stordalen Skytterlag" src/ static/manifest.json && echo FAIL \|\| echo PASS` | n/a | ⬜ pending |
| 05-01-02 | 01 | 1 | BRAND-01 | — | N/A | type-check | `yarn check` | existing | ⬜ pending |
| 05-01-03 | 01 | 1 | BRAND-01 | — | N/A | build smoke | `yarn build` | existing | ⬜ pending |
| 05-02-01 | 02 | 1 | BRAND-02 | — | N/A | manual | inspect README or PROJECT.md for domain prereq note | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Domain prerequisite note written to README or PROJECT.md — covers BRAND-02 (content task, not a test stub)

*All other phase behaviors verified by existing infrastructure (yarn check, yarn build, grep).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Domain prereq note exists with correct DNS instructions | BRAND-02 | Docs content; no automated file-content spec | Open README or PROJECT.md, confirm section exists with chosen domain + wildcard DNS note |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
