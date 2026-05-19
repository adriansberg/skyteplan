---
phase: 2
slug: security-tech-debt
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-18
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no test suite; validation via build + static grep |
| **Config file** | none |
| **Quick run command** | `yarn check` |
| **Full suite command** | `yarn check && yarn build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn check`
- **After every plan wave:** Run `yarn check && yarn build`
- **Before `/gsd:verify-work`:** Full suite must be green + manual SEC-01 bundle grep + SEC-02 browser test
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| SEC-01 server migration | 01 | 1 | SEC-01 | T-2-01 | AUTH_TOKEN absent from client bundle | Build artifact grep | `yarn build && ! grep -r "AUTH_TOKEN" .svelte-kit/output/client/ && echo "SEC-01 PASS"` | ❌ W0: run after build | ⬜ pending |
| SEC-02 club ID validation | 01 | 1 | SEC-02 | — | Non-digit ?c= falls back silently | Manual browser | — | Manual | ⬜ pending |
| DEBT-01 rune migration | 02 | 1 | DEBT-01 | — | N/A | Static grep | `grep -rn "export let\|\$:" src/routes/+page.svelte src/routes/skyttere/+page.svelte src/lib/components/Splash.svelte` | ❌ W0: run after migration | ⬜ pending |
| DEBT-02 error field | 01 | 1 | DEBT-02 | — | N/A | Type check | `yarn check` | ✅ via yarn check | ⬜ pending |
| DEBT-03 groupFeltEvents | 02 | 1 | DEBT-03 | — | N/A | Static grep | `grep -n "groupFelt\|Felt" src/routes/+page.svelte` (template use only, no logic) | Manual | ⬜ pending |
| DEBT-04 error page | 03 | 2 | DEBT-04 | — | N/A | File + grep | `grep "Kunne ikke laste" src/routes/+error.svelte` | ❌ W0: file must be created | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] No test framework to install — build + grep is the validation mechanism
- [ ] SEC-01 bundle check: `yarn build && ! grep -r "AUTH_TOKEN" .svelte-kit/output/client/ && echo "SEC-01 PASS"`
- [ ] DEBT-01 static grep runs after rune migration tasks complete
- [ ] DEBT-04 file existence check: `test -f src/routes/+error.svelte && grep -q "Kunne ikke laste" src/routes/+error.svelte`

*Existing `yarn check` infrastructure covers DEBT-02 automatically.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Non-digit `?c=` falls back silently | SEC-02 | No test suite; URL param validation is server-side | Open `/?c=abc` in browser; verify page loads normally with default club data |
| Felt grouping logic removed from pages | DEBT-03 | Behavioral correctness requires visual inspection | Load schedule page; verify Felt events still group correctly with sub-events |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
