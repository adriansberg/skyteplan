---
phase: 4
slug: polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-19
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | svelte-check + vite build (no vitest configured) |
| **Config file** | svelte.config.js / vite.config.ts |
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
| skeleton-schedule | 01 | 1 | POL-01 | — | N/A | build | `yarn check && yarn build` | ✅ | ⬜ pending |
| skeleton-skyttere | 01 | 1 | POL-01 | — | N/A | build | `yarn check && yarn build` | ✅ | ⬜ pending |
| skeleton-premieliste | 01 | 1 | POL-01 | — | N/A | build | `yarn check && yarn build` | ✅ | ⬜ pending |
| ios-meta | 02 | 1 | POL-02 | — | N/A | manual | — | ✅ | ⬜ pending |
| css-safe-area | 02 | 1 | POL-02 | — | N/A | build | `yarn check && yarn build` | ✅ | ⬜ pending |
| sw-plugin | 03 | 1 | POL-03 | — | N/A | build | `yarn build && grep -E 'stordalen-[a-f0-9]{7}' static/sw.js` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements — no test file stubs needed.
All automated verification uses `yarn check` (type check) and `yarn build` (build output).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| No white gap at top/bottom on iOS PWA | POL-02 | Requires physical iOS device or Simulator with "Add to Home Screen" | 1. Build and deploy. 2. Add to iOS Home Screen. 3. Launch: confirm status bar overlays top bar (no white gap). 4. Confirm no content obscured behind status bar (safe area padding visible). |
| Skeleton animation visible on tab nav | POL-01 | Visual; `navigating` is null during SSR so skeleton never appears on first load | 1. Load app. 2. Tap between tabs rapidly. 3. Confirm pulse bars appear during transition. |
| SW cache evicts old versions | POL-03 | Requires two sequential deploys to observe eviction | 1. Deploy v1. 2. Open app (SW v1 activates). 3. Deploy v2 (new git hash). 4. Hard-reload. 5. Confirm only current cache name survives in DevTools > Application > Cache Storage. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
