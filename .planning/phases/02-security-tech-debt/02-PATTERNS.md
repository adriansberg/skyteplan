# Phase 2: Security & Tech Debt - Pattern Map

**Mapped:** 2026-05-18
**Files analyzed:** 11
**Analogs found:** 11 / 11

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/lib/server/graphql/client.ts` | service/config | request-response | `src/lib/graphql/client.ts` | exact (migrate) |
| `src/lib/server/graphql/queries.ts` | service | request-response | `src/lib/graphql/queries.ts` | exact (migrate) |
| `src/routes/+page.server.ts` | loader | request-response | `src/routes/+page.ts` | exact (rename+patch) |
| `src/routes/skyttere/+page.server.ts` | loader | request-response | `src/routes/skyttere/+page.ts` | exact (rename+patch) |
| `src/routes/premieliste/+page.server.ts` | loader | request-response | `src/routes/premieliste/+page.ts` | exact (rename+patch) |
| `src/routes/+page.svelte` | component/page | request-response | `src/routes/premieliste/+page.svelte` | role-match (rune target) |
| `src/routes/skyttere/+page.svelte` | component/page | request-response | `src/routes/premieliste/+page.svelte` | role-match (rune target) |
| `src/lib/components/Splash.svelte` | component | event-driven | `src/lib/components/Splash.svelte` | exact (migrate) |
| `src/lib/utils/helpers.ts` | utility | transform | `src/lib/utils/helpers.ts` | exact (add export) |
| `src/routes/+error.svelte` | component/page | request-response | `src/routes/+layout.svelte` | partial (nav reuse) |
| `src/lib/index.ts` | config/barrel | — | `src/lib/index.ts` | exact (remove export) |

---

## Pattern Assignments

### `src/lib/server/graphql/client.ts` (service/config, request-response)

**Analog:** `src/lib/graphql/client.ts` (lines 1-11) — rewrite with `$env/static/private`

**Full analog (lines 1-11):**
```typescript
import { GraphQLClient } from 'graphql-request';

const endpoint = 'https://leonls.kongsberg-ts.no/api';

// Create a GraphQL client with default headers
export const graphqlClient = new GraphQLClient(endpoint, {
	headers: {
		Authorization: `Bearer ${import.meta.env.VITE_AUTH_TOKEN}`,
		'Content-Type': 'application/json'
	}
});
```

**Change required:** Replace `import.meta.env.VITE_AUTH_TOKEN` with `$env/static/private` import. Add deployment comment per D-04.

**Target pattern:**
```typescript
// src/lib/server/graphql/client.ts
// Vercel env var: AUTH_TOKEN (NOT VITE_AUTH_TOKEN — rename in Vercel dashboard before deploy)
import { GraphQLClient } from 'graphql-request';
import { AUTH_TOKEN } from '$env/static/private';

const endpoint = 'https://leonls.kongsberg-ts.no/api';

