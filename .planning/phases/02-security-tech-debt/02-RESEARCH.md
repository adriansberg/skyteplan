# Phase 2: Security & Tech Debt - Research

**Researched:** 2026-05-18
**Domain:** SvelteKit server-only loaders, Svelte 5 rune migration, error handling
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01:** Create `src/lib/server/graphql/client.ts` as the new server-only GraphQL client. Uses `$env/static/private` to read `AUTH_TOKEN`. SvelteKit enforces server-only by virtue of the `$lib/server/` path — cannot be accidentally imported client-side.

**D-02:** Move `src/lib/graphql/queries.ts` → `src/lib/server/graphql/queries.ts`. Co-locate with the server client. The existing `src/lib/graphql/` directory retains only `types.ts`.

**D-03:** All three route loaders rename from `+page.ts` → `+page.server.ts` and import from the new server paths. Delete old `+page.ts` files.

**D-04:** Vercel env var renamed from `VITE_AUTH_TOKEN` to `AUTH_TOKEN`. Document the required rename in a code comment or README note.

**D-05:** `+error.svelte` uses the full app nav (reuse sticky nav from `+layout.svelte`) plus an error card.

**D-06:** Error text: "Kunne ikke laste data. Sjekk nettforbindelsen og prøv igjen." with retry link. Show `$page.error.message` in smaller muted text below if available.

### Claude's Discretion

- **SEC-02 failure behavior:** Invalid `?c=` falls back to `DEFAULT_CLUB_ID` silently.
- **DEBT-01 + DEBT-03 task ordering:** Rune migration and Felt grouping extraction — same task per page or separate passes — Claude decides.
- **Retry link target:** `window.history.back()` or `href="/"` — Claude picks.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SEC-01 | All GraphQL calls moved to `+page.server.ts`; `AUTH_TOKEN` read from `$env/static/private`; never in client bundle | `$lib/server/` enforcement, `PageServerLoad` type, `$env/static/private` import pattern |
| SEC-02 | Club ID from `?c=` validated against `/^\d+$/` before passing to GraphQL | Simple string test in server loader before query call |
| DEBT-01 | `+page.svelte`, `skyttere/+page.svelte`, `Splash.svelte` migrated to Svelte 5 runes | `$props()`, `$derived()`, `$state()`, `$bindable()` patterns |
| DEBT-02 | `premieliste/+page.server.ts` returns `error` field on failure | Match try/catch pattern from other two loaders |
| DEBT-03 | Felt grouping logic extracted to `src/lib/utils/helpers.ts` | Type-safe extraction, `SvelteSet` dependency lives in component not helper |
| DEBT-04 | `src/routes/+error.svelte` with Norwegian error message | `$page.error.message`, `page` from `$app/state`, nav reuse |
</phase_requirements>

---

## Summary

This phase has two independent tracks that can be executed in any order: (1) move GraphQL to server-only loaders with `$lib/server/` enforcement and `$env/static/private`, and (2) migrate remaining Svelte 4 syntax to runes + fix error handling gaps.

The server migration is mechanical: create `src/lib/server/graphql/` with two files, rename three `+page.ts` to `+page.server.ts`, update imports, delete old files, update barrel, rename env var. SvelteKit's build-time static analysis then guarantees the token cannot reach the client bundle.

The tech debt track is also mechanical but has one subtlety: `Splash.svelte` uses `bind:show` from the parent (`+page.svelte`), so `show` must become `$bindable()` in Splash when migrating. The Felt grouping extraction removes a `SvelteSet` dependency from the helper (helpers must be pure TS with no Svelte imports) — the deduplication logic still works with a plain `Set`.

