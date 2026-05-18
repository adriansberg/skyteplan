# Phase 3: UX Redesign - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-18
**Phase:** 3-ux-redesign
**Areas discussed:** Top header disposition, RefreshButton placement, Active tab style

---

## Top Header Disposition

| Option | Description | Selected |
|--------|-------------|----------|
| Slim top bar | Keep minimal sticky top bar: logo only + RefreshButton. ~40px. | ✓ |
| Remove entirely | No top bar. Logo in per-page content (scrolls). | |

**User's choice:** Slim top bar
**Notes:** Two-zone layout: slim top for logo+refresh, 56px bottom for nav tabs.

---

## RefreshButton Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Top bar | Stays in slim top header. Permanent visible control. | ✓ |
| Pull-to-refresh only | Remove RefreshButton entirely. | |

**User's choice:** Top bar
**Notes:** RefreshButton stays in the slim sticky top bar alongside logo.

---

## Active Tab Style

| Option | Description | Selected |
|--------|-------------|----------|
| Top border + emerald text | 2px emerald-600 top border + emerald-600 text. Inactive: neutral-500. | ✓ |
| emerald-50 fill + emerald text | Very light emerald-50 bg fill + emerald-700 text. | |
| Bold label only | font-bold + neutral-900 active. Pure typography. | |

**User's choice:** Top border + emerald text
**Notes:** No fill, no gradient, no shadow — just border-t-2 + text color change. Crisp in outdoor light.

---

## Claude's Discretion

- RefreshButton internals: unchanged, reposition only
- Route transitions: none needed
- Bottom tab bar top border: Claude picks
- Emoji removal from tabs: plain text labels or simple SVG icons — Claude's call

## Deferred Ideas

None — discussion stayed within phase scope.
