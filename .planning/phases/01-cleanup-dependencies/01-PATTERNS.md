# Phase 1: Cleanup & Dependencies - Pattern Map

**Mapped:** 2026-05-17
**Files analyzed:** 8 files (5 modified, 1 created, 2 config-only bumps)
**Analogs found:** 8 / 8

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/routes/+layout.svelte` | layout | request-response | itself (surgical edit) | exact |
| `src/lib/utils/formatters.ts` | utility | transform | itself (surgical edit) | exact |
| `src/lib/pwa.ts` | utility | event-driven | `src/lib/components/InstallPrompt.svelte` | role-match |
| `src/lib/components/ShooterExternalLink.svelte` | component | request-response | itself (surgical edit) | exact |
| `src/lib/constants.ts` (NEW) | utility | — | `src/routes/+page.ts` (club ID origin) | pattern-match |
| `src/routes/+page.ts` | loader | request-response | `src/routes/skyttere/+page.ts` | exact |
| `src/routes/skyttere/+page.ts` | loader | request-response | `src/routes/premieliste/+page.ts` | exact |
| `src/routes/premieliste/+page.ts` | loader | request-response | `src/routes/+page.ts` | exact |
| `package.json` | config | — | itself (version bumps only) | exact |
| `svelte.config.js` | config | — | itself (no changes needed) | exact |
| `vite.config.ts` | config | — | itself (no changes needed) | exact |
| `tsconfig.json` | config | — | itself (no changes needed per research) | exact |

---

## Pattern Assignments

### `src/routes/+layout.svelte` (layout — CLEAN-01: remove svelte-query)

**Change:** Remove 3 lines, unwrap one element. No structural rewrite.

**Current imports to remove** (lines 4, 11):
```typescript
import { QueryClient, QueryClientProvider } from '@sveltestack/svelte-query';
// ...
const queryClient = new QueryClient();
```

**Current wrapper to unwrap** (lines 69–71):
```svelte
<QueryClientProvider client={queryClient}>
	{@render children?.()}
</QueryClientProvider>
```

**Target state** — keep `{@render children?.()}` in place, no wrapper:
```svelte
{@render children?.()}
```

**Pitfall:** The `{@render children?.()}` call must remain at the same DOM position. Removing only the wrapper tags, not the render call, preserves page routing.

**All other layout content unchanged** — header (lines 30–67), PullToRefresh, InstallPrompt stay as-is.

---

### `src/lib/utils/formatters.ts` (utility — CLEAN-02: delete deprecated functions)

**Change:** Delete two functions. Zero callers confirmed by research grep.

**Lines to delete entirely** (37–43 and 63–65):
```typescript
// DELETE THIS BLOCK (lines 37-43):
export function formatNorwegianDateLocal(date: string): string {
	const d = new Date(date);
	const day = d.getDate().toString().padStart(2, '0');
	const month = (d.getMonth() + 1).toString().padStart(2, '0');
	const year = d.getFullYear();
	return `${day}.${month}.${year}`;
}

// DELETE THIS BLOCK (lines 63-65):
export function formatNorwegianTimeLocale(date: string): string {
	return new Date(date).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
}
```

**Retained functions** (keep all): `parseAsLocalTime`, `formatNorwegianDate`, `formatNorwegianTime`, `getDateLabel`.

**JSDoc comments above deleted functions** (lines 32–36 and 57–62) should be deleted together with their function bodies.

---

### `src/lib/pwa.ts` (utility — CLEAN-03: delete duplicate install-prompt logic)

**Analog for what to keep:** The SW registration block (lines 2–13) is the sole retained content.

**Analog for what is being removed:** `src/lib/components/InstallPrompt.svelte` lines 12–28 owns `beforeinstallprompt` and `appinstalled` — the authoritative implementation.

**Current full file** (34 lines). After edit, file contains ONLY:
```typescript
// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker
			.register('/sw.js')
			.then((registration) => {
				console.log('SW registered: ', registration);
			})
			.catch((registrationError) => {
				console.log('SW registration failed: ', registrationError);
			});
	});
}
```

**Lines to delete** (15–33): `let deferredPrompt`, `beforeinstallprompt` listener, `appinstalled` listener, `export { deferredPrompt }`.

**Verification:** After edit, `grep -r "deferredPrompt" src/lib/pwa.ts` must return nothing.

---

### `src/lib/components/ShooterExternalLink.svelte` (component — SEC-03: dynamic year)

**Change:** Add `const year` declaration in script, replace hardcoded `2025` in href.

**Current script block** (lines 1–8):
```svelte
<script lang="ts">
	interface Props {
		shooterName: string;
		class?: string;
	}

	let { shooterName, class: className = '' }: Props = $props();
</script>
```

**Target script block** — add one line after destructure:
```svelte
<script lang="ts">
	interface Props {
		shooterName: string;
		class?: string;
	}

	let { shooterName, class: className = '' }: Props = $props();
	const year = new Date().getFullYear();