**Primary recommendation:** Execute server migration first (SEC-01, SEC-02) as Wave 1 — it changes loader types and import paths which the rune migration tasks depend on for correct `PageServerLoad` types. Then rune migration + error work as Wave 2.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| GraphQL auth token | API / Backend (server loader) | — | Token is a server secret; must never reach browser bundle |
| Club ID validation | API / Backend (server loader) | — | Validation happens before the GraphQL call, in the loader |
| Data fetching | API / Backend (server loader) | — | `+page.server.ts` — runs on server only |
| Reactive UI state | Browser / Client (Svelte component) | — | `$state`, `$derived` live in `.svelte` files |
| Error page | Frontend Server (SSR) + Browser | — | `+error.svelte` renders on both, layout provides nav |
| Felt grouping helper | Utility (pure TS) | — | Extracted to `helpers.ts` — no Svelte imports allowed |

---

## Standard Stack

### Core (already installed — no new packages)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@sveltejs/kit` | 2.59.1 | Server loaders, `$lib/server` enforcement, error pages | Project framework — locked |
| `svelte` | 5.55.7 | Runes API (`$props`, `$derived`, `$state`, `$bindable`) | Project component model — locked |
| `graphql-request` | 7.4.0 | GraphQL client in server module | Already used — no change |
| `graphql` | ^16.11.0 | Peer dep for query parsing | Already used — no change |

### Environment Variable Access

| Import | Available In | Purpose |
|--------|-------------|---------|
| `$env/static/private` | `+page.server.ts`, `+layout.server.ts`, `hooks.server.ts`, `$lib/server/**` | Private env vars — inlined at build time, never in client bundle |
| `$env/dynamic/private` | Same | Runtime env vars — not needed here |
| `import.meta.env.VITE_*` | Anywhere (client + server) | **Do not use** for secrets — embedded in client bundle |

**No new packages to install.** This phase is pure refactoring.

---

## Package Legitimacy Audit

No external packages are added in this phase. Section not applicable.

---

## Architecture Patterns

### System Architecture Diagram

```
Browser                     Vercel Edge / Server
  |                                |
  |-- GET /  ----------------------> +page.server.ts (load)
  |                                  |-- validates ?c= param
  |                                  |-- import AUTH_TOKEN from $env/static/private
  |                                  |-- import getShootersByClub from $lib/server/graphql/queries
  |                                  |-- GraphQL API call ---------> leonls.kongsberg-ts.no
  |                                  |-- returns { shooters, clubId } or { error }
  |<-- serialized data (devalue) ---
  +page.svelte renders with data prop (Svelte 5 runes)

  invalidateAll() (RefreshButton / PullToRefresh)
  |-- re-runs +page.server.ts load on server
  |-- returns fresh data
  +page.svelte updates reactively

  Error path:
  load throws / error() called
  |-- SvelteKit catches
  |-- renders +error.svelte (with +layout.svelte nav)
  |-- $page.error.message displayed
```

### Recommended Project Structure (after migration)

```
src/
├── lib/
│   ├── server/
│   │   └── graphql/
│   │       ├── client.ts      # GraphQL client with AUTH_TOKEN from $env/static/private
│   │       └── queries.ts     # All three query functions (moved from $lib/graphql/queries.ts)
│   ├── graphql/
│   │   └── types.ts           # Pure domain types — stays here, safe for client import
│   ├── utils/
│   │   ├── helpers.ts         # + groupFeltEvents() extracted helper (pure TS, no Svelte imports)
│   │   └── formatters.ts      # unchanged
│   ├── components/
│   │   └── Splash.svelte      # migrated: export let show → let { show = $bindable() } = $props()
│   ├── constants.ts           # unchanged
│   └── index.ts               # REMOVE getShootersByClub export (queries now server-only)
│                               # OR update to re-export from $lib/server — but only server code
│                               # can import $lib/server, so $lib/index.ts must drop the export
├── routes/
│   ├── +error.svelte          # NEW — Norwegian error page with nav
│   ├── +layout.svelte         # unchanged
│   ├── +page.server.ts        # RENAMED from +page.ts; PageServerLoad type
│   ├── +page.svelte           # migrated to Svelte 5 runes
│   ├── skyttere/
│   │   ├── +page.server.ts    # RENAMED from +page.ts; PageServerLoad type
│   │   └── +page.svelte       # migrated to Svelte 5 runes
│   └── premieliste/
│       ├── +page.server.ts    # RENAMED from +page.ts; PageServerLoad type + DEBT-02 error field
│       └── +page.svelte       # already runes — no change needed
```

