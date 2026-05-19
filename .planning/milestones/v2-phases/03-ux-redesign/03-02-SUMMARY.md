---
plan_id: 03-02
phase: 03-ux-redesign
status: completed
completed_date: 2026-05-19
requirements: [UX-03]
files_modified:
  - src/lib/components/EventStatusBadge.svelte
commit: 3dc2b89
---

# Phase 03 Plan 02: EventStatusBadge Solid-Fill Norwegian Pills

Replaced pastel/emoji badge variants with solid-fill pills carrying Norwegian text labels.

## What Changed

`src/lib/components/EventStatusBadge.svelte` — template block only (lines 15-39). Script block (Props interface + `$derived(getEventStatus(event))`) preserved unchanged.

| Status | Old | New |
|--------|-----|-----|
| completed | `bg-green-100 text-green-800` + `✓` | `bg-slate-600 text-white` "Ferdig" |
| ongoing | `bg-yellow-100 text-yellow-800 animate-pulse` + `🎯` | `bg-emerald-600 text-white animate-pulse` "Pågår" |
| did_not_start | `bg-red-100 text-red-800` + `✗` | `bg-gray-400 text-white` "Møtte ikke" |
| upcoming | `bg-blue-100 text-blue-800` + `⏱️` | `bg-amber-500 text-white` "Kommende" |

## UX-03 Satisfaction

Solid fills with white text replace tinted pastels — higher contrast in outdoor/bright-sun conditions. Norwegian labels remove ambiguity of symbols. `animate-pulse` retained on ongoing variant.

## Verification

All acceptance grep gates passed. `svelte-check` — 0 errors, 2 pre-existing warnings (unrelated).

## Deviations

None — plan executed exactly as written.

## Self-Check: PASSED

- File exists: `src/lib/components/EventStatusBadge.svelte` — FOUND
- Commit `3dc2b89` — FOUND