export const graphqlClient = new GraphQLClient(endpoint, {
	headers: {
		Authorization: `Bearer ${AUTH_TOKEN}`,
		'Content-Type': 'application/json'
	}
});
```

---

### `src/lib/server/graphql/queries.ts` (service, request-response)

**Analog:** `src/lib/graphql/queries.ts` (lines 1-120) — copy verbatim, update import path only.

**Imports pattern (lines 1-7):**
```typescript
import { gql } from 'graphql-request';
import type {
	GetShooterByClubResponse,
	GetShooterResponse,
	ShooterWithDistinctions
} from './types';
import { graphqlClient } from './client';
```

**Change required:** The `./types` import becomes `$lib/graphql/types` (types stay at old location). The `./client` import resolves to the new `src/lib/server/graphql/client.ts` (same directory — relative path unchanged). No other changes.

**Updated imports:**
```typescript
import { gql } from 'graphql-request';
import type {
	GetShooterByClubResponse,
	GetShooterResponse,
	ShooterWithDistinctions
} from '$lib/graphql/types';
import { graphqlClient } from './client';
```

**Core function pattern (lines 9-51) — copy unchanged:**
```typescript
export async function getShootersByClub(clubId: string) {
	const { getShooterByClub: data } = await graphqlClient.request<GetShooterByClubResponse>(
		gql`...`,
		{ clubId }
	);
	return data;
}
```

**Per-shooter error handling (lines 94-107) — preserve as-is:**
```typescript
const promises = shooters.map(async (shooter) => {
	try {
		const shooterWithDistinctions = await getShooterWithDistinctions(shooter.organizationId);
		if (
			shooterWithDistinctions.distinctions &&
			shooterWithDistinctions.distinctions.length > 0
		) {
			return shooterWithDistinctions;
		}
	} catch (error) {
		console.warn(`Failed to get distinctions for shooter ${shooter.name}:`, error);
	}
	return null;
});
```

---

### `src/routes/+page.server.ts` (loader, request-response)

**Analog:** `src/routes/+page.ts` (lines 1-22)

**Full analog:**
```typescript
import type { Load } from '@sveltejs/kit';
import { getShootersByClub } from '$lib';
import { DEFAULT_CLUB_ID } from '$lib/constants';

export const load: Load = async ({ url }) => {
	const clubId = url.searchParams.get('c') || DEFAULT_CLUB_ID;
	try {
		const shooters = await getShootersByClub(clubId);
		return { shooters, clubId };
	} catch (error) {
		console.error('Error loading shooters:', error);
		return {
			shooters: null,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
			clubId
		};
	}
};
```

**Changes required:**
- Type: `Load` → `PageServerLoad` from `./$types`
- Import source: `$lib` → `$lib/server/graphql/queries`
- Add SEC-02 validation before the try block

**Target pattern:**
```typescript
import type { PageServerLoad } from './$types';
import { getShootersByClub } from '$lib/server/graphql/queries';
import { DEFAULT_CLUB_ID } from '$lib/constants';

export const load: PageServerLoad = async ({ url }) => {
	const raw = url.searchParams.get('c') || DEFAULT_CLUB_ID;
	const clubId = /^\d+$/.test(raw) ? raw : DEFAULT_CLUB_ID;
	try {
		const shooters = await getShootersByClub(clubId);
		return { shooters, clubId };
	} catch (error) {
		console.error('Error loading shooters:', error);
		return {
			shooters: null,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
			clubId
		};
	}
};
```

---

### `src/routes/skyttere/+page.server.ts` (loader, request-response)

**Analog:** `src/routes/skyttere/+page.ts` (lines 1-22) — identical shape to `+page.ts`

**Same changes as `+page.server.ts` above.** Additionally fix the wrong `$types` import path noted in RESEARCH.md Pitfall 2 — this file's `+page.svelte` currently imports from `'../skyttere/$types'`; the loader itself uses `Load` from `@sveltejs/kit`. After rename the generated type is `PageServerLoad` from `./$types`.

**Target pattern:**
```typescript
import type { PageServerLoad } from './$types';
import { getShootersByClub } from '$lib/server/graphql/queries';
import { DEFAULT_CLUB_ID } from '$lib/constants';

export const load: PageServerLoad = async ({ url }) => {
	const raw = url.searchParams.get('c') || DEFAULT_CLUB_ID;
	const clubId = /^\d+$/.test(raw) ? raw : DEFAULT_CLUB_ID;
	try {
		const shooters = await getShootersByClub(clubId);
		return { shooters, clubId };
	} catch (error) {
		console.error('Error loading shooters:', error);
		return {
			shooters: null,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
			clubId
		};
	}
};
```

---

### `src/routes/premieliste/+page.server.ts` (loader, request-response)

**Analog:** `src/routes/premieliste/+page.ts` (lines 1-22)

**Full analog:**
```typescript
import type { PageLoad } from './$types';
import { getShootersWithDistinctions } from '$lib/graphql/queries';
import { DEFAULT_CLUB_ID } from '$lib/constants';

