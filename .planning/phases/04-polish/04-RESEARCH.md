# Phase 4: Polish - Research

**Researched:** 2026-05-19
**Domain:** SvelteKit SSR loading states, iOS PWA meta tags, Vite plugin build hooks
**Confidence:** HIGH

## Summary

Phase 4 adds three self-contained improvements to an already-working SvelteKit 2 / Svelte 5 PWA. All three are low-risk and require no new npm packages. The architecture is fully understood from the existing codebase.

**Skeleton screens (POL-01):** SvelteKit server loaders (`+page.server.ts`) complete before the HTML response is sent — the initial SSR render always has data. Skeletons only appear during client-side navigations between tabs. The `navigating` object from `$app/state` is the clean mechanism: non-null while a client navigation is in flight, null during SSR and while idle. Each route adds `{#if navigating}` skeleton markup; the existing `{#if !shooters && !error}` guard in skyttere stays as-is and handles the same case. Premieliste needs a new loading branch since its current `{#if shootersWithDistinctions.length === 0}` conflates empty-state with loading.

**iOS PWA meta (POL-02):** Three changes to `app.html` plus one inline style on the top bar in `+layout.svelte` plus one CSS variable in `app.css`. `black-translucent` makes the status bar fully transparent and overlays it on content — meaning the sticky top bar must add `padding-top: env(safe-area-inset-top)` so its content is not obscured. The `BottomTabBar.svelte` already uses this exact pattern for the bottom. A CSS variable `--top-bar-height: calc(2.5rem + env(safe-area-inset-top))` centralises the computed height for sticky date headers.

**SW versioning (POL-03):** The Vite plugin writes `static/sw.js` from `static/sw.template.js` in its `buildStart` hook. This is safe because `buildStart` fires before any file copying — the file exists in the source directory by the time Vite processes it. In Vercel, `git rev-parse --short HEAD` may fail on shallow clones, but `VERCEL_GIT_COMMIT_SHA` (available at build time when system env vars are enabled) provides a reliable fallback. The plugin takes the first 7 characters of that SHA.

**Primary recommendation:** Implement all three tasks in a single wave — they are independent of each other and none touches shared infrastructure.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Skeleton loading state | Browser / Client | — | `navigating` is client-only; SSR always has data |
| iOS status bar transparency | Browser / Client | — | CSS env() + HTML meta; no server involvement |
| Safe area padding | Browser / Client | — | `env(safe-area-inset-top)` resolved at render time |
| SW cache versioning | Build / Plugin | — | Vite plugin writes static file at build time |
| SW cache eviction | Browser / SW | — | activate event handler in service worker |

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01:** Skeleton style: `animate-pulse bg-neutral-200 rounded` bars.

**D-02:** Content-shaped skeletons per route:
- Schedule: one date-header placeholder block + 3-4 event row placeholders
- Skyttere: 5-6 shooter name bars of varied width
- Premieliste: 3-4 shooter blocks each with 2-3 prize row placeholders

**D-03:** Inline skeleton markup per route — no shared SkeletonLoader component.

**D-04:** Premieliste shows full skeleton until all data resolves — no progressive reveal.

**D-05:** `app.html` changes: status bar → `black-translucent`, viewport gets `viewport-fit=cover`, `theme-color` → `#fafafa`.

**D-06:** Top bar in `+layout.svelte` gets `style="padding-top: env(safe-area-inset-top)"` as inline style.

**D-07:** CSS variable `--top-bar-height: calc(2.5rem + env(safe-area-inset-top))` in `src/app.css` `:root`. Sticky date headers switch from `top-[40px]` to `top: var(--top-bar-height)`.

**D-08:** `static/sw.js` → `static/sw.template.js`. Plugin generates `static/sw.js` at build time. `static/sw.js` added to `.gitignore`.

**D-09:** Plugin lives inline in `vite.config.ts` as plain object with `buildStart` hook (~15 lines).

**D-10:** Cache name: `mode === 'development'` → `'stordalen-dev'`; production → `stordalen-{gitHash}`.

**D-11:** Placeholder in template: `__CACHE_VERSION__`. Activate handler already evicts all caches with names !== CACHE_NAME.

### Claude's Discretion

