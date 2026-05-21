# Phase 06: Multi-Club Routing — Pattern Map

**Mapped:** 2026-05-21
**Files analyzed:** 10 (3 new, 7 modified/moved/deleted)
**Analogs found:** 9 / 10

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/lib/clubs.ts` (NEW) | config | transform | `src/lib/constants.ts` | partial (same lib layer, config data) |
| `src/hooks.server.ts` (NEW) | middleware | request-response | `src/routes/+page.server.ts` | partial (server-only, event object) |
| `src/routes/+layout.server.ts` (NEW) | loader | request-response | `src/routes/+page.server.ts` | role-match |
| `src/app.d.ts` (MODIFIED) | config | — | self (existing commented interface) | exact |
| `src/routes/+page.server.ts` (MODIFIED) | loader | request-response | `src/routes/skyttere/+page.server.ts` | exact |
| `src/routes/skyttere/+page.server.ts` (MODIFIED) | loader | request-response | `src/routes/+page.server.ts` | exact |
| `src/routes/premieliste/+page.server.ts` (MODIFIED) | loader | request-response | `src/routes/+page.server.ts` | role-match |
| `src/routes/+layout.svelte` (MODIFIED) | component | request-response | self (existing layout) | exact |
| `src/routes/+error.svelte` (MODIFIED) | component | request-response | self (existing error page) | exact |
| `src/lib/assets/stordalen.jpg` -> `static/clubs/stordalen.jpg` (MOVED) | asset | — | `static/stordalen.jpg` (existing static root) | exact |

---

## Pattern Assignments

### `src/lib/clubs.ts` (NEW — config)

**Analog:** `src/lib/constants.ts`

No hooks.server.ts or layout.server.ts exists yet — this file is purely new. The analog for project
conventions is `constants.ts` (same `$lib` layer, exports a typed constant).

**Analog export pattern** (`src/lib/constants.ts` line 1):
```typescript
export const DEFAULT_CLUB_ID = '10782';
```

**Pattern to implement — typed Record export:**
```typescript
// src/lib/clubs.ts
export interface ClubConfig {
	clubId: string;
	name: string;
	logoPath: string;
}

export const clubs: Record<string, ClubConfig> = {
	stordalen: {
		clubId: '10782',
		name: 'Stordalen Skytterlag',
		logoPath: '/clubs/stordalen.jpg'
	}
};
```

Conventions from `constants.ts` and CLAUDE.md: named exports (no default), single quotes, tabs,
PascalCase type alias (`ClubConfig`), camelCase const (`clubs`).

---

### `src/hooks.server.ts` (NEW — middleware, request-response)

**Analog:** No existing `hooks.server.ts`. Closest structural analog is `src/routes/+page.server.ts`
for server-only TypeScript module conventions. RESEARCH.md Pattern 1 is authoritative.

**Import style reference** (`src/routes/+page.server.ts` lines 1-3):
```typescript
import type { PageServerLoad } from './$types';
import { getShootersByClub } from '$lib/server/graphql/queries';
import { DEFAULT_CLUB_ID } from '$lib/constants';
```

**Pattern to implement:**
```typescript
// src/hooks.server.ts
import { error, type Handle } from '@sveltejs/kit';
import { clubs } from '$lib/clubs';

export const handle: Handle = async ({ event, resolve }) => {
	let slug: string;

	if (event.url.hostname === 'localhost' || event.url.hostname === '127.0.0.1') {
		const devClub = import.meta.env.VITE_DEV_CLUB;
		if (!devClub) {
			throw new Error('VITE_DEV_CLUB must be set in .env.local for local development');
		}
		slug = devClub;
	} else {
		slug = event.url.hostname.split('.')[0];
	}

	const club = clubs[slug];
	if (!club) {
		error(404, 'Siden finnes ikke');
	}

	event.locals.club = club;
	return resolve(event);
};
```

Note: hostname check alone gates the dev branch; `DEV` from `$app/environment` is an option but
adds an import without extra benefit given the explicit localhost check.

---

### `src/routes/+layout.server.ts` (NEW — loader, request-response)

**Analog:** `src/routes/+page.server.ts`

**Import style** (`src/routes/+page.server.ts` line 1):
```typescript
import type { PageServerLoad } from './$types';
```

**Pattern to implement — thin passthrough loader:**
```typescript
// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return { club: locals.club };
};
```

Same `$types` import style, `async` arrow function assigned to `load`, named export.

---

### `src/app.d.ts` (MODIFIED — config)

**Analog:** Self — the commented-out `interface Locals {}` at line 6.

**Current file** (`src/app.d.ts` lines 1-13):
```typescript
// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
```

**Pattern to implement — uncomment and extend Locals:**
```typescript
// src/app.d.ts
import type { ClubConfig } from '$lib/clubs';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			club: ClubConfig;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
```

`import type` before `declare global` — SvelteKit convention for importing types into ambient
declaration file.

---

### `src/routes/+page.server.ts` (MODIFIED — loader, request-response)

**Analog:** `src/routes/skyttere/+page.server.ts` — identical file, exact match.

**Current full file** (`src/routes/+page.server.ts` lines 1-19):
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

**After modification** — remove `DEFAULT_CLUB_ID` import, replace `{ url }` with `{ locals }`,
replace lines 6-7 with single destructure; keep try/catch and return shape identical:
```typescript
import type { PageServerLoad } from './$types';
import { getShootersByClub } from '$lib/server/graphql/queries';