### Pattern 1: Server-Only GraphQL Client

```typescript
// src/lib/server/graphql/client.ts
// Source: https://svelte.dev/docs/kit/server-only-modules
import { GraphQLClient } from 'graphql-request'
import { AUTH_TOKEN } from '$env/static/private'

const endpoint = 'https://leonls.kongsberg-ts.no/api'

// This file lives in $lib/server/ — SvelteKit build-time analysis
// prevents any client-side code from importing it, even transitively.
export const graphqlClient = new GraphQLClient(endpoint, {
	headers: {
		Authorization: `Bearer ${AUTH_TOKEN}`,
		'Content-Type': 'application/json'
	}
})
```

### Pattern 2: Server Loader with Validation

```typescript
// src/routes/+page.server.ts
// Source: https://svelte.dev/docs/kit/load
import type { PageServerLoad } from './$types'
import { getShootersByClub } from '$lib/server/graphql/queries'
import { DEFAULT_CLUB_ID } from '$lib/constants'

export const load: PageServerLoad = async ({ url }) => {
	const raw = url.searchParams.get('c') || DEFAULT_CLUB_ID
	// SEC-02: silently fall back on invalid input
	const clubId = /^\d+$/.test(raw) ? raw : DEFAULT_CLUB_ID

	try {
		const shooters = await getShootersByClub(clubId)
		return { shooters, clubId }
	} catch (error) {
		console.error('Error loading shooters:', error)
		return {
			shooters: null,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
			clubId
		}
	}
}
```

### Pattern 3: Svelte 5 Rune Migration — Route Page

```svelte
<!-- +page.svelte — Svelte 5 -->
<!-- Source: https://svelte.dev/docs/svelte/v5-migration-guide -->
<script lang="ts">
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()

	// $: shooters = data.shooters  →  reactive via $derived
	let shooters = $derived(data.shooters)
	let error = $derived(data.error)
</script>
```

Note: `data.shooters` updates when `invalidateAll()` re-runs the server loader. In Svelte 5, `$derived(data.shooters)` re-evaluates when `data` prop updates — this works correctly because `data` is a reactive prop.

### Pattern 4: Bindable Prop — Splash Component

```svelte
<!-- src/lib/components/Splash.svelte — Svelte 5 -->
<!-- Source: https://svelte.dev/docs/svelte/$bindable -->
<script lang="ts">
	import { onMount } from 'svelte'
	import stordalenLogo from '$lib/assets/stordalen.jpg'

	let { show = $bindable(false) } = $props()
	let minimumSplashTime = 1500

	onMount(() => {
		const hasSeenSplash = sessionStorage.getItem('stordalen-splash-shown')
		if (!hasSeenSplash) {
			show = true
			sessionStorage.setItem('stordalen-splash-shown', 'true')
			const splashTimer = setTimeout(() => {
				show = false
			}, minimumSplashTime)
			return () => clearTimeout(splashTimer)
		}
	})
</script>
```

Parent call site in `+page.svelte` stays `<Splash bind:show={showSplash} />` — no change needed there.

### Pattern 5: Error Page with Nav Reuse

```svelte
<!-- src/routes/+error.svelte -->
<!-- Source: https://svelte.dev/docs/kit/errors -->
<script lang="ts">
	import { page } from '$app/state'
	import stordalenLogo from '$lib/assets/stordalen.jpg'
</script>

<!-- Replicate sticky nav from +layout.svelte -->
<header class="sticky top-0 z-40 border-b border-gray-200 bg-white">
	<!-- nav markup copied from +layout.svelte -->
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

**Why copy nav rather than import layout:** `+error.svelte` at root level cannot inherit the root `+layout.svelte` nav when the error originates from the root layout's load function (SvelteKit walks up the tree past the layout that errored). Copying the nav markup is the safe approach. [CITED: https://svelte.dev/docs/kit/errors]

**Retry link:** Use `href="/"` — more reliable than `window.history.back()` since the error may be the user's first page load.

### Pattern 6: Felt Grouping Extraction

Current inline logic in `+page.svelte` uses `SvelteSet` (Svelte-specific). The extracted helper must be pure TypeScript (no Svelte imports). Replace `SvelteSet` with plain `Set<string>` — the deduplication logic is identical.

```typescript
// src/lib/utils/helpers.ts — new export
import type { Shooter, Event } from '$lib/graphql/types'
import { parseAsLocalTime } from './formatters'