None noted in CONTEXT.md — all implementation choices are locked.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| POL-01 | Skeleton loading screens on initial data load across all three routes | `navigating` from `$app/state` is null during SSR/idle, non-null during client nav — drives skeleton visibility |
| POL-02 | iOS PWA meta tags: `viewport-fit=cover`, `black-translucent` status bar, `apple-mobile-web-app-capable: yes` | Three `app.html` edits + CSS variable + inline style on top bar |
| POL-03 | SW cache name automated via Vite plugin injecting git hash; activate handler evicts all old caches | `buildStart` hook writes `static/sw.js` from template; existing eviction logic requires no changes |
</phase_requirements>

## Standard Stack

No new packages required. All implementation uses existing dependencies.

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| SvelteKit | 2.x | `$app/state` navigating object | Built-in; authoritative loading state for client nav |
| Svelte 5 | 5.x | `{#if navigating}` template blocks | Already in use across all routes |
| TailwindCSS 4 | 4.x | `animate-pulse bg-neutral-200 rounded` | Already used; D-01 specifies these classes |
| Vite | 8.x | Plugin `buildStart` hook | Already in vite.config.ts; inline plugin object |
| Node.js | 22.x | `node:fs`, `node:child_process` in plugin | Available at build time |

### No New Dependencies
Phase 4 adds zero new npm packages. All three features use browser built-ins, Vite's plugin API, and SvelteKit's existing exports.

## Package Legitimacy Audit

No packages to install. Section not applicable.

## Architecture Patterns

### System Architecture Diagram

```
Browser (client-side navigation)
  ↓ link click / goto()
  navigating (non-null) → each +page.svelte renders skeleton branch
  ↓ load() completes on server
  navigating (null) → each +page.svelte renders data branch

iOS PWA (standalone mode)
  app.html: black-translucent + viewport-fit=cover
  ↓ status bar becomes transparent overlay
  +layout.svelte header: padding-top env(safe-area-inset-top)
  app.css :root: --top-bar-height = 2.5rem + safe-area-inset-top
  ↓ sticky date headers use top: var(--top-bar-height)

Build pipeline (Vite)
  buildStart hook fires
  ↓ child_process.execSync('git rev-parse --short HEAD') OR process.env.VERCEL_GIT_COMMIT_SHA[:7]
  ↓ fs.readFileSync('static/sw.template.js')
  ↓ replace '__CACHE_VERSION__' with stordalen-{hash}
  ↓ fs.writeFileSync('static/sw.js')
  Vite copies static/ → dist/  (sw.js now present)
```

### Recommended Project Structure
No structural changes. Files modified in place:
```
src/
├── app.html                     # add viewport-fit=cover, black-translucent, theme-color
├── app.css                      # add --top-bar-height CSS variable to :root
└── routes/
    ├── +layout.svelte           # add padding-top safe-area to header
    ├── +page.svelte             # add {#if navigating} skeleton; update sticky top value
    ├── skyttere/+page.svelte    # replace text loader with pulse skeleton
    └── premieliste/+page.svelte # add {#if navigating} skeleton branch
static/
├── sw.template.js               # renamed from sw.js; has __CACHE_VERSION__
└── sw.js                        # generated at build time; gitignored
vite.config.ts                   # add inline plugin object
.gitignore                       # add static/sw.js
```

### Pattern 1: Client Navigation Skeleton with `navigating`

**What:** `navigating` from `$app/state` is non-null during any client-side route transition. Null on server and when idle. Import it in the route page and use it to gate skeleton vs content rendering.

**When to use:** Any route where data loads via `+page.server.ts` and you want feedback during tab-switching.

**Example:**
```svelte
<!-- Source: https://svelte.dev/docs/kit/$app-state -->
<script lang="ts">
  import { navigating } from '$app/state';
  let { data } = $props();
  let shooters = $derived(data.shooters);
</script>

{#if navigating}
  <!-- Skeleton markup -->
  <div class="container mx-auto px-2 py-4 pt-6">
    <div class="mb-4 h-8 w-32 animate-pulse rounded bg-neutral-200"></div>
    {#each Array(4) as _, i (i)}
      <div class="mb-3 h-20 w-full animate-pulse rounded bg-neutral-200"></div>
    {/each}
  </div>
{:else if shooters}
  <!-- Real content -->
{/if}
```

