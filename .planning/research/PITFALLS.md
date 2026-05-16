# Domain Pitfalls: Stordalen PWA Modernization

**Domain:** Brownfield SvelteKit 2.x / Svelte 5.x PWA modernization
**Researched:** 2026-05-17
**Confidence:** HIGH (official Svelte/SvelteKit docs + Tailwind official upgrade guide + confirmed GitHub issues)

---

## Overview

Four distinct risk zones: Svelte 4→5 rune migration in a mixed codebase, server-load migration
(+page.ts → +page.server.ts), simultaneous major dep upgrades (SvelteKit / Vite / Tailwind),
and service worker cache version automation. Each has its own failure modes; they interact
when done in one large batch. Separate concerns into discrete commits.

---

## Svelte 4 → 5 Migration Pitfalls

### CRITICAL: Global runes mode breaks external libraries

**What goes wrong:** Setting `runes: true` in `svelte.config.js` `compilerOptions` enforces
runes mode globally — including for any third-party `.svelte` files compiled from `node_modules`.
Any library still written in Svelte 4 syntax (e.g. `@sveltestack/svelte-query`, old UI component
libraries) will fail to compile.

**Why it happens:** The compiler option is not scoped to project files; it applies to all `.svelte`
inputs.

**Consequences:** Build fails or library renders broken silently.

**Prevention:** Do NOT set `runes: true` globally in `svelte.config.js`. Enable runes per-file
with `<svelte:options runes={true} />` at the top of each migrated component. Or remove all
Svelte 4-era library deps first (which you should anyway — `@sveltestack/svelte-query` must go
before any runes pass).

**Detection:** Build errors mentioning external library paths; VS Code Svelte plugin showing
"Legacy mode" on migrated files despite rune usage.


### CRITICAL: Migrate bottom-up, not top-down

**What goes wrong:** Migrating a parent component to runes before its children causes store/rune
interoperability failures. Old `derived` stores cannot consume rune-based state. Parent tries to
pass rune-based values into children still using `export let`, which works — but children passing
data back via stores breaks.

**Why it happens:** Runes and legacy stores are not interoperable in the same reactive graph.

**Prevention:** Migrate leaf components first, then their parents. `Splash.svelte` → then
`+page.svelte` / `skyttere/+page.svelte`. Never migrate a parent before all its children.


### HIGH: `$:` semantics differ from `$derived` / `$effect`

**What goes wrong:** `$:` in Svelte 4 ran before rendering and tracked compile-time literal
dependencies. `$derived` computes eagerly and returns a value. `$effect` runs after DOM updates.
They are not drop-in replacements.

Specific case in this codebase: `src/routes/+page.svelte:43-134` has heavy nested-loop grouping
logic in a `$:` block. Naively converting to `$derived(...)` works if all inputs are reactive
state, but any extracted helper function loses dependency tracking — the derived value goes stale
without warning.

**Prevention:**
- `$:` blocks that compute a value → `$derived(() => { ... })`
- `$:` blocks with side effects (DOM mutation, logging) → `$effect(() => { ... })`
- Any `$:` converted by the migration script that it couldn't determine intent for gets wrapped in
  `run()` from `'svelte/legacy'` — audit every `run()` and replace with proper rune.
- Do NOT extract grouping logic into a plain `.js` helper during migration; keep it inline until
  the derived is confirmed reactive, then extract.


### HIGH: `export let` → `$props()` binding contract changes

**What goes wrong:** In Svelte 4, every `export let` is implicitly bindable. In Svelte 5, props
are NOT bindable by default. Any parent using `bind:propName` on a migrated child component
breaks at runtime (or silently no-ops, depending on version).

**Specific case:** `Splash.svelte` uses `export let show`. If any consumer does `<Splash
bind:show={x} />`, that consumer breaks when `Splash` migrates to `let { show } = $props()`.

**Prevention:**
- Before migrating, grep for all `bind:` usages on the target component.
- For props that must remain bindable, declare: `let { show = $bindable() } = $props()`
- The auto-migration script handles the prop declaration but does NOT audit bind-sites.