export type EventWithShooter = Event & {
	shooter: Shooter
	subEvents?: (Event & { shooter: Shooter })[]
}

export function groupFeltEvents(shooters: Shooter[]): EventWithShooter[] {
	const allEvents: EventWithShooter[] = []

	shooters.forEach((shooter) => {
		const processedEvents = new Set<string>()

		shooter.events.forEach((event) => {
			const eventKey = `${event.name}-${event.shootingDateTime}-${event.targetNumber}-${event.relayNumber}`
			if (processedEvents.has(eventKey)) return

			if (event.name === 'Felt') {
				const relatedEvents = shooter.events.filter(
					(e) =>
						['Minne', 'Felthurtig', 'Stang'].includes(e.name) &&
						e.shootingDateTime === event.shootingDateTime &&
						e.targetNumber === event.targetNumber &&
						e.relayNumber === event.relayNumber
				)
				if (relatedEvents.length > 0) {
					allEvents.push({ ...event, shooter, subEvents: relatedEvents.map((e) => ({ ...e, shooter })) })
					relatedEvents.forEach((e) => {
						processedEvents.add(`${e.name}-${e.shootingDateTime}-${e.targetNumber}-${e.relayNumber}`)
					})
				} else {
					allEvents.push({ ...event, shooter })
				}
			} else {
				const correspondingFelt = shooter.events.find(
					(e) =>
						e.name === 'Felt' &&
						e.shootingDateTime === event.shootingDateTime &&
						e.targetNumber === event.targetNumber &&
						e.relayNumber === event.relayNumber
				)
				if (!correspondingFelt) {
					allEvents.push({ ...event, shooter })
				}
			}
			processedEvents.add(eventKey)
		})
	})

	allEvents.sort(
		(a, b) =>
			parseAsLocalTime(a.shootingDateTime).getTime() -
			parseAsLocalTime(b.shootingDateTime).getTime()
	)

	return allEvents
}
```

`skyttere/+page.svelte` does NOT use the Felt grouping logic — it renders all events flat per shooter. Only `+page.svelte` (schedule) needs this helper.

### Pattern 7: DEBT-02 — Premieliste Error Field

```typescript
// src/routes/premieliste/+page.server.ts
export const load: PageServerLoad = async ({ url }) => {
	const raw = url.searchParams.get('c') || DEFAULT_CLUB_ID
	const clubId = /^\d+$/.test(raw) ? raw : DEFAULT_CLUB_ID
	try {
		const shootersWithDistinctions = await getShootersWithDistinctions(clubId)
		return { shootersWithDistinctions, clubId, error: null }
	} catch (error) {
		console.error('Error loading distinctions:', error)
		return {
			shootersWithDistinctions: [],
			clubId,
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		}
	}
}
```

`premieliste/+page.svelte` already uses `$props()` — it only needs an `error` prop wired up in the template.

### Anti-Patterns to Avoid

- **`import.meta.env.VITE_*` for secrets:** Inlined into client bundle by Vite. `VITE_` prefix is the signal that a var is public. Use `$env/static/private` in `$lib/server/` code only. [CITED: https://svelte.dev/docs/kit/server-only-modules]
- **Universal `+page.ts` for server secrets:** Universal loaders run in the browser on client navigation — any secret they use leaks. [CITED: https://svelte.dev/docs/kit/load]
- **`SvelteSet`/`SvelteMap` in pure TS helpers:** These Svelte-specific reactivity wrappers have no benefit outside components. Use `Set`/`Map` in `helpers.ts`. [ASSUMED]
- **Barrel re-export of server-only queries from `$lib/index.ts`:** `src/lib/index.ts` is a universal module (can be client-imported). After queries move to `$lib/server/`, the existing `export { getShootersByClub } from './graphql/queries'` in `$lib/index.ts` must be removed. Server loaders import directly from `$lib/server/graphql/queries`. [CITED: https://svelte.dev/docs/kit/server-only-modules]
- **`$:` reactive in runes-mode files:** Svelte 5 files using `$props()` must not mix `$:` syntax — use `$derived()`/`$state()` throughout. [CITED: https://svelte.dev/docs/svelte/v5-migration-guide]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Server-only module enforcement | Custom build plugin | `$lib/server/` path convention | SvelteKit static analysis does it at build time |
| Private env var access | Custom env loading | `$env/static/private` | Tree-shaken, inlined, enforced by SvelteKit — no runtime overhead |
| Error boundary | Manual try/catch in every component | `+error.svelte` + SvelteKit error boundary | Framework handles the rendering and layout walk-up automatically |
| Club ID validation | Complex parsing | `/^\d+$/` regex test | Club IDs are integers only; one-liner is sufficient and sufficient |

---

## Common Pitfalls

### Pitfall 1: `$lib/index.ts` still exports server-only query

**What goes wrong:** After queries move to `$lib/server/graphql/queries.ts`, the old barrel `src/lib/index.ts` still has `export { getShootersByClub } from './graphql/queries'` — which now fails because `./graphql/queries.ts` is deleted. If the barrel is updated to re-export from `$lib/server/`, the entire `$lib/index.ts` becomes server-tainted and any client that imports `$lib` will get a build error.

**How to avoid:** Delete the export from `$lib/index.ts` entirely. Server loaders import directly from `$lib/server/graphql/queries`. The barrel becomes an empty shell or is deleted.

**Warning signs:** `yarn build` or `yarn check` error: "Cannot import $lib/server/... into code that runs in the browser."

### Pitfall 2: `skyttere/+page.svelte` imports `$types` from wrong path

**What goes wrong:** Current `skyttere/+page.svelte` has `import type { PageData } from '../skyttere/$types'` (wrong — should be `./$types`). After rename to `+page.server.ts`, the generated `$types` will expose `PageData` from `PageServerLoad`, not `PageLoad`. The import path must be `./$types`, not the navigated path.

**How to avoid:** Fix import to `import type { PageData } from './$types'` when migrating this file.

**Warning signs:** TypeScript errors about `PageData` not matching expected shape after server migration.

### Pitfall 3: `$derived(data.shooters)` vs plain assignment

**What goes wrong:** In Svelte 5 runes mode, writing `let shooters = data.shooters` creates a variable that is NOT reactive — it captures the value at mount time. When `invalidateAll()` re-runs the loader and updates `data`, `shooters` does not update.

**How to avoid:** Use `let shooters = $derived(data.shooters)` — this re-evaluates when the `data` prop updates. [CITED: https://svelte.dev/docs/svelte/v5-migration-guide]

**Warning signs:** Refresh button appears to do nothing; page data doesn't update after `invalidateAll()`.

### Pitfall 4: Splash `bind:show` breaks without `$bindable()`

**What goes wrong:** In Svelte 5 runes mode, props are not bindable by default. If `Splash.svelte` declares `let { show } = $props()` (without `$bindable()`), the parent's `<Splash bind:show={showSplash} />` will throw a runtime error or TypeScript error.

**How to avoid:** Declare `let { show = $bindable(false) } = $props()` in Splash. [CITED: https://svelte.dev/docs/svelte/$bindable]

**Warning signs:** TypeScript: "Property 'show' is not declared as bindable" / runtime: bind failed.

### Pitfall 5: Vercel env var rename not applied before deploy

**What goes wrong:** Code uses `AUTH_TOKEN` from `$env/static/private` but Vercel project still has `VITE_AUTH_TOKEN`. Build succeeds locally (`.env` has the new key) but deployed app gets empty token → all GraphQL calls 401.

**How to avoid:** D-04 requires a code comment or note documenting the manual Vercel dashboard step. Add to `src/lib/server/graphql/client.ts`: `// Vercel env var: AUTH_TOKEN (NOT VITE_AUTH_TOKEN — rename in Vercel dashboard before deploy)`.