**Key nuance:** `navigating` is `null` during SSR — the skeleton never renders on first load (data is already present). It only fires during subsequent client navigations. No SSR flash risk. [VERIFIED: svelte.dev/docs/kit/$app-state]

### Pattern 2: Premieliste Loading State

**What:** Premieliste currently has no loading guard — it uses `{#if shootersWithDistinctions.length === 0}` which is an empty-state check, not a loading check. Need to add `{#if navigating}` before the existing content block.

**When to use:** Any route where `data.shootersWithDistinctions` could be an empty array even when data has loaded (empty-state vs loading must be distinct).

**Example:**
```svelte
<script lang="ts">
  import { navigating } from '$app/state';
  let { data } = $props();
  let shootersWithDistinctions = $derived(data.shootersWithDistinctions ?? []);
</script>

{#if navigating}
  <!-- 3-4 shooter block skeletons -->
{:else}
  <!-- existing {#if shootersWithDistinctions.length === 0} block -->
{/if}
```

### Pattern 3: Vite Plugin for SW Template Injection

**What:** Inline plugin object in `vite.config.ts`. `buildStart` hook runs before any static file copying, so writing `static/sw.js` here guarantees it is present when Vite processes the public/static directory. [ASSUMED — ordering is well-established in community practice but not explicitly documented as a guarantee in Vite 8 docs]

**When to use:** Any build-time string injection into static files.

**Example:**
```typescript
// Source: established Vite plugin pattern; vite.dev/guide/api-plugin
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

function swVersionPlugin(): Plugin {
  return {
    name: 'sw-version',
    buildStart() {
      const template = readFileSync('static/sw.template.js', 'utf-8');
      let version: string;
      if (this.environment?.mode === 'development') {
        version = 'stordalen-dev';
      } else {
        let hash: string;
        try {
          hash = execSync('git rev-parse --short HEAD').toString().trim();
        } catch {
          // Vercel shallow clone fallback
          const sha = process.env.VERCEL_GIT_COMMIT_SHA ?? 'unknown';
          hash = sha.slice(0, 7);
        }
        version = `stordalen-${hash}`;
      }
      writeFileSync('static/sw.js', template.replace('__CACHE_VERSION__', version));
    }
  };
}
```

**Note on `mode` access in `buildStart`:** In Vite 8 (Rolldown), `buildStart` receives a Rolldown-compatible options object. The config `mode` is accessible via `this.meta` or by capturing it in the plugin factory closure via the `config` or `configResolved` hook. Closure approach is simplest and most portable: `let resolvedMode: string; return { name: '...', configResolved(c) { resolvedMode = c.mode; }, buildStart() { ... use resolvedMode ... } }`. [ASSUMED — verify against Vite 8 plugin API]

### Pattern 4: iOS Safe Area Top Bar

**What:** `black-translucent` makes the iOS status bar transparent and overlays it over the app's content. The sticky top bar must compensate with `env(safe-area-inset-top)` padding. `BottomTabBar.svelte` already uses this exact pattern for the bottom.

**When to use:** PWA installed to iOS home screen in standalone display mode.

**Example:**
```svelte
<!-- src/routes/+layout.svelte — matches existing bottom bar pattern -->
<header
  class="sticky top-0 z-40 flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4"
  style="height: calc(2.5rem + env(safe-area-inset-top)); padding-top: env(safe-area-inset-top)"
>
```

```css
/* src/app.css */
@import 'tailwindcss';
@plugin '@tailwindcss/typography';

:root {
  --top-bar-height: calc(2.5rem + env(safe-area-inset-top));
}
```

```svelte
<!-- sticky date header in +page.svelte — was top-[40px] -->
<div class="sticky z-30 bg-neutral-50 ..." style="top: var(--top-bar-height)">
```

**Note:** `env(safe-area-inset-top)` is `0` in browsers and when not in standalone mode — no padding is applied outside of installed PWA context. Safe to apply unconditionally. [CITED: developer.apple.com/documentation/webkit/safe_area_layout_guide]

### Anti-Patterns to Avoid