### MEDIUM: `children` prop name is reserved in Svelte 5

**What goes wrong:** If any component declares a prop named `children` (e.g. `export let
children`), migrating to `$props()` collides with the reserved snippet slot name. The compiler
error is cryptic.

**Prevention:** Grep for `export let children` before running any migration. Rename first.


### MEDIUM: Event handler modifiers require manual rewrite

**What goes wrong:** `on:click|preventDefault`, `on:submit|stopPropagation` have no runes
equivalent. The migration script converts `on:click` → `onclick` but wraps modifiers in legacy
shims, not proper rewrites.

**Prevention:** After migration script runs, grep for `|preventDefault`, `|stopPropagation`,
`|once`, `|passive`. Rewrite each manually as inline arrow function:
```svelte
<!-- before -->
<form on:submit|preventDefault={handle}>
<!-- after -->
<form onsubmit={(e) => { e.preventDefault(); handle(e); }}>
```


### LOW: Touch events are passive by default in Svelte 5

**What goes wrong:** Svelte 5 attaches touch event listeners as passive by default (aligns with
browser defaults for scroll performance). Calling `e.preventDefault()` inside a `touchstart` or
`touchmove` handler will throw a console warning and be ignored.

**Impact for this app:** Pull-to-refresh and any touch-scroll overrides may silently stop working
on mobile (the primary platform).

**Prevention:** Use a Svelte action with `{ passive: false }` for any touch handler that needs
`preventDefault`.


### LOW: Whitespace rendering changes

**What goes wrong:** Svelte 5's whitespace algorithm differs from Svelte 4, particularly around
inline elements (`<span>`) and inside `<pre>`. Pixel-level layout differences may appear post-
migration.

**Prevention:** Visual QA pass on mobile after each component migration. Outdoor-legibility
requirement makes this non-trivial to miss.

---

## Server Load Migration Pitfalls

### CRITICAL: `$env/static/private` cannot be used from any file that touches the browser

**What goes wrong:** SvelteKit enforces that `$env/static/private` imports only appear in
server-only modules (`+page.server.ts`, `+server.ts`, `hooks.server.ts`). If the GraphQL client
(`src/lib/graphql/client.ts`) imports `$env/static/private` directly and that file is also
imported by a `.svelte` component or `+page.ts`, the build fails with:

> Cannot import $env/static/private into client-side code

**Why it happens:** The current `client.ts` is shared between server and client contexts. Moving
the auth token there without first splitting the file will error.

**Prevention:** Create a server-only GraphQL client (e.g. `src/lib/graphql/server-client.ts`)
that imports `$env/static/private`. Keep the public client separate or delete it if all calls
move server-side. Never import the server client from a `.svelte` file or `+page.ts`.


### CRITICAL: Return values from `+page.server.ts` must be serializable

**What goes wrong:** Unlike `+page.ts` which can return anything (runs in same JS context),
`+page.server.ts` serializes data via `devalue` for transport to the client. Anything that is
not a POJO, `Date`, `Map`, `Set`, `BigInt`, or `RegExp` causes:

> Data returned from load is not serializable: Cannot stringify arbitrary non-POJOs

**Specific risk:** If the GraphQL response includes class instances, circular refs, or
`undefined` values nested deep in arrays, the route breaks silently in dev (undefined becomes
null) but throws in prod.

**Prevention:** After moving to `+page.server.ts`, `JSON.parse(JSON.stringify(data))` the full
return value once during development to surface hidden non-serializables. Then strip the
workaround and fix the actual source.


### HIGH: `+page.server.ts` + prerendering conflict

**What goes wrong:** Routes with `+page.server.ts` cannot be statically prerendered. If any
route has `export const prerender = true` (or inherits it from `+layout.ts`), the build fails or
the route serves stale HTML.

**Prevention:** Confirm `prerender` is not set to `true` in `+layout.ts` or any migrated route.
Given this app polls live competition data, prerendering should be off for all data routes anyway.
Explicitly set `export const prerender = false` in `+page.server.ts` for clarity.


### HIGH: `$env/dynamic/private` is banned during prerendering in SvelteKit 2