**Warning signs:** Production 401 errors; no local failures (`.env` was updated correctly).

### Pitfall 6: `+error.svelte` at root inherits root layout — but only when layout doesn't error

**What goes wrong:** If the root `+layout.svelte` load function throws, SvelteKit renders the fallback error page (not `+error.svelte`) because the layout that would contain the error page is itself broken.

**Impact for this app:** `+layout.svelte` has no load function — it's purely a UI shell. So `+error.svelte` at root will correctly inherit the layout (nav appears) when page load functions throw. No special handling needed.

**Warning signs:** Only matters if a load function is ever added to `+layout.svelte` or `+layout.server.ts`.

---

## Runtime State Inventory

Step 2.5: SKIPPED — not a rename/refactor/migration phase in the string-replacement sense. The phase renames files and env vars, but no stored data or runtime state contains `VITE_AUTH_TOKEN` as a key. The Vercel dashboard env var rename is a deployment concern captured in Pitfall 5.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build/dev | ✓ | 22.14.0 | — |
| Yarn | Package manager | ✓ | 1.22.19 | — |
| `$env/static/private` | SEC-01 | ✓ | SvelteKit built-in | — |
| Vercel dashboard | Auth token rename (D-04) | N/A — manual step | — | Document in code comment |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** Vercel dashboard access — if unavailable at deploy time, keep old `VITE_AUTH_TOKEN` temporarily and update client.ts accordingly (one-line change).

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None found — no test files, no test config |
| Config file | None |
| Quick run command | `yarn check && yarn build` |
| Full suite command | `yarn check && yarn build` |