export const load: PageLoad = async ({ url }) => {
	const clubId = url.searchParams.get('c') || DEFAULT_CLUB_ID;
	try {
		const shootersWithDistinctions = await getShootersWithDistinctions(clubId);
		return { shootersWithDistinctions, clubId };
	} catch (error) {
		console.error('Error loading distinctions:', error);
		return {
			shootersWithDistinctions: [],
			clubId
		};          // <-- DEBT-02: missing `error` field here
	}
};
```

**Changes required:**
- Type: `PageLoad` → `PageServerLoad` from `./$types`
- Import source: `$lib/graphql/queries` → `$lib/server/graphql/queries`
- Add SEC-02 validation
- DEBT-02: add `error` field to catch return

**Target pattern:**
```typescript
import type { PageServerLoad } from './$types';
import { getShootersWithDistinctions } from '$lib/server/graphql/queries';
import { DEFAULT_CLUB_ID } from '$lib/constants';

export const load: PageServerLoad = async ({ url }) => {
	const raw = url.searchParams.get('c') || DEFAULT_CLUB_ID;
	const clubId = /^\d+$/.test(raw) ? raw : DEFAULT_CLUB_ID;
	try {
		const shootersWithDistinctions = await getShootersWithDistinctions(clubId);
		return { shootersWithDistinctions, clubId, error: null };
	} catch (error) {
		console.error('Error loading distinctions:', error);
		return {
			shootersWithDistinctions: [],
			clubId,
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		};
	}
};
```

---

### `src/routes/+page.svelte` (component/page, request-response)

**Analog for rune migration:** `src/routes/premieliste/+page.svelte` (lines 1-8) — canonical Svelte 5 page

**Current Svelte 4 pattern to replace (lines 1-20):**
```typescript
// BEFORE — Svelte 4
export let data: PageData;
$: shooters = data.shooters;
$: error = data.error;
let showSplash = false;
```

**Target rune pattern (copy from premieliste analog):**
```typescript
// AFTER — Svelte 5
import type { PageData } from './$types';
let { data }: { data: PageData } = $props();
let shooters = $derived(data.shooters);
let error = $derived(data.error);
let showSplash = $state(false);
```

**Analog script block (premieliste/+page.svelte lines 1-8):**
```svelte
<script lang="ts">
	import ShooterExternalLink from '$lib/components/ShooterExternalLink.svelte';
	import type { ShooterWithDistinctions } from '$lib/graphql/types';
	import { SvelteMap } from 'svelte/reactivity';

	let { data } = $props();
	let shootersWithDistinctions: ShooterWithDistinctions[] = data.shootersWithDistinctions || [];
```

**DEBT-03 note:** The `groupedEvents` `$:` block (lines 43-135 of current `+page.svelte`) contains the Felt grouping logic. After extracting `groupFeltEvents()` to `helpers.ts`, this block collapses to:
```typescript
let groupedEvents = $derived(
	(() => {
		if (!shooters) return {};
		const allEvents = groupFeltEvents(shooters);
		const grouped: Record<string, typeof allEvents> = {};
		allEvents.forEach((event) => {
			const dateKey = formatNorwegianDate(event.shootingDateTime);
			if (!grouped[dateKey]) grouped[dateKey] = [];
			grouped[dateKey].push(event);
		});
		return grouped;
	})()
);
```

**`SvelteSet` removal:** The import `import { SvelteSet } from 'svelte/reactivity'` (current line 15) is deleted once Felt grouping moves to `helpers.ts`. No `SvelteSet` remains in the page file.

**`todaySectionElement` and `registerTodaySection` action:** These use no Svelte 4 syntax — they stay as-is but `let todaySectionElement` becomes `let todaySectionElement = $state<HTMLElement | undefined>(undefined)`.

---

### `src/routes/skyttere/+page.svelte` (component/page, request-response)

**Analog for rune migration:** `src/routes/premieliste/+page.svelte` — same $props pattern

**Current Svelte 4 pattern to replace (lines 1-13):**
```svelte
<script lang="ts">
	import { ... } from '$lib/utils/formatters';
	import ShooterExternalLink from '$lib/components/ShooterExternalLink.svelte';
	import type { PageData } from '../skyttere/$types';  // <-- WRONG path, fix to ./$types

	export let data: PageData;
	$: shooters = data.shooters;
	$: error = data.error;
