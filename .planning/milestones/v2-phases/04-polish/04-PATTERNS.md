# Phase 4: Polish - Pattern Map

**Mapped:** 2026-05-19
**Files analyzed:** 9
**Analogs found:** 9 / 9

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/app.html` | config | request-response | `src/app.html` (self) | exact |
| `src/app.css` | config | — | `src/app.css` (self) | exact |
| `src/routes/+layout.svelte` | component | request-response | `src/lib/components/BottomTabBar.svelte` | role-match (safe-area pattern) |
| `src/routes/+page.svelte` | component | request-response | `src/routes/skyttere/+page.svelte` | exact (same route pattern) |
| `src/routes/skyttere/+page.svelte` | component | request-response | `src/routes/+page.svelte` | exact (same route pattern) |
| `src/routes/premieliste/+page.svelte` | component | request-response | `src/routes/skyttere/+page.svelte` | role-match |
| `vite.config.ts` | config | batch | `vite.config.ts` (self) | exact |
| `.gitignore` | config | — | `.gitignore` (self) | exact |
| `static/sw.js` → `static/sw.template.js` | config | — | `static/sw.js` (self) | exact |

---

## Pattern Assignments

### `src/app.html` (config — iOS PWA meta)

**Analog:** `src/app.html` (self)

**Current meta block** (lines 9–21):
```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="Stordalen" />
<meta name="theme-color" content="#1f2937" />
<meta name="msapplication-TileColor" content="#1f2937" />
```

**Target state — three lines change:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="theme-color" content="#fafafa" />
```

`apple-mobile-web-app-capable` and `apple-mobile-web-app-title` are unchanged.
`msapplication-TileColor` is unchanged (IE legacy; not visible on iOS).

---

### `src/app.css` (config — CSS variable)

**Analog:** `src/app.css` (self)

**Current full file** (lines 1–2):
```css
@import 'tailwindcss';
@plugin '@tailwindcss/typography';
```

**Target state — append `:root` block:**
```css
@import 'tailwindcss';
@plugin '@tailwindcss/typography';

:root {
	--top-bar-height: calc(2.5rem + env(safe-area-inset-top));
}
```

`2.5rem` = `h-10` on the header in `+layout.svelte` line 23. Tabs indentation (not spaces) per project convention.

---

### `src/routes/+layout.svelte` (component — safe-area top padding)

**Analog:** `src/lib/components/BottomTabBar.svelte`

**Bottom bar safe-area pattern** (`BottomTabBar.svelte` lines 9–12):
```svelte
<nav
	class="fixed bottom-0 left-0 right-0 z-50 flex h-14 border-t border-neutral-200 bg-neutral-50"
	style="padding-bottom: env(safe-area-inset-bottom)"
>
```

**Current top bar** (`+layout.svelte` lines 22–24):
```svelte
<header
	class="sticky top-0 z-40 flex h-10 items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4"
>
```

**Target state — same pattern, top instead of bottom:**
```svelte
<header
	class="sticky top-0 z-40 flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4"
	style="height: calc(2.5rem + env(safe-area-inset-top)); padding-top: env(safe-area-inset-top)"
>
```

Remove `h-10` from class (height is now dynamic via inline style). Add `style` attribute with both height and padding-top so the logo stays below the status bar.

---

### `src/routes/+page.svelte` (component — skeleton + sticky header fix)

**Analog:** `src/routes/skyttere/+page.svelte` (same route shape)

**Two changes required:**

#### 1. Add `navigating` skeleton branch

**Import to add** (after existing imports, script block lines 1–18):
```svelte
import { navigating } from '$app/state';
```

**Current conditional structure** (lines 87–289):
```svelte
{#if !showSplash}
	{#if error}
		...
	{:else if shooters}
		...
	{/if}
{/if}
```

**Target structure — add `{#if navigating}` inside `{#if !showSplash}`:**
```svelte
{#if !showSplash}
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
		...
	{:else if shooters}
		...
	{/if}
{/if}
```

#### 2. Fix sticky date header top value

**Current** (line 111):
```svelte
class="sticky top-10 z-30 bg-neutral-50 border-b border-neutral-200 px-3 py-3 sm:px-6 sm:py-4"
```

Note: current code uses `top-10` (line 111 says `sticky top-10`), not `top-[40px]` as mentioned in CONTEXT.md — same computed value, different spelling.

**Target — remove `top-10` from class, add inline style:**
```svelte
class="sticky z-30 bg-neutral-50 border-b border-neutral-200 px-3 py-3 sm:px-6 sm:py-4"
style="top: var(--top-bar-height)"
```

Also update `scroll-mt-10` on the section wrapper (line 107) to `scroll-mt` matching the new dynamic height — use `style="scroll-margin-top: var(--top-bar-height)"` on the wrapper div.

---

### `src/routes/skyttere/+page.svelte` (component — replace text loader with skeleton)

**Analog:** `src/routes/+page.svelte` (navigating pattern)

**Current loading guard** (lines 20–23):
```svelte
{#if !shooters && !error}
	<div class="flex min-h-96 items-center justify-center">
		<div class="text-lg text-gray-600">Laster inn skyttere...</div>
	</div>
```

**Import to add** (script block, after existing imports):
```svelte
import { navigating } from '$app/state';
```