No automated test suite exists. Validation is build-time type checking + manual browser verification.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SEC-01 | AUTH_TOKEN absent from client bundle | Build artifact grep | `yarn build && grep -r "AUTH_TOKEN" .svelte-kit/output/client/ \|\| echo PASS` | ❌ Wave 0: run after build |
| SEC-02 | Non-digit `?c=` falls back to default | Manual browser test | — | Manual |
| DEBT-01 | No `export let` or `$:` in target files | Static grep | `grep -r "export let\|\\$:" src/routes/+page.svelte src/routes/skyttere/+page.svelte src/lib/components/Splash.svelte` | ❌ Wave 0: run after migration |
| DEBT-02 | Premieliste loader returns error field | Type check | `yarn check` (PageServerLoad return type check) | ✓ via yarn check |
| DEBT-03 | groupFeltEvents in helpers.ts, removed from +page.svelte | Static grep | `grep -n "Felt" src/routes/+page.svelte` (should show only template usage, not grouping logic) | Manual |
| DEBT-04 | +error.svelte exists with Norwegian text | File exists + grep | `grep "Kunne ikke laste" src/routes/+error.svelte` | ❌ Wave 0: file must be created |

### Sampling Rate

- **Per task commit:** `yarn check`
- **Per wave merge:** `yarn check && yarn build`
- **Phase gate:** `yarn check && yarn build` green + manual SEC-01 bundle grep + SEC-02 browser test

### Wave 0 Gaps

- [ ] No test framework to install — use build + grep as validation
- [ ] Add SEC-01 bundle check to verification: `yarn build && ! grep -r "AUTH_TOKEN" .svelte-kit/output/client/ && echo "SEC-01 PASS"`

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No (app is read-only, single Bearer token) | — |
| V3 Session Management | No | — |
| V4 Access Control | Partial — token must not reach client | `$lib/server/` + `$env/static/private` |
| V5 Input Validation | Yes — club ID from URL param | `/^\d+$/` regex in server loader |
| V6 Cryptography | No | — |