- **Using `{#if !data.shooters}` as loading check:** On SSR, `data.shooters` is always populated (server loader completed). This check is always false on first render. Only works as an error guard. Use `navigating` for loading UX.
- **Writing sw.js in `writeBundle` or `closeBundle`:** These run after Vite copies the public/static directory — sw.js would not appear in dist. Use `buildStart` (before) or `generateBundle` as a last resort.
- **Hardcoding `top-[40px]` with dynamic padding:** If top bar gains `env(safe-area-inset-top)` padding, sticky elements at `top-[40px]` will underlay the bar. Must use `--top-bar-height` variable.
- **Using `$app/stores` `navigating` store:** Deprecated in SvelteKit 2.12+. Use `navigating` from `$app/state` (already the project pattern — `BottomTabBar.svelte` uses `$app/state`). [VERIFIED: svelte.dev/docs/kit/$app-state]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Loading state detection | Custom fetch wrapper / `$state(false)` loading flag | `navigating` from `$app/state` | Built-in to SvelteKit; already null-safe on SSR |
| Git hash in browser | `VITE_GIT_HASH` env var in vite.config `define` | Vite plugin writing `static/sw.js` | `define` does not reach static files (established in STATE.md decisions) |
| Safe area padding arithmetic | Custom JS measuring screen dimensions | `env(safe-area-inset-top)` in CSS | Browser-native; works across all iOS versions |

**Key insight:** All three features use platform/framework primitives. Custom solutions would be more fragile and add code that needs maintenance.

## Common Pitfalls

### Pitfall 1: Skeleton flashes on SSR first load

**What goes wrong:** Skeleton shows briefly even on initial page load before data appears.

**Why it happens:** Using `{#if !data.shooters}` or `{#if loading}` with a `$state` that initializes to true. On server-side render, `data.shooters` may be null before the reactive binding fires on the client (hydration gap).

**How to avoid:** Use `navigating` from `$app/state`. It is explicitly `null` during server rendering — the skeleton is never in the SSR HTML. On the client, it goes non-null only when a navigation is actually in flight. No flash on first load.

**Warning signs:** Skeleton markup visible for 100-300ms on hard refresh.

---

### Pitfall 2: `git rev-parse --short HEAD` fails in Vercel CI

**What goes wrong:** Vercel does a shallow clone (depth ~10). `git rev-parse --short HEAD` itself works (HEAD is always present), but the command can fail if the `.git` directory is absent or git is not in PATH in some CI configurations.

**Why it happens:** Shallow clone does not mean HEAD is absent — it means git history is truncated. `rev-parse HEAD` returns the current commit SHA reliably. However, some Vercel build images or edge configs might not have git in PATH.

**How to avoid:** Try/catch around `execSync('git rev-parse --short HEAD')`. Fallback: `process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'unknown'`. `VERCEL_GIT_COMMIT_SHA` is a Vercel system env var available at build time when "Enable access to System Environment Variables" is enabled in project settings. [VERIFIED: vercel.com/docs/environment-variables/system-environment-variables]

**Warning signs:** SW cache name is `stordalen-unknown` in production logs.

---

### Pitfall 3: `mode` not accessible in `buildStart` directly

**What goes wrong:** `this.environment?.mode` or similar patterns do not exist in Rolldown/Vite 8 buildStart context.

**Why it happens:** Rolldown's build hook context differs from Rollup's. The plugin `mode` comes from the resolved Vite config, not the Rollup options object.

**How to avoid:** Capture `mode` in the `configResolved` hook inside the plugin factory closure:
```typescript
configResolved(config) { resolvedMode = config.mode; }
```
Then use `resolvedMode` in `buildStart`. This pattern is unambiguous and works across Vite versions. [ASSUMED — verify in vite.config.ts testing]

---

### Pitfall 4: Top bar height inconsistency between normal and iOS standalone

**What goes wrong:** Sticky date headers position correctly on desktop/Android but clip under the status bar on iOS PWA.

**Why it happens:** `top-[40px]` (Tailwind arbitrary value) is a fixed 40px. When the top bar gets `padding-top: env(safe-area-inset-top)` (44px on iPhone 15 Pro), the bar is taller than 40px, and the sticky header sits beneath it.

**How to avoid:** Replace `top-[40px]` with `style="top: var(--top-bar-height)"` on sticky date header divs. The CSS variable tracks the dynamic total height. [ASSUMED — actual safe area inset value varies by device]

---

### Pitfall 5: `theme-color` in app.html vs manifest.json mismatch