**What goes wrong:** SvelteKit 2 throws a hard build error if `$env/dynamic/private` is read
during a prerender pass. The static variant (`$env/static/private`) is the correct choice for a
fixed build-time token.

**Prevention:** Use `$env/static/private` (not dynamic). The AUTH_TOKEN is fixed per deployment;
static import is correct and avoids the prerender issue entirely.


### MEDIUM: Data shape change breaks existing `.svelte` consumers

**What goes wrong:** `+page.ts` returns data inline in the same JS context. When switching to
`+page.server.ts`, the data passes through devalue serialization. Implicit type coercions that
worked before (e.g. returning `undefined`, class methods on objects) silently change shape.

**Prevention:** After migration, add explicit TypeScript return type annotations to the load
function. The `PageServerLoad` type from `'./$types'` enforces this. Check that `+page.svelte`
`data` destructuring still works.


### MEDIUM: Both `+page.ts` and `+page.server.ts` in same directory interact

**What goes wrong:** You can have both files coexist — `+page.server.ts` data is passed as the
`data` property to the `+page.ts` load. This is useful for incremental migration but creates
confusion: which load runs where, and who owns which data.

**Prevention:** For this codebase, delete `+page.ts` after migrating to `+page.server.ts`. Do
not leave both in place unless you have a specific reason (e.g. client-side data augmentation).


### LOW: `svelte.config.ts` (TypeScript) does not work on Vercel

**What goes wrong:** Vercel's build process does not process `svelte.config.ts`. Renaming or
creating a TypeScript config silently fails. This is separate from the server load migration but
relevant if touching config during the upgrade phase.

**Prevention:** Keep `svelte.config.js`. Do not rename to `.ts`.

---

## Dependency Upgrade Pitfalls

### HIGH: Upgrading SvelteKit + Vite + Tailwind simultaneously obscures which broke what

**What goes wrong:** A single PR upgrading SvelteKit 2→latest, Vite 5→8, and Tailwind 3→4
produces a broken build with multiple overlapping error sources. Root-causing any single failure
takes 2–5× longer.

**Prevention:** Upgrade one at a time. Suggested order:
1. Remove `@sveltestack/svelte-query` (zero-risk, isolated)
2. Tailwind 3→4 (CSS-only changes, visual regressions, no JS impact)
3. Vite/SvelteKit (config changes, plugin peer deps)
4. Svelte 4→5 rune migration (last, most invasive)

Commit and verify each step before proceeding.


### HIGH: Vite 8 requires `@sveltejs/vite-plugin-svelte` major bump (6→7)

**What goes wrong:** A `^6` semver range in `package.json` does NOT resolve to v7. After
upgrading Vite, the peer dep mismatch causes a silent build failure or incorrect behavior.

**Prevention:** When upgrading to Vite 8, explicitly bump `@sveltejs/vite-plugin-svelte` to `^7`
in the same commit. Also requires `@sveltejs/kit@2.53.x` minimum.


### HIGH: Vite 8 config key renames break existing `vite.config.ts`

**What goes wrong:** Vite 8 (Rolldown-based) renames config keys:

| Old (Vite 5/6) | New (Vite 8) |
|----------------|--------------|
| `build.rollupOptions` | `build.rolldownOptions` |
| `optimizeDeps.esbuildOptions` | `optimizeDeps.rolldownOptions` |
| `esbuild` (top-level) | `oxc` |

Old keys are silently ignored, not errored. Existing config continues to load but the options
have no effect.

**Prevention:** After `vite` version bump, audit `vite.config.ts` for all legacy keys. The
stordalen config is minimal, so this is low-effort.


### HIGH: Vite 8 CJS interop changes may break GraphQL client

**What goes wrong:** Vite 8 unifies CJS resolution between dev and prod. Packages with ambiguous
ESM/CJS exports (common in older GraphQL libraries) may throw runtime errors that TypeScript
type-checking does not catch. The error is `Cannot read properties of undefined` at runtime.