**Target — keep `{#if !shooters && !error}` but replace inner content with skeleton, and add `{#if navigating}` as additional entry point:**

The existing `!shooters && !error` guard also covers client navigation (since `shooters` is null while navigating). Replace its content directly:
```svelte
{#if navigating || (!shooters && !error)}
	<div class="container mx-auto px-2 py-4 pt-6">
		<!-- 6 shooter name bars of varied width -->
		{#each [
			'w-48', 'w-36', 'w-52', 'w-40', 'w-44', 'w-32'
		] as widthClass (widthClass)}
			<div class="mb-3 h-14 {widthClass} animate-pulse rounded bg-neutral-200"></div>
		{/each}
	</div>
```

The `!shooters && !error` fallback remains for the SSR edge case where data is absent and no navigation is in flight.

---

### `src/routes/premieliste/+page.svelte` (component — add loading state)

**Analog:** `src/routes/skyttere/+page.svelte` (navigating pattern)

**Current structure** (lines 89–268): No loading guard exists. The page renders the container and content unconditionally; `{#if shootersWithDistinctions.length === 0}` (line 97) is an empty-state check only.

**Import to add** (script block line 1, after existing imports):
```svelte
import { navigating } from '$app/state';
```

**Target — wrap entire container in `{#if navigating}` / `{:else}` guard:**
```svelte
{#if navigating}
	<div class="container mx-auto px-2 py-4 pt-6">
		<!-- 3 shooter blocks each with 2-3 prize row placeholders -->
		{#each Array(3) as _, i (i)}
			<div class="mb-4 rounded-lg border border-neutral-200 bg-white p-4">
				<!-- Shooter name bar -->
				<div class="mb-3 h-6 w-40 animate-pulse rounded bg-neutral-200"></div>
				<!-- 3 prize row bars -->
				{#each Array(3) as _, j (j)}
					<div class="mb-2 h-5 w-full animate-pulse rounded bg-neutral-200"></div>
				{/each}
			</div>
		{/each}
	</div>
{:else}
	<div class="container mx-auto px-2 py-4 pt-6 sm:px-4 sm:py-6 sm:pt-8">
		<!-- existing content unchanged -->
	</div>
{/if}
```

The existing `{#if shootersWithDistinctions.length === 0}` empty-state block stays inside the `{:else}` branch untouched.

---

### `vite.config.ts` (config — inline Vite plugin)

**Analog:** `vite.config.ts` (self)

**Current file** (lines 1–7):
```typescript
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()]
});
```

**Target state — add imports and inline plugin before `defineConfig`:**
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

`swVersionPlugin()` placed first so `buildStart` runs before SvelteKit/Tailwind processing.

---

### `.gitignore` (config — add generated file)

**Analog:** `.gitignore` (self)

**Current file** (lines 1–26): no `# Generated` section.

**Target — append one section at end of file:**
```
# Generated
static/sw.js
```

---

### `static/sw.js` → `static/sw.template.js` (rename + placeholder)

**Analog:** `static/sw.js` (self)

**Only change:** line 1.

**Current line 1:**
```javascript
const CACHE_NAME = 'stordalen-v2';
```

**Target line 1 in `static/sw.template.js`:**
```javascript
const CACHE_NAME = '__CACHE_VERSION__';
```

Lines 2–117 are unchanged. The activate handler (lines 20–32) already evicts all caches where `cacheName !== CACHE_NAME` — no logic changes needed.

The original `static/sw.js` is deleted (file is renamed, then `static/sw.js` is gitignored and generated at build time by the Vite plugin).

---

## Shared Patterns

### `navigating` import for skeleton gates
**Source:** `src/lib/components/BottomTabBar.svelte` line 2 (uses `$app/state` — same module)
**Apply to:** `+page.svelte`, `skyttere/+page.svelte`, `premieliste/+page.svelte`
```svelte
import { navigating } from '$app/state';
```
`navigating` is `null` during SSR and when idle; non-null during any client-side navigation. Never causes SSR flash.

### Skeleton element anatomy
**Apply to:** All three route skeleton branches
```svelte
<div class="animate-pulse rounded bg-neutral-200 {height} {width}"></div>
```
- Heights: `h-7` (date header), `h-24` (event card), `h-14` (shooter row), `h-6` (name line), `h-5` (prize row)
- Widths: `w-full` (full-width cards), `w-40` / `w-36` / `w-48` / `w-52` (varied name bars)
- Container wrapper: `class="container mx-auto px-2 py-4 pt-6"` — matches real content container

### `env()` as inline style (not Tailwind arbitrary value)
**Source:** `src/lib/components/BottomTabBar.svelte` line 11
```svelte
style="padding-bottom: env(safe-area-inset-bottom)"
```
**Apply to:** `+layout.svelte` header (top equivalent), sticky date headers in `+page.svelte` (via CSS variable).
Tailwind arbitrary values (`top-[40px]`, `h-[calc(...)]`) cannot reference CSS env() reliably — use inline `style` attribute instead.

---

## No Analog Found

None — all files have direct analogs in the existing codebase.

---

## Metadata

**Analog search scope:** `src/`, `static/`, project root config files
**Files scanned:** 11
**Pattern extraction date:** 2026-05-19