**What goes wrong:** Theme color shows as dark gray (#1f2937) on Android instead of neutral-50 (#fafafa).

**Why it happens:** Both `app.html` and `static/manifest.json` currently have `theme-color: #1f2937`. The manifest value may take precedence on some browsers.

**How to avoid:** Update both `app.html` meta tag and `static/manifest.json` `theme_color` field to `#fafafa`. [ASSUMED — browser precedence behavior; update both to be safe]

## Code Examples

### Skeleton structure for Schedule page

```svelte
<!-- +page.svelte — navigating import + skeleton branch -->
<script lang="ts">
  import { navigating } from '$app/state';
  // ... existing imports
</script>

{#if navigating}
  <div class="container mx-auto px-2 py-4 pt-6">
    <!-- Date header placeholder -->
    <div class="mb-4 h-7 w-40 animate-pulse rounded bg-neutral-200"></div>
    <!-- 4 event row placeholders -->
    {#each Array(4) as _, i (i)}
      <div class="mb-3 h-24 w-full animate-pulse rounded bg-neutral-200"></div>
    {/each}
  </div>
{:else if error}
  <!-- existing error block -->
{:else if shooters}
  <!-- existing content block -->
{/if}
```

### Vite plugin (complete, inline in vite.config.ts)

```typescript
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

function swVersionPlugin(): Plugin {
  let resolvedMode = 'development';
  return {
    name: 'sw-version',
    configResolved(config) {
      resolvedMode = config.mode;
    },
    buildStart() {
      const template = readFileSync('static/sw.template.js', 'utf-8');
      let version: string;
      if (resolvedMode === 'development') {
        version = 'stordalen-dev';
      } else {
        let hash: string;
        try {
          hash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
        } catch {
          const sha = process.env.VERCEL_GIT_COMMIT_SHA ?? 'unknown';
          hash = sha.slice(0, 7);
        }
        version = `stordalen-${hash}`;
      }
      writeFileSync('static/sw.js', template.replace('__CACHE_VERSION__', version));
    }
  };
}

export default defineConfig({
  plugins: [swVersionPlugin(), tailwindcss(), sveltekit()]
});
```

### app.html changes

```html
<!-- Before -->
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="theme-color" content="#1f2937" />

<!-- After -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="theme-color" content="#fafafa" />
```

### sw.template.js first line (the only change from sw.js)

```javascript
// Before (sw.js line 1):
const CACHE_NAME = 'stordalen-v2';

// After (sw.template.js line 1):
const CACHE_NAME = '__CACHE_VERSION__';
```

The rest of sw.js is unchanged. The activate handler already evicts all caches with names !== CACHE_NAME — no logic changes needed.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `$app/stores` navigating store | `navigating` from `$app/state` | SvelteKit 2.12 | Stores deprecated; use state module |
| `apple-mobile-web-app-status-bar-style: default` | `black-translucent` | iOS 7+ | Enables full-bleed PWA look |
| Manual CACHE_NAME string update | Vite plugin git hash injection | — | Automatic; no manual cache bumps |

**Deprecated/outdated:**
- `import { navigating } from '$app/stores'`: deprecated — use `$app/state`. Project already uses `$app/state` (BottomTabBar.svelte). [VERIFIED: svelte.dev/docs/kit/$app-state]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `buildStart` runs before Vite copies `static/` to `dist/` | Code Examples, Pitfalls | `sw.js` absent from build output; fix by using `generateBundle` instead |
| A2 | `mode` is not directly available in `buildStart` context in Vite 8 — must use `configResolved` closure | Pattern 3 | Plugin errors at build time; fix trivially |
| A3 | `env(safe-area-inset-top)` is 0 outside iOS standalone mode | Pattern 4 | Could add unwanted padding on non-iOS devices; risk is cosmetic and minimal |
| A4 | `VERCEL_GIT_COMMIT_SHA` requires "Enable access to System Environment Variables" to be checked in Vercel project settings | Pitfall 2 | Fallback produces `stordalen-unknown` cache name; acceptable degradation |
| A5 | `manifest.json` `theme_color` should also be updated to `#fafafa` to match | Pitfall 5 | Theme color discrepancy on some Android Chrome; cosmetic only |

## Open Questions (RESOLVED)

1. **`buildStart` write ordering in Vite 8 (Rolldown)**
   - RESOLVED: Plan uses `configResolved` closure to capture mode, then `buildStart` to write `static/sw.js`. 04-03 Task 3 verifies the output file exists and contains the hash pattern after `yarn build`. If ordering ever fails, the verification step catches it immediately.

2. **`mode` access in plugin `buildStart` in Vite 8**
   - RESOLVED: Plan uses the `configResolved` closure pattern exclusively (`resolvedMode` variable). `this.environment?.mode` is not used anywhere — closure is version-agnostic and confirmed safe.

3. **Premieliste `data.shootersWithDistinctions` on error path**
   - RESOLVED: 04-02 Task 3 adds `{#if navigating}` as outermost guard; the existing `{#if shootersWithDistinctions.length === 0}` empty-state block and error handling remain inside the `{:else}` branch, untouched. Error state from loader is orthogonal to navigating state.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite plugin `node:fs`, `node:child_process` | Yes | 22.14.0 | — |
| git | `git rev-parse --short HEAD` in plugin | Yes (locally) | — | `VERCEL_GIT_COMMIT_SHA` env var |
| `VERCEL_GIT_COMMIT_SHA` | SW cache hash fallback on Vercel | Conditional | — | `'unknown'` (acceptable) |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:**
- `git` in Vercel build: fallback to `VERCEL_GIT_COMMIT_SHA` env var. Requires "System Environment Variables" enabled in Vercel project settings (one-time toggle).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected (no jest/vitest/playwright config found) |
| Config file | none |
| Quick run command | `yarn check && yarn build` |
| Full suite command | `yarn check && yarn build` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| POL-01 | `{#if navigating}` skeleton renders during navigation | Manual | Open PWA, switch tabs, verify pulse animation | N/A |
| POL-02 | iOS status bar transparent, no white gap | Manual (device) | Install PWA on iOS, verify status bar | N/A |
| POL-03 | Build output `sw.js` contains `stordalen-{hash}` | Build verification | `yarn build && grep stordalen- .vercel/output/static/sw.js` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `yarn check` (type-check)
- **Per wave merge:** `yarn check && yarn build`
- **Phase gate:** `yarn build` green + manual device checks for POL-01 and POL-02

### Wave 0 Gaps
- [ ] No automated test infrastructure exists — all three requirements have manual verification. Build grep for POL-03 is the only automatable check.

## Security Domain

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | — |
| V3 Session Management | No | — |
| V4 Access Control | No | — |
| V5 Input Validation | No | No user input in this phase |
| V6 Cryptography | No | — |

No security-relevant changes in this phase. SW versioning uses git hash for cache busting only — not for any access control or integrity verification.

## Sources

### Primary (HIGH confidence)
- [svelte.dev/docs/kit/$app-state](https://svelte.dev/docs/kit/$app-state) — `navigating` object behavior, SSR nullability
- [vercel.com/docs/environment-variables/system-environment-variables](https://vercel.com/docs/environment-variables/system-environment-variables) — `VERCEL_GIT_COMMIT_SHA` availability at build time
- Existing codebase: `BottomTabBar.svelte` — established `env(safe-area-inset-bottom)` inline style pattern
- Existing codebase: `static/sw.js` — activate handler already evicts old caches; template rename is the only structural change

### Secondary (MEDIUM confidence)
- [dev.to/karmasakshi/make-your-pwas-look-handsome-on-ios-1o08](https://dev.to/karmasakshi/make-your-pwas-look-handsome-on-ios-1o08) — iOS black-translucent + safe area padding strategy
- [github.com/sveltejs/kit/issues/10541](https://github.com/sveltejs/kit/issues/10541) — SvelteKit server loader skeleton screen discussion; confirms SSR always has data

### Tertiary (LOW confidence)
- Vite buildStart hook ordering relative to static file copy — not explicitly documented; established in community practice

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero new packages; all tools already in project
- Architecture: HIGH — patterns directly observed in existing code (BottomTabBar safe area pattern)
- `navigating` behavior: HIGH — official SvelteKit docs confirm null during SSR
- Vite buildStart ordering: MEDIUM — community practice but not formally guaranteed in Vite 8 docs
- Vercel git env vars: HIGH — official Vercel docs

**Research date:** 2026-05-19
**Valid until:** 2026-08-19 (90 days; stable APIs)