</script>
```

**Target rune pattern:**
```svelte
<script lang="ts">
	import { ... } from '$lib/utils/formatters';
	import ShooterExternalLink from '$lib/components/ShooterExternalLink.svelte';
	import type { PageData } from './$types';             // <-- fixed path

	let { data }: { data: PageData } = $props();
	let shooters = $derived(data.shooters);
	let error = $derived(data.error);
</script>
```

**Rest of template:** No changes needed. `{#if !shooters && !error}`, `{:else if error}`, `{:else if shooters}` blocks remain. Template-internal `{@const}` and `$:` **do not** exist in the template portion — only the two `$:` in the script need migration.

---

### `src/lib/components/Splash.svelte` (component, event-driven)

**Analog:** Current `src/lib/components/Splash.svelte` (lines 1-25) — migrate in place

**Current Svelte 4 pattern (lines 1-25):**
```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import stordalenLogo from '$lib/assets/stordalen.jpg';

	export let show = false;
	let minimumSplashTime = 1500;

	onMount(() => {
		const hasSeenSplash = sessionStorage.getItem('stordalen-splash-shown');
		if (!hasSeenSplash) {
			show = true;
			sessionStorage.setItem('stordalen-splash-shown', 'true');
			const splashTimer = setTimeout(() => {
				show = false;
			}, minimumSplashTime);
			return () => clearTimeout(splashTimer);
		}
	});
</script>
```

**Target rune pattern:**
```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import stordalenLogo from '$lib/assets/stordalen.jpg';

	let { show = $bindable(false) } = $props();
	let minimumSplashTime = 1500;

	onMount(() => {
		const hasSeenSplash = sessionStorage.getItem('stordalen-splash-shown');
		if (!hasSeenSplash) {
			show = true;
			sessionStorage.setItem('stordalen-splash-shown', 'true');
			const splashTimer = setTimeout(() => {
				show = false;
			}, minimumSplashTime);
			return () => clearTimeout(splashTimer);
		}
	});
</script>
```

**Only change:** `export let show = false` → `let { show = $bindable(false) } = $props()`. Parent call site `<Splash bind:show={showSplash} />` is unchanged. `minimumSplashTime` is a plain local — no rune needed. Template and `<style>` block unchanged.

---

### `src/lib/utils/helpers.ts` (utility, transform)

**Analog:** Current `src/lib/utils/helpers.ts` (lines 1-95) — append new export

**Existing pattern to match (lines 1-2, 8-19):**
```typescript
import { parseAsLocalTime } from './formatters';

export function hasPartialResults(event: {
	series?: Array<{ sum?: string | number; shots?: Array<unknown> }>;
}): boolean {
	return !!(
		event.series &&
		event.series.length > 0 &&
		event.series.some(...)
	);
}
```

**New export to append — replace `SvelteSet` with `Set`:**
```typescript
import type { Shooter, Event } from '$lib/graphql/types';

export type EventWithShooter = Event & {
	shooter: Shooter;
	subEvents?: (Event & { shooter: Shooter })[];
};

export function groupFeltEvents(shooters: Shooter[]): EventWithShooter[] {
	const allEvents: EventWithShooter[] = [];

	shooters.forEach((shooter) => {
		const processedEvents = new Set<string>();   // plain Set, not SvelteSet

		shooter.events.forEach((event) => {
			const eventKey = `${event.name}-${event.shootingDateTime}-${event.targetNumber}-${event.relayNumber}`;
			if (processedEvents.has(eventKey)) return;

			if (event.name === 'Felt') {
				const relatedEvents = shooter.events.filter(
					(e) =>
						['Minne', 'Felthurtig', 'Stang'].includes(e.name) &&
						e.shootingDateTime === event.shootingDateTime &&
						e.targetNumber === event.targetNumber &&
						e.relayNumber === event.relayNumber
				);
				if (relatedEvents.length > 0) {
					allEvents.push({ ...event, shooter, subEvents: relatedEvents.map((e) => ({ ...e, shooter })) });
					relatedEvents.forEach((e) => {
						processedEvents.add(`${e.name}-${e.shootingDateTime}-${e.targetNumber}-${e.relayNumber}`);
					});
				} else {
					allEvents.push({ ...event, shooter });
				}
			} else {
				const correspondingFelt = shooter.events.find(
					(e) =>
						e.name === 'Felt' &&
						e.shootingDateTime === event.shootingDateTime &&
						e.targetNumber === event.targetNumber &&
						e.relayNumber === event.relayNumber
				);
				if (!correspondingFelt) {
					allEvents.push({ ...event, shooter });
				}
			}
			processedEvents.add(eventKey);
		});
	});

	allEvents.sort(
		(a, b) =>
			parseAsLocalTime(a.shootingDateTime).getTime() -
			parseAsLocalTime(b.shootingDateTime).getTime()
	);

	return allEvents;
}
```

**Import note:** Add `import type { Shooter, Event } from '$lib/graphql/types';` at top of file alongside the existing `parseAsLocalTime` import. Logic is a direct lift of `+page.svelte` lines 51-115 with `SvelteSet` replaced by `Set`.

---

### `src/routes/+error.svelte` (component/page, request-response)

**Analog:** `src/routes/+layout.svelte` (lines 27-64) — nav markup to copy; `src/routes/+page.svelte` lines 167-170 — error card pattern

**Nav analog to copy (layout.svelte lines 27-64):**
```svelte
<header class="sticky top-0 z-40 border-b border-gray-200 bg-white">
	<div class="container mx-auto flex items-center justify-between px-2 py-2 sm:px-4 sm:py-3">
		<a href="/" class="flex items-center space-x-2 transition-opacity hover:opacity-80">
			<img src={stordalenLogo} alt="Stordalen Skytterlag" class="h-8 w-auto sm:h-10" />
			<span class="hidden text-lg font-semibold text-gray-900 sm:inline">
				Stordalen Skytterlag
			</span>
		</a>
		<nav class="flex items-center space-x-2 sm:space-x-4">
			<!-- nav links -->
		</nav>
	</div>
</header>
```

**Error card analog (current +page.svelte lines 167-171):**
```svelte
<div class="m-6 rounded-lg border border-red-200 bg-red-50 p-6">
	<h2 class="mb-2 text-xl font-semibold text-red-800">Feil ved lasting av data:</h2>
	<span class="text-red-600">Feil: {error}</span>
</div>
```

**Target pattern for +error.svelte:**
```svelte
<script lang="ts">
	import { page } from '$app/state';
	import stordalenLogo from '$lib/assets/stordalen.jpg';
</script>

<header class="sticky top-0 z-40 border-b border-gray-200 bg-white">
	<div class="container mx-auto flex items-center justify-between px-2 py-2 sm:px-4 sm:py-3">
		<a href="/" class="flex items-center space-x-2 transition-opacity hover:opacity-80">
			<img src={stordalenLogo} alt="Stordalen Skytterlag" class="h-8 w-auto sm:h-10" />
			<span class="hidden text-lg font-semibold text-gray-900 sm:inline">
				Stordalen Skytterlag
			</span>
		</a>
	</div>
</header>

<div class="m-6 rounded-lg border border-red-200 bg-red-50 p-6">
	<h2 class="mb-2 text-xl font-semibold text-red-800">
		Kunne ikke laste data. Sjekk nettforbindelsen og prøv igjen.
	</h2>
	{#if page.error?.message}
		<p class="mt-2 text-sm text-red-500">{page.error.message}</p>
	{/if}
	<a href="/" class="mt-4 inline-block text-sm text-blue-600 hover:underline">
		Gå til forsiden
	</a>
</div>
```

**Retry link:** `href="/"` per discretion note — more reliable than `window.history.back()` on first page load.

**Why nav is copied not inherited:** `+layout.svelte` has no load function so it won't error, meaning `+error.svelte` WILL inherit layout (per RESEARCH.md Pitfall 6). The nav from layout will render automatically. The nav in `+error.svelte` can be omitted or included as a safety fallback — include it for completeness since layout inheritance is only guaranteed when layout has no load function.

---

### `src/lib/index.ts` (config/barrel)

**Analog:** Current `src/lib/index.ts` (lines 1-2)

**Current:**
```typescript
// place files you want to import through the `$lib` alias in this folder.
export { getShootersByClub } from './graphql/queries';
```

**Target:** Remove the re-export. `./graphql/queries` will no longer exist after migration. Server loaders import directly from `$lib/server/graphql/queries`. Leave the comment so the file is not empty.

```typescript
// place files you want to import through the `$lib` alias in this folder.
// Query functions are server-only — import from $lib/server/graphql/queries in +page.server.ts files.
```

---

## Shared Patterns

### Svelte 5 props pattern
**Source:** `src/routes/premieliste/+page.svelte` lines 6-7
**Apply to:** `+page.svelte`, `skyttere/+page.svelte`, `Splash.svelte`
```svelte
let { data } = $props();
// For bindable:
let { show = $bindable(false) } = $props();
```

### `$derived` for loader data
**Source:** `src/routes/premieliste/+page.svelte` lines 38-44 (`$derived((() => { ... })())`)
**Apply to:** `+page.svelte`, `skyttere/+page.svelte`
```svelte
let shooters = $derived(data.shooters);
let error = $derived(data.error);
```
`$derived` re-evaluates when `data` prop updates after `invalidateAll()`. Plain `let x = data.x` does NOT.

### `$app/state` import for error page
**Source:** `src/routes/+layout.svelte` line 4
**Apply to:** `+error.svelte`
```typescript
import { page } from '$app/state';
```

### Try/catch loader structure
**Source:** `src/routes/+page.ts` lines 5-22
**Apply to:** All three `+page.server.ts` files
```typescript
export const load: PageServerLoad = async ({ url }) => {
	const raw = url.searchParams.get('c') || DEFAULT_CLUB_ID;
	const clubId = /^\d+$/.test(raw) ? raw : DEFAULT_CLUB_ID;
	try {
		// ... query
		return { data, clubId };
	} catch (error) {
		console.error('...', error);
		return {
			data: null,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
			clubId
		};
	}
};
```

### Error display card
**Source:** `src/routes/+page.svelte` lines 167-171
**Apply to:** `+error.svelte`
```svelte
<div class="m-6 rounded-lg border border-red-200 bg-red-50 p-6">
	<h2 class="mb-2 text-xl font-semibold text-red-800">...</h2>
</div>
```

---

## No Analog Found

No files lack an analog. All 11 files have direct or role-match analogs in the codebase.

---

## Files to Delete After Migration

| File | Reason |
|------|--------|
| `src/lib/graphql/client.ts` | Replaced by `src/lib/server/graphql/client.ts` |
| `src/lib/graphql/queries.ts` | Replaced by `src/lib/server/graphql/queries.ts` |
| `src/routes/+page.ts` | Replaced by `+page.server.ts` |
| `src/routes/skyttere/+page.ts` | Replaced by `+page.server.ts` |
| `src/routes/premieliste/+page.ts` | Replaced by `+page.server.ts` |

---

## Metadata

**Analog search scope:** `src/lib/`, `src/routes/`
**Files scanned:** 12
**Pattern extraction date:** 2026-05-18
