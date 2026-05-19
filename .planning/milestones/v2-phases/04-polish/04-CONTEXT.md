# Phase 4: Polish - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Add skeleton loading screens to all three routes, properly configure iOS PWA meta tags (viewport-fit=cover + black-translucent status bar), and automate the service worker cache name with a Vite plugin that injects the git hash at build time. No new data fetching, no new routes.

</domain>

<decisions>
## Implementation Decisions

### Skeleton Screens (POL-01)
- **D-01:** Visual style: animated pulse bars — `animate-pulse bg-neutral-200 rounded` bars. Consistent with neutral palette already in use.
- **D-02:** Content-shaped skeletons per route — not generic equal-height bars:
  - Schedule: one date-header placeholder block + 3–4 event row placeholders
  - Skyttere: 5–6 shooter name bars of varied width
  - Premieliste: 3–4 shooter blocks each with 2–3 prize row placeholders
- **D-03:** Inline skeleton markup per route — no shared SkeletonLoader component. Three routes have different shapes; abstraction would require too many props.
- **D-04:** Premieliste shows full skeleton until `Promise.all` resolves — no progressive reveal. Club scale makes total wait short.

### iOS PWA Meta (POL-02)
- **D-05:** `app.html` changes:
  - `apple-mobile-web-app-status-bar-style` → `black-translucent`
  - `viewport` meta gets `viewport-fit=cover` appended
  - `theme-color` → `#fafafa` (neutral-50, matches top bar bg)
- **D-06:** Top bar in `+layout.svelte` gets `style="padding-top: env(safe-area-inset-top)"` as inline style — same pattern already used for `env(safe-area-inset-bottom)` on the bottom tab bar.
- **D-07:** Define CSS variable `--top-bar-height: calc(2.5rem + env(safe-area-inset-top))` in `src/app.css` (`:root`). Sticky date section headers switch from Tailwind `top-[40px]` to `top: var(--top-bar-height)` via inline style or arbitrary CSS. Single source of truth for the dynamic header height.

### Service Worker Versioning (POL-03)
- **D-08:** Template approach: rename `static/sw.js` → `static/sw.template.js` (committed source of truth). Plugin generates `static/sw.js` at build time. Add `static/sw.js` to `.gitignore`.
- **D-09:** Plugin lives inline in `vite.config.ts` as a plain object with a `buildStart` hook (~15 lines). No separate file.
- **D-10:** Cache name logic: `mode === 'development'` → `'stordalen-dev'`; production → `stordalen-{gitHash}` (short hash from `git rev-parse --short HEAD`). Avoids cache churn in dev.
- **D-11:** `sw.template.js` uses `__CACHE_VERSION__` as the placeholder string. Plugin replaces it and writes `static/sw.js`. The activate handler already evicts all caches with names !== CACHE_NAME — no changes needed to eviction logic.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Goals and Requirements
- `.planning/ROADMAP.md` — Phase 4 goal, success criteria (3 checkable conditions)
- `.planning/REQUIREMENTS.md` — POL-01, POL-02, POL-03 definitions and acceptance criteria

### Files to Modify
- `src/app.html` — add `viewport-fit=cover`, change status bar to `black-translucent`, update `theme-color` to `#fafafa`
- `src/app.css` — add `--top-bar-height: calc(2.5rem + env(safe-area-inset-top))` to `:root`
- `src/routes/+layout.svelte` — add `style="padding-top: env(safe-area-inset-top)"` to top bar div
- `src/routes/+page.svelte` — add skeleton loading state; update sticky date header from `top-[40px]` to `top: var(--top-bar-height)`
- `src/routes/skyttere/+page.svelte` — replace text "Laster inn skyttere..." with pulse-bar skeleton
- `src/routes/premieliste/+page.svelte` — add skeleton loading state (none currently exists)
- `vite.config.ts` — add inline Vite plugin that generates `static/sw.js` from `static/sw.template.js`
- `.gitignore` — add `static/sw.js`

### Files to Rename / Create
- `static/sw.js` → `static/sw.template.js` — rename; template has `__CACHE_VERSION__` placeholder
- `static/sw.js` — generated at build time; gitignored

### Prior Phase Context
- `.planning/phases/03-ux-redesign/03-CONTEXT.md` — top bar height (`h-10` = 2.5rem), neutral-50 palette, bottom tab safe area pattern

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `env(safe-area-inset-bottom)` already used as inline style on bottom tab bar in `+layout.svelte` — identical pattern for `env(safe-area-inset-top)` on top bar
- `animate-pulse` is a standard Tailwind utility — no import needed
- `bg-neutral-200` is in-palette for skeleton fills

### Established Patterns
- Inline style for `env()` CSS functions (not Tailwind arbitrary values) — already established in Phase 3 for bottom tab bar
- Vite plugin as plain object in `vite.config.ts` — fits existing minimal config structure
- `buildStart` hook is the correct Vite lifecycle point for file generation before the build reads static assets

### Integration Points
- Sticky date headers in `+page.svelte`: change `class="... top-[40px]"` → add `style="top: var(--top-bar-height)"` (remove Tailwind arbitrary value)
- `static/sw.js` is registered via `pwa.ts` → no registration code changes needed; output path stays the same
- `.gitignore` is project root — add a `# Generated` section for `static/sw.js`

### Loading State Detection
- Schedule page (`+page.svelte`): currently has NO `{#if !shooters}` guard — skeleton check needs adding before the error/content blocks
- Skyttere page: has `{#if !shooters && !error}` guard — replace the inner text with skeleton markup
- Premieliste page: has `{#if shootersWithDistinctions.length === 0}` but this is empty-state not loading — need separate `{#if loading}` state or track via a derived boolean

</code_context>

<specifics>
## Specific Ideas

- Skeleton fill color: `bg-neutral-200` (matches neutral palette; visible on `bg-neutral-50` page background)
- `--top-bar-height` CSS variable is the authoritative height reference — sticky headers and any future positioned elements use it
- SW cache name format: `stordalen-{7-char-git-hash}` (e.g., `stordalen-a1b2c3d`)
- Placeholder token in sw.template.js: `__CACHE_VERSION__`

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 4-polish*
*Context gathered: 2026-05-19*