**Prevention:** After Vite upgrade, run a full production build (`yarn build`) and test all three
routes — do not rely on `vite dev` alone. If needed, `legacy.inconsistentCjsInterop: true` is a
temporary escape hatch.


### HIGH: Tailwind 4 configuration is CSS-first, not JS-first

**What goes wrong:** `tailwind.config.js` is no longer auto-detected in v4. All configuration
moves to CSS via `@theme` directive. If `tailwind.config.js` customizations (colors, fonts,
breakpoints) are not ported to CSS, they silently disappear — classes still compile but use
default values.

**Prevention:**
- Run `npx @tailwindcss/upgrade` — handles ~90% of mechanical migration.
- Manually verify all custom theme values are present in `app.css` under `@theme {}`.
- Switch PostCSS plugin: `tailwindcss` → `@tailwindcss/postcss`, or use the new Vite plugin
  `@tailwindcss/vite` (preferred with Vite builds).


### HIGH: Tailwind 4 renames multiple utility classes used in UI

**What goes wrong:** Classes are renamed; old names simply produce no CSS output (no error).
Critical renames for a mobile-first UI:

| v3 class | v4 class |
|----------|----------|
| `shadow-sm` | `shadow-xs` |
| `shadow` | `shadow-sm` |
| `rounded-sm` | `rounded-xs` |
| `rounded` | `rounded-sm` |
| `blur-sm` | `blur-xs` |
| `ring` (3px) | `ring` (1px — use `ring-3` for old behavior) |
| `flex-shrink-0` | `shrink-0` |
| `flex-grow` | `grow` |
| `bg-opacity-*` | `bg-black/50` opacity modifier syntax |
| `focus:outline-none` | `focus:outline-hidden` |

**Prevention:** The upgrade codemod handles most. Run visual QA on mobile after — outdoor
legibility requirement means subtle layout regressions matter more than average.


### HIGH: Tailwind 4 dark mode defaults to `prefers-color-scheme` media query

**What goes wrong:** v3 defaulted to class-based dark mode (`.dark` on `<html>`). v4 defaults
to `@media (prefers-color-scheme: dark)`. Any `dark:` variant classes stop working as expected
if the app relied on class-toggle dark mode.

**Prevention:** If dark mode is class-toggled, add to `app.css`:
```css
@custom-variant dark (&:where(.dark, .dark *));
```
If no dark mode is used, this is a non-issue.


### MEDIUM: Tailwind 4 variant stacking order reverses

**What goes wrong:** In v3, stacked variants applied right-to-left: `hover:focus:bg-red` meant
"focus, then hover." In v4, left-to-right: `hover:focus:bg-red` means "hover, then focus." Any
stacked variants in templates silently produce wrong selectors.

**Prevention:** Codemod handles this. After upgrade, grep for multi-colon variants and verify
visually.


### MEDIUM: Tailwind 4 `!important` modifier position flips

**What goes wrong:** `!flex` (prefix) becomes `flex!` (suffix). Classes with `!` prefix compile
but are ignored in v4 — no error, no CSS.

**Prevention:** Codemod handles this. Verify with `grep -r '!\w' src/` post-upgrade.


### MEDIUM: `@sveltestack/svelte-query` removal may reveal hidden usages

**What goes wrong:** The package is imported in `+layout.svelte` and wraps all children with
`<QueryClientProvider>`. Removing the wrapper and import is straightforward. But if any future-
added code assumed the QueryClient context is available (e.g. calling `useQuery` in a new
component), that code will fail silently or throw at runtime.

**Prevention:** After removal, run a full text search for `useQuery`, `useMutation`,
`QueryClient`, `svelte-query` across all source files. Confirm zero hits before closing the PR.


### LOW: Yarn lockfile drift after multiple major bumps

**What goes wrong:** Upgrading multiple major packages in sequence without running `yarn install
--frozen-lockfile` checks may accumulate transitive dependency mismatches. Rolldown (Vite 8)
has a different transitive dep tree than Rollup (Vite 5/6), surfacing new `yarn audit` warnings.

**Prevention:** After the Vite upgrade, run `yarn install` and `yarn audit`. Resolve new
vulnerabilities before proceeding to next upgrade.

