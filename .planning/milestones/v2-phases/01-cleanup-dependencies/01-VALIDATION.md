---
phase: 1
slug: cleanup-dependencies
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-17
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | svelte-check + tsc + yarn build |
| **Config file** | tsconfig.json, svelte.config.js |
| **Quick run command** | `yarn check` |
| **Full suite command** | `yarn check && yarn build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn check`
- **After every plan wave:** Run `yarn check && yarn build`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| CLEAN-01 | 01 | 1 | CLEAN-01 | — | N/A | grep | `! grep -r "svelte-query" src/` | ✅ | ⬜ pending |
| CLEAN-02 | 01 | 1 | CLEAN-02 | — | N/A | grep | `! grep -n "formatNorwegianDateLocal\|formatNorwegianTimeLocale" src/` | ✅ | ⬜ pending |
| CLEAN-03 | 01 | 1 | CLEAN-03 | — | N/A | grep | `! grep -n "beforeinstallprompt\|appinstalled" src/lib/pwa.ts` | ✅ | ⬜ pending |
| CLEAN-04 | 01 | 1 | CLEAN-04 | — | N/A | grep | `grep -r "10782" src/ \| wc -l` = 1 | ✅ | ⬜ pending |
| SEC-03 | 01 | 1 | SEC-03 | — | N/A | grep | `! grep -rn "2025" src/lib/components/ShooterExternalLink.svelte` | ✅ | ⬜ pending |
| DEPS-01 | 02 | 1 | DEPS-01 | — | N/A | build | `yarn check && yarn build` | ✅ | ⬜ pending |
| DEPS-02 | 02 | 2 | DEPS-02 | — | N/A | build | `yarn check && yarn build` | ✅ | ⬜ pending |
| DEPS-03 | 02 | 3 | DEPS-03 | — | N/A | build | `yarn check && yarn build` | ✅ | ⬜ pending |
| DEPS-04 | 02 | 4 | DEPS-04 | — | N/A | build | `yarn check && yarn build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework installation needed — verification is via type-check, build, and grep commands.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Vercel deployment still works after adapter-vercel 6 upgrade | DEPS-03 | Requires live Vercel deploy | Run `vercel --prod` and confirm deployment succeeds |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