export const load: PageServerLoad = async ({ locals }) => {
	const { clubId } = locals.club;
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

### `src/routes/skyttere/+page.server.ts` (MODIFIED — loader, request-response)

**Analog:** `src/routes/+page.server.ts` — byte-for-byte identical today, same change applies.

Apply the exact same diff as above. Both files will remain identical after modification.

---

### `src/routes/premieliste/+page.server.ts` (MODIFIED — loader, request-response)

**Analog:** `src/routes/+page.server.ts` — same role, different query function and return shape.

**Current full file** (`src/routes/premieliste/+page.server.ts` lines 1-19):
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

**After modification:**
```typescript
import type { PageServerLoad } from './$types';
import { getShootersWithDistinctions } from '$lib/server/graphql/queries';

export const load: PageServerLoad = async ({ locals }) => {
	const { clubId } = locals.club;
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

### `src/routes/+layout.svelte` (MODIFIED — component)

**Analog:** Self — existing file is the only layout.

**Current import and usage** (`src/routes/+layout.svelte` lines 3, 10, 26):
```typescript
import stordalenLogo from '$lib/assets/stordalen.jpg';
```
```typescript
let { children } = $props();
```
```svelte
<a href="/"><img src={stordalenLogo} alt="Skytterinfo" class="h-8 w-auto" /></a>
```

**After modification:**
- Remove `import stordalenLogo` line
- Add `data` to `$props()` destructure
- Replace static `src` and `alt`

```typescript
let { children, data } = $props();
```
```svelte
<a href="/"><img src={data.club.logoPath} alt={data.club.name} class="h-8 w-auto" /></a>
```

Layout already uses Svelte 5 runes — keep that syntax. No other lines change.

---

### `src/routes/+error.svelte` (MODIFIED — component)

**Analog:** Self — existing file.

**Current import and logo** (`src/routes/+error.svelte` lines 2, 9):
```typescript
import stordalenLogo from '$lib/assets/stordalen.jpg';
```
```svelte
<img src={stordalenLogo} alt="Skytterinfo" class="h-8 w-auto sm:h-10" />
```

**After modification:**
- Remove `import stordalenLogo` line entirely
- Replace `src` with static `/favicon.ico` (verified: `static/favicon.ico` exists; `static/favicon.png` does NOT exist)

```svelte
<img src="/favicon.ico" alt="Skytterinfo" class="h-8 w-auto sm:h-10" />
```

RESEARCH.md assumption A2 suggested `/favicon.png` — that file does not exist in `static/`. Use
`/favicon.ico` instead. If the result looks bad (`.ico` rendering as `<img>` varies by browser),
remove the `<img>` entirely rather than pointing at a missing file.

---

### `static/clubs/stordalen.jpg` (MOVED asset)

**Source:** `src/lib/assets/stordalen.jpg`
**Destination:** `static/clubs/stordalen.jpg`

**Git operation:** `git mv src/lib/assets/stordalen.jpg static/clubs/stordalen.jpg`

The `static/clubs/` directory does not exist yet — create it via the move. After the move,
`src/lib/assets/` is empty (Git drops empty dirs automatically).

**Note:** `static/stordalen.jpg` exists at the static root — appears to be an older copy predating
the `src/lib/assets/` import. Planner should confirm whether to delete it as cleanup.

---

## Shared Patterns

### Server Loader Shell
**Source:** All three `src/routes/*/+page.server.ts` files
**Apply to:** All three loader modifications and `+layout.server.ts`

```typescript
import type { <X>Load } from './$types';
import { <queryFn> } from '$lib/server/graphql/queries';

export const load: <X>Load = async ({ locals }) => {
	const { clubId } = locals.club;
	try {
		// query call
	} catch (error) {
		console.error('<message>:', error);
		return {
			// empty/null shape
			error: error instanceof Error ? error.message : 'Unknown error occurred',
			clubId
		};
	}
};
```

### `$lib` Path Convention
**Source:** All three `+page.server.ts` imports
**Apply to:** `clubs.ts`, `hooks.server.ts`, `+layout.server.ts`

- Server-only code: `$lib/server/graphql/` prefix signals server-only
- `clubs.ts` goes in `$lib/` (not `$lib/server/`) — no secrets, needed by layout server load
- Import as `$lib/clubs` — no barrel re-export

---

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `src/hooks.server.ts` | middleware | request-response | No hooks.server.ts exists in project; pattern from RESEARCH.md + SvelteKit docs |

---

## Additional Notes for Planner

**`src/lib/constants.ts` deletion:** Only export is `DEFAULT_CLUB_ID = '10782'`. After removing
three loader imports, no consumers remain. Delete the file and all three
`import { DEFAULT_CLUB_ID } from '$lib/constants'` lines.

**`src/lib/assets/` directory:** Empty after the move. Git drops it automatically — no action needed.

**`static/stordalen.jpg`:** Exists at static root. Likely an older copy. Planner should decide
whether to delete it as part of cleanup.

**Wave 0 ordering constraint:** `src/lib/clubs.ts` and `src/app.d.ts` must be created/updated first.
`hooks.server.ts` imports from `$lib/clubs` and depends on `App.Locals.club` being typed.
`+layout.server.ts` also imports the type. Creating clubs.ts and updating app.d.ts unblocks all
remaining files.

---

## Metadata

**Analog search scope:** `src/routes/`, `src/lib/`, `src/`
**Files read:** 9 source files
**Pattern extraction date:** 2026-05-21