---

## Service Worker Pitfalls

### CRITICAL: Browser serves old service worker if cache-busting is wrong

**What goes wrong:** Browsers compare the service worker file byte-for-byte with the cached
version. If `static/sw.js` is served with aggressive `Cache-Control` headers (e.g. `max-age`
> 0), the browser may not re-fetch the file and the new cache name version is never seen.
Users continue hitting the old service worker indefinitely.

**Why it happens:** Vercel serves files from `static/` with a content-hash URL by default for
assets, but `sw.js` must be served at a fixed URL (`/sw.js`) without long-lived caching headers.

**Prevention:** Verify Vercel does not cache `/sw.js` with a long TTL. The service worker file
must be served with `Cache-Control: no-cache` (or `max-age=0`). Check `vercel.json` headers
config.


### HIGH: Vite `define` injects strings into the service worker but only via bundling

**What goes wrong:** `vite.config.ts` `define` option replaces string tokens at build time in
bundled files. However, `static/sw.js` is NOT bundled by Vite — it is copied as-is from
`static/`. A token like `__SW_CACHE_VERSION__` in `static/sw.js` is NOT replaced.

**Two correct approaches:**

**Option A — Move sw.js into src/ and bundle it:**
Reference the service worker from `vite.config.ts` using `vite-plugin-pwa` with
`injectManifest` strategy, or manually add it to the build. The bundled output gets `define`
replacements.

**Option B — Use a Vite plugin to write the version into static/sw.js at build time:**
Write a small Vite plugin (`buildStart` hook) that reads the git hash or `package.json` version
and writes a transformed `static/sw.js` with the version substituted. Straightforward, no
dependency.

**Recommendation:** Option B for this codebase — minimal footprint, no new dependencies. A 20-
line Vite plugin:
```js
// vite.config.ts
import { execSync } from 'child_process';
const hash = execSync('git rev-parse --short HEAD').toString().trim();

{
  name: 'inject-sw-version',
  buildStart() {
    const sw = fs.readFileSync('static/sw.js.template', 'utf8');
    fs.writeFileSync('static/sw.js', sw.replace('__CACHE_VERSION__', hash));
  }
}
```
Keep `static/sw.js.template` as source of truth; generate `static/sw.js` at build time.
Add `static/sw.js` to `.gitignore` if using this approach to avoid committing stale hashes.


### HIGH: Cache name bump alone does not evict old caches

**What goes wrong:** Bumping the cache name (e.g. `stordalen-v2` → `stordalen-abc123`) causes
the new service worker to use a new cache, but the old `stordalen-v2` cache is NOT deleted
automatically. Over time, storage fills with orphaned caches.

**Prevention:** In the `activate` event handler, delete all caches whose names do not match the
current version:
```js
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
});
```
Verify this pattern is present in `static/sw.js` after version automation is added.


### HIGH: Service worker update detection requires `skipWaiting` or user prompt

**What goes wrong:** Even with a new service worker file, the browser installs it but does NOT
activate it while old tabs are open. Users keep the old cache indefinitely until they close all
tabs. This is especially problematic for a competition-day PWA where phones may not be restarted.

**Prevention:** Either:
- Call `self.skipWaiting()` in the `install` handler (aggressive — activates immediately, may
  break in-flight requests on concurrent tabs), or
- Post a message to the page suggesting a refresh (better UX for a PWA that users keep open all
  day).


### MEDIUM: Caching API responses from leonls.kongsberg-ts.no without TTL serves stale results

**What goes wrong:** Current sw.js caches all responses from the GraphQL endpoint indefinitely
in `dynamic-stordalen-v2`. During a live competition, shooters' results change every few minutes.
Cached responses may be hours old.

**Compounding factor:** The premieliste N+1 pattern (101 requests/load) means there are 101
cached GraphQL responses, each potentially stale.

**Prevention:**
- Do NOT cache POST requests (GraphQL uses POST). Check if the current SW is inadvertently
  caching them. GraphQL POST responses are non-idempotent and must not be served stale.