### Known Threat Patterns for SvelteKit + Vite

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Secret in client bundle via `VITE_*` | Information Disclosure | Use `$env/static/private` in `$lib/server/` only |
| URL param injection into GraphQL query | Tampering | Validate `?c=` with `/^\d+$/`; GraphQL uses parameterized variables (no string interpolation) |
| XSS via error message display | Tampering | Svelte template auto-escapes `{page.error.message}` — no raw HTML rendering |

---

## Open Questions

1. **`src/lib/index.ts` after barrel removal**
   - What we know: Currently exports `getShootersByClub` from `./graphql/queries`. After migration that file moves.
   - What's unclear: Whether to delete `$lib/index.ts` entirely or keep it as an empty/comment-only file.
   - Recommendation: Remove the export; leave the file with a comment explaining queries are now server-only. SvelteKit's `$lib` alias still works for other imports from `$lib/`.

2. **`skyttere/+page.svelte` wrong `$types` import path**
   - What we know: Line 8 is `import type { PageData } from '../skyttere/$types'` — this is already wrong in the current code (should be `./$types`).
   - What's unclear: Whether this causes a current TypeScript error or silently resolves.
   - Recommendation: Fix to `./$types` when doing the rune migration task for this file.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `import.meta.env.VITE_*` for any env var | `$env/static/private` for secrets, `$env/static/public` for public | SvelteKit 1.x+ | Secrets enforced out of client bundle at build time |
| `export let data` + `$:` reactive | `let { data } = $props()` + `$derived()` | Svelte 5 | Explicit reactivity, no implicit dependency tracking issues |
| `Load` type from `@sveltejs/kit` | `PageLoad` or `PageServerLoad` from `./$types` | SvelteKit 2.x | Auto-generated types include route params, stronger guarantees |
| Universal `+page.ts` for all data | `+page.server.ts` for sensitive data, `+page.ts` for public | SvelteKit 1.x+ | Explicit server/client boundary |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `SvelteSet` has no benefit in pure TS helpers; plain `Set` is identical for this use case | Architecture Patterns / Pattern 6 | If Svelte 5 compiler transforms `Set` differently in templates, groupFeltEvents may not trigger re-renders — but the helper returns a plain array, so this is not a concern |
| A2 | `skyttere/+page.svelte` does not use Felt grouping logic | Architecture Patterns / Pattern 6 | If wrong, DEBT-03 scope expands — but code inspection confirms it renders events flat |

**All other claims are VERIFIED (official SvelteKit/Svelte docs) or CITED.**

---

## Sources

### Primary (HIGH confidence)
- [SvelteKit: Loading data](https://svelte.dev/docs/kit/load) — `+page.server.ts` vs `+page.ts`, `PageServerLoad` type, `error()` helper
- [SvelteKit: Server-only modules](https://svelte.dev/docs/kit/server-only-modules) — `$lib/server/` enforcement, `$env/static/private`
- [SvelteKit: Errors](https://svelte.dev/docs/kit/errors) — `+error.svelte`, `$page.error.message`, expected vs unexpected errors
- [Svelte 5: Migration guide](https://svelte.dev/docs/svelte/v5-migration-guide) — `export let` → `$props()`, `$:` → `$derived`/`$state`
- [Svelte 5: $bindable](https://svelte.dev/docs/svelte/$bindable) — bindable props, `$bindable()` rune

### Secondary (MEDIUM confidence)
- Direct code inspection: `src/lib/graphql/client.ts`, all three `+page.ts` loaders, all three `+page.svelte` files, `Splash.svelte`, `+layout.svelte`, `helpers.ts` — confirmed current state

### Tertiary (LOW confidence)
- None — all architecture claims verified against official docs or code

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; all existing, version-confirmed
- Architecture: HIGH — verified against official SvelteKit/Svelte 5 docs
- Pitfalls: HIGH — 4 of 6 confirmed via code inspection; 2 confirmed via official docs
- Security: HIGH — `$env/static/private` + `$lib/server/` is the documented SvelteKit mechanism

**Research date:** 2026-05-18
**Valid until:** 2026-11-18 (stable APIs; SvelteKit 2.x and Svelte 5 both stable)