</script>
```

**Current href** (line 11):
```svelte
href="https://2025.lsres.no/search/?s={encodeURIComponent(shooterName)}"
```

**Target href:**
```svelte
href="https://{year}.lsres.no/search/?s={encodeURIComponent(shooterName)}"
```

**Pattern note:** `const year` (not `$derived`) — evaluates at mount, sufficient since competition apps restart daily. Matches project pattern of using `$derived` only for reactive state that depends on other reactive values.

---

### `src/lib/constants.ts` (NEW utility — CLEAN-04: shared constant)

**No existing file.** Pattern sourced from how `'10782'` appears in all three loaders.

**Analog imports pattern** from `src/routes/+page.ts` (line 2):
```typescript
import { getShootersByClub } from '$lib';
```

**New file — full content:**
```typescript
export const DEFAULT_CLUB_ID = '10782';
```

**Conventions applied:**
- SCREAMING_SNAKE_CASE constant name (per CLAUDE.md: "Constants in SCREAMING_SNAKE_CASE")
- Single quotes (per CLAUDE.md)
- No trailing comma
- No JSDoc needed — name is self-documenting
- Placed at `src/lib/constants.ts` (accessible as `$lib/constants`)

---

### `src/routes/+page.ts`, `src/routes/skyttere/+page.ts`, `src/routes/premieliste/+page.ts` (loaders — CLEAN-04: consume constant)

**Change:** Add one import, replace string literal. Pattern identical across all three files.

**Current import block** (`+page.ts` line 1–2):
```typescript
import type { Load } from '@sveltejs/kit';
import { getShootersByClub } from '$lib';
```

**Target import block:**
```typescript
import type { Load } from '@sveltejs/kit';
import { getShootersByClub } from '$lib';
import { DEFAULT_CLUB_ID } from '$lib/constants';
```

**Current club ID line** (all three files, line 6):
```typescript
const clubId = url.searchParams.get('c') || '10782';
```

**Target:**
```typescript
const clubId = url.searchParams.get('c') || DEFAULT_CLUB_ID;
```

**premieliste/+page.ts note:** Uses `import type { PageLoad }` (not `Load`) and imports from `'$lib/graphql/queries'` — import block differs but the club ID substitution pattern is identical.

---

### `package.json` (config — DEPS-01 through DEPS-04: version bumps)

**No pattern extraction needed** — changes are version string substitutions only. See RESEARCH.md Standard Stack section for exact target versions and sequencing.

**devDependencies target versions:**
- `@sveltejs/adapter-vercel`: `^5.6.3` → `6.3.3`
- `@sveltejs/kit`: `^2.22.0` → `2.59.1`
- `@sveltejs/vite-plugin-svelte`: `^6.0.0` → `7.1.2`
- `eslint`: `^9.18.0` → `9.39.4`
- `prettier`: `^3.4.2` → `3.8.3`
- `svelte`: `^5.0.0` → `5.55.7`
- `svelte-check`: `^4.0.0` → `4.4.8`
- `typescript`: `^5.0.0` → `6.0.3`
- `vite`: `^7.0.4` → `8.0.13`

**dependencies target versions:**
- `@sveltestack/svelte-query`: REMOVE entirely
- `@vercel/analytics`: `^1.5.0` → `1.6.1`
- `graphql-request`: `^7.2.0` → `7.4.0`

**Package management:** Use `yarn add` / `yarn remove` commands per RESEARCH.md sequencing. Do not hand-edit version strings then run `yarn install` — use the CLI so lockfile stays consistent.

---

### `svelte.config.js` (config — no changes needed)

Current state is already minimal. No changes required for any phase 1 work. `vitePreprocess()` and `adapter-vercel` adapter call are compatible with upgraded versions.

---

### `vite.config.ts` (config — no changes needed)

Current state uses only `plugins: [tailwindcss(), sveltekit()]`. Vite 8 breaking changes (renamed `rollupOptions`, `esbuildOptions`) do not apply. No edits required.

---

### `tsconfig.json` (config — monitor after DEPS-04)

Current `compilerOptions` has no `types` array. TypeScript 6 defaults `types` to `[]`. This project's browser globals come from `lib: [DOM, DOM.Iterable]` in `.svelte-kit/tsconfig.json` (the extended base). Risk is LOW. Only add `"types"` if `yarn check` fails post-upgrade with "Cannot find name" errors for globals not brought in by an import.

---

## Shared Patterns

### Svelte 5 Runes (component script pattern)
**Source:** `src/lib/components/ShooterExternalLink.svelte` lines 1–8, `src/routes/+layout.svelte` lines 13, 16–18
**Apply to:** Any new script-block additions in this phase
```svelte
<script lang="ts">
	let { propName, class: className = '' }: Props = $props();
	const derivedVal = $derived(someReactiveExpr);
</script>
```

### Loader pattern (SvelteKit universal load)
**Source:** `src/routes/+page.ts` lines 1–21
**Apply to:** All three `+page.ts` loader edits
```typescript
import type { Load } from '@sveltejs/kit';
import { getShootersByClub } from '$lib';

export const load: Load = async ({ url }) => {
	const clubId = url.searchParams.get('c') || DEFAULT_CLUB_ID;
	try {
		const result = await getShootersByClub(clubId);
		return { result, clubId };
	} catch (error) {
		console.error('Error loading:', error);
		return {
			result: null,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
			clubId
		};
	}
};
```

### $lib path alias
**Source:** All `+page.ts` files, `src/lib/index.ts`
**Apply to:** `src/lib/constants.ts` import in loaders
```typescript
import { DEFAULT_CLUB_ID } from '$lib/constants';
```

---

## No Analog Found

None. All files either have exact analogs or are self-referential edits.

---

## Metadata

**Analog search scope:** `src/routes/`, `src/lib/`, `src/lib/components/`, `src/lib/utils/`
**Files scanned:** 11
**Pattern extraction date:** 2026-05-17