- For offline fallback, cache only the app shell (HTML, JS, CSS assets). Show a "you are offline"
  state rather than serving stale competition data.


### LOW: `static/` directory gitignore conflict if sw.js is generated

**What goes wrong:** If `static/sw.js` is generated at build time and added to `.gitignore`,
local `vite dev` will not have it unless the build step runs first. The PWA install prompt and
offline support disappear in development.

**Prevention:** The Vite plugin should run in both `buildStart` (prod) and `configureServer`
(dev) hooks, regenerating `sw.js` at dev startup with a development version string.

---

## Prevention Strategies

### Upgrade Sequencing

Do not combine multiple migration concerns in one branch. Recommended atomic sequence:

1. **Remove `@sveltestack/svelte-query`** — isolated, zero risk, removes compat layer overhead
2. **Tailwind 3→4** — CSS-only, visual regressions only, run codemod + visual QA
3. **Vite 8 + SvelteKit + vite-plugin-svelte major bumps** — config changes, run `yarn build`
4. **+page.ts → +page.server.ts** — one route at a time, verify data shape each time
5. **Svelte 4→5 rune migration** — bottom-up (leaf components first), per-file

### Testing Gates Between Steps

- After each step: `yarn build` succeeds with no type errors
- After Tailwind: visual QA on mobile viewport, outdoor-legibility check
- After server load migration: all three routes load data, auth token absent from browser bundle
  (verify with browser DevTools → Sources, search for token value)
- After rune migration: reactive updates work on result list and schedule grouping

### Auth Token Verification

After +page.server.ts migration, explicitly verify the token is not in the client bundle:

```bash
yarn build && grep -r "YOUR_TOKEN_VALUE" .svelte-kit/output/client/
# Must return zero results
```

### Service Worker Smoke Test

After cache version automation:
1. Build and deploy to Vercel preview
2. Install PWA on mobile
3. Deploy a new build
4. Reload on mobile — confirm new content appears without manual cache clear

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Remove svelte-query | None — but confirm zero `useQuery` usage | Grep before delete |
| Tailwind 4 upgrade | Shadow/ring/rounded class renames produce invisible regression | Run codemod, visual QA |
| Vite 8 upgrade | Plugin peer dep mismatch, CJS interop breakage | Explicit version pinning, full prod build test |
| +page.server.ts migration | Non-serializable return, token still in client.ts | Serialization test, grep for token post-build |
| Rune migration | Global runes config breaks libs, bottom-up order | Per-file `<svelte:options>`, migrate leaves first |
| SW cache versioning | `define` does not reach `static/sw.js` | Build-time template plugin, not raw `define` |
| SW cache TTL | Stale competition results served | Do not cache POST/GraphQL responses |

---

## Sources

- [Svelte 5 Migration Guide](https://svelte.dev/docs/svelte/v5-migration-guide) — HIGH confidence (official)
- [SvelteKit Migrating to v2](https://svelte.dev/docs/kit/migrating-to-sveltekit-2) — HIGH confidence (official)
- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide) — HIGH confidence (official)
- [SvelteKit Server-Only Modules](https://svelte.dev/docs/kit/server-only-modules) — HIGH confidence (official)
- [Migrating SvelteKit to Vite 8](https://cogley.jp/articles/migrating-sveltekit-to-vite-8) — MEDIUM confidence (practitioner report)
- [Cannot stringify arbitrary non-POJOs — GitHub Discussion](https://github.com/sveltejs/kit/discussions/12287) — HIGH confidence (confirmed issue)
- [Global runes mode breaks external libraries — GitHub Issue](https://github.com/sveltejs/svelte/issues/9632) — HIGH confidence (confirmed issue)
- [Svelte 5 non-obvious runes details — GitHub Discussion](https://github.com/sveltejs/svelte/discussions/14835) — MEDIUM confidence
- [SvelteKit $env/dynamic/private prerender build failure](https://github.com/sveltejs/kit/issues/11371) — HIGH confidence (confirmed issue)
- [Vite PWA injectManifest guide](https://vite-pwa-org.netlify.app/guide/inject-manifest) — MEDIUM confidence (official plugin docs)
