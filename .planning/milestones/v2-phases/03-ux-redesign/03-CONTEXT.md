# Phase 3: UX Redesign - Context

**Gathered:** 2026-05-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the top nav with a bottom tab bar, apply an outdoor-optimized color palette and typography globally, replace tinted status badges with solid-fill pills, and add CSS-sticky date section headers on the schedule page. No new data fetching, no new routes — this phase changes how the existing three routes look and navigate.

</domain>

<decisions>
## Implementation Decisions

### Layout Structure (UX-01)
- **D-01:** Keep a slim sticky top bar in `+layout.svelte` — logo image only (no site name text), plus `RefreshButton` on the right. Target height ~40px, with `border-b border-neutral-200 bg-neutral-50`.
- **D-02:** Remove all three nav links (`<a href="/">`, `<a href="/skyttere">`, `<a href="/premieliste">`) from the top bar. Navigation moves entirely to a new fixed bottom tab bar component.
- **D-03:** New `BottomTabBar.svelte` component: `fixed bottom-0 left-0 right-0`, height `56px` (3.5rem) + `padding-bottom: env(safe-area-inset-bottom)`, tab touch targets ≥ 44px. Labels: **Skyteplan / Skyttere / Premieliste** (no emojis).
- **D-04:** All page content in `+layout.svelte` must have `pb-16` (or equivalent safe-area-aware padding-bottom) to prevent bottom tabs from covering content.
- **D-05:** `scroll-mt-*` values on the schedule page should be reduced to account for the slimmer top bar (was `scroll-mt-14`/`scroll-mt-20`; adjust to match new top bar height).

### Active Tab Style (UX-01)
- **D-06:** Active tab: 2px `border-top` in `emerald-600` + `text-emerald-600` label. Inactive tab: `text-neutral-500`. No background fill, no gradients, no shadows. Pure border + text color change.

### Outdoor Palette & Typography (UX-02)
- **D-07:** Base colors: `bg-neutral-50` for page/top-bar/tab-bar backgrounds; `text-neutral-900` for primary text.
- **D-08:** Accent: `emerald-600` used for active tab indicator only (and per UX-03 badge colors where specified).
- **D-09:** Minimum `text-base font-semibold` for all data text. Times and scores use `font-mono`.
- **D-10:** Remove **all** box shadows site-wide: `shadow-md`, `shadow-lg`, `shadow-sm` classes get removed from cards/sections. Remove all gradient classes if any exist.

### Status Badges (UX-03)
- **D-11:** Replace tinted badge pills in `EventStatusBadge.svelte` with solid-fill variants:
  - `ongoing` (Pågår): `bg-emerald-600 text-white animate-pulse` — green pulse
  - `completed` (Ferdig): `bg-slate-600 text-white` — slate solid
  - `upcoming` (Kommende): `bg-amber-500 text-white` — amber solid
  - `did_not_start` (Møtte ikke): `bg-gray-400 text-white` — gray solid
- **D-12:** Badge text should be Norwegian labels (not symbols): "Pågår", "Ferdig", "Kommende", "Møtte ikke".
- **D-13:** Badge size stays `px-2 py-1 text-xs font-medium rounded-full inline-flex items-center`.

### Sticky Date Headers (UX-04)
- **D-14:** Date section headers on `+page.svelte` become `position: sticky` with `top-[40px]` (slim top bar height) via Tailwind. Background: `bg-neutral-50` (matches page bg — avoids transparent bleed). No shadow on sticky headers.
- **D-15:** Today's section header shows **"I dag"** label (already produced by `getDateLabel` in `formatters.ts` — no logic change needed).
- **D-16:** Auto-scroll to today's section already works via `registerTodaySection` Svelte action. No logic changes needed — only the `scroll-mt-*` offset needs updating to match the new top bar height.

### Claude's Discretion
- **RefreshButton internals:** Keep existing `RefreshButton.svelte` unchanged. Reposition it in layout only.
- **Transition for tab switch:** No route transitions needed — standard SvelteKit navigation is fine.
- **Bottom tab bar border:** Whether to add `border-t border-neutral-200` on the tab bar — Claude picks what looks cleanest with the new palette.
- **Emoji removal from tabs:** Current nav uses emoji (📅, 👥, 🏆). Replace with plain text labels only, or SVG icons if simple ones exist — Claude's call.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Goals and Requirements
- `.planning/ROADMAP.md` — Phase 3 goal, success criteria (4 checkable conditions), and the no-gradients/no-shadows constraint
- `.planning/REQUIREMENTS.md` — UX-01, UX-02, UX-03, UX-04 definitions and acceptance criteria

### Files to Modify
- `src/routes/+layout.svelte` — slim top bar, remove nav links, add `BottomTabBar`, add global `pb-16` to page content
- `src/routes/+page.svelte` — sticky date headers, update `scroll-mt-*`, remove shadow classes from date section cards
- `src/routes/skyttere/+page.svelte` — apply `text-base font-semibold` typography, monospace for scores, remove shadows
- `src/routes/premieliste/+page.svelte` — same typography and shadow cleanup
- `src/lib/components/EventStatusBadge.svelte` — solid-fill badge variants with Norwegian labels

### New File
- `src/lib/components/BottomTabBar.svelte` — new component for fixed bottom navigation

### Existing Components (reference implementations)
- `src/lib/components/RefreshButton.svelte` — stays unchanged; moved to slim top bar
- `src/lib/utils/formatters.ts` — `getDateLabel()` already returns "I dag" for today; no changes needed

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `registerTodaySection` Svelte action in `src/routes/+page.svelte:28` — auto-scroll already works; only `scroll-mt-*` offset needs adjustment
- `$derived(page.url.pathname)` pattern in `+layout.svelte` for active-route detection — reuse in `BottomTabBar.svelte`
- `getDateLabel()` in `src/lib/utils/formatters.ts` — returns "I dag" for today; no changes to this function
- `EventStatusBadge.svelte` — Svelte 5 runes already, clean to edit

### Established Patterns
- Active-route class pattern: `{isSchedulePage ? 'active-class' : 'inactive-class'}` — reuse in bottom tab bar
- `env(safe-area-inset-bottom)` must be applied as inline style or CSS variable — not a Tailwind utility; use `style="padding-bottom: env(safe-area-inset-bottom)"`
- Svelte 5 `$props()` + `$derived()` for new `BottomTabBar.svelte`

### Integration Points
- `PullToRefresh` is mounted in `+layout.svelte` as overlay — no changes needed; it sits above bottom tabs visually
- `InstallPrompt` also mounted in layout — may need z-index check to render above bottom tab bar
- All three `+page.svelte` files: add `pb-16` or `pb-20` to outermost container so content doesn't disappear behind fixed bottom tabs
- `scroll-mt-14` on schedule date sections → update to match slim top bar height (probably `scroll-mt-10`)

### Shadow Audit
- `src/routes/+page.svelte:107` — `shadow-md sm:shadow-lg` on date section cards → remove
- Check `skyttere/+page.svelte` and `premieliste/+page.svelte` for any shadow classes

</code_context>

<specifics>
## Specific Ideas

- Top bar height: ~40px (no fixed Tailwind class given; Claude picks `h-10` or `h-12` that fits logo)
- Bottom tab bar: plain text labels "Skyteplan", "Skyttere", "Premieliste" — no emojis
- Active tab: `border-t-2 border-emerald-600 text-emerald-600`, inactive: `text-neutral-500`
- Badge labels: "Pågår", "Ferdig", "Kommende", "Møtte ikke" (Norwegian, not symbols)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 3-ux-redesign*
*Context gathered: 2026-05-18*
