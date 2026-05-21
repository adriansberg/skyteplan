# Phase 06: Multi-Club Routing — Research

**Researched:** 2026-05-21
**Domain:** SvelteKit server-side club resolution, subdomain routing, layout data flow
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Dev fallback: resolve club from `VITE_DEV_CLUB` env var when host is localhost/127.0.0.1.
- **D-02:** If `VITE_DEV_CLUB` unset in dev: throw a clear error. No silent fallback.
- **D-03:** Club logos in `static/clubs/{slug}.jpg`. `logoPath` is a public URL path (`/clubs/stordalen.jpg`).
- **D-04:** `src/lib/assets/stordalen.jpg` moves to `static/clubs/stordalen.jpg`. All `stordalenLogo` imports in layout/error/splash replaced by clubs.ts-resolved path.
- **D-05:** Unknown subdomain: `error(404, 'Siden finnes ikke')` in `+layout.server.ts`. Reuses existing `+error.svelte`.
- **D-06:** Norwegian 404 copy: `"Siden finnes ikke"`.
- **D-07:** Stordalen key: `stordalen`. Entry: `{ clubId: '10782', name: 'Stordalen Skytterlag', logoPath: '/clubs/stordalen.jpg' }`.
- **D-08:** Display name: `"Stordalen Skytterlag"` (logo alt and any text rendering).
- **D-09:** New `+layout.server.ts` resolves club from host header (or `VITE_DEV_CLUB` in dev), returns `{ club }` with type `{ clubId, name, logoPath }`.
- **D-10:** Page server loaders receive `clubId` via `event.locals` (set in `hooks.server.ts`) OR re-read host header. Research picks mechanism.
- **D-11:** `url.searchParams.get('c')` removed from all three loaders. `DEFAULT_CLUB_ID` no longer used in loaders.

### Claude's Discretion

- How `clubId` flows from layout to page loaders — `event.locals` (set in `hooks.server.ts`) vs. re-resolving per loader.
- Whether `hooks.server.ts` is introduced to set `locals.club` once for all routes, or each loader independently resolves from host.
- Exact TypeScript type for the `clubs` map in `clubs.ts`.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CLUB-01 | `src/lib/clubs.ts` defines static map of subdomain → `{ clubId, name, logoPath }` | TypeScript record type; module in `src/lib/` (not `src/lib/server/`) since logoPath is needed by layout |
| CLUB-02 | Club name and logo render in top bar, resolved dynamically per subdomain at server load time | `+layout.server.ts` reads host, returns `{ club }` to `+layout.svelte` via `data` prop |
| ROUTE-01 | All server loaders resolve active club from HTTP host header instead of `?c=` param | `hooks.server.ts` sets `locals.club` once; page loaders read `event.locals.club` |
| ROUTE-02 | Unknown subdomain returns Norwegian 404 (not JS error or blank screen) | `error(404, 'Siden finnes ikke')` in `+layout.server.ts`; reuses `+error.svelte` |
| ROUTE-03 | `?c=` param removed from all loaders and no longer accepted | Delete three `url.searchParams.get('c')` lines; delete `DEFAULT_CLUB_ID` usage in loaders |
</phase_requirements>

---

## Summary

Phase 06 is primarily a **server-side refactor**. Three existing server loaders and the layout all resolve the same club ID via `?c=` query param today. This phase replaces that with subdomain-based resolution: parse the host header, look up the club in a static `clubs.ts` map, and propagate `clubId` server-side.

The UI delta is minimal: one `<img src>` and one `alt` attribute in `+layout.svelte` change from static imports to dynamic values. The error page (`+error.svelte`) also loses its `stordalenLogo` import — replaced by a static fallback since `data.club` is unavailable when an unknown-subdomain 404 fires before layout data resolves.

The key architectural decision (D-10) is resolved by research: **use `hooks.server.ts`** to set `locals.club` once per request. Page server loaders then read `event.locals.club.clubId` directly — no `await parent()` call, no duplicate host parsing, and the club is available in `+server.ts` API routes if any are added later.

**Primary recommendation:** Centralize club resolution in `hooks.server.ts` via `event.locals`. All server-side code (layout loader + three page loaders) reads from locals, not from the host header independently.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Host header parsing / club lookup | API / Backend (hooks.server.ts) | — | Runs once per request before any load function; locals is the SvelteKit-idiomatic channel for request-scoped data |
| Club data exposed to layout UI | Frontend Server (SSR) via `+layout.server.ts` | — | Layout server load reads `locals.club`, returns it to `+layout.svelte` |
| Club logo rendering | Browser / Client via `+layout.svelte` | — | `<img src={data.club.logoPath}>` is a client-side DOM operation; src is a public static path |
| clubId for GraphQL queries | API / Backend (page server loaders) | — | Each `+page.server.ts` reads `event.locals.club.clubId`; no client-side exposure needed |
| Unknown subdomain error | Frontend Server (SSR) | — | `error(404, ...)` thrown in `+layout.server.ts`; renders `+error.svelte` via SSR |
| Club static config | API / Backend (`src/lib/clubs.ts`) | — | Imported by server-only code; not restricted to `src/lib/server/` since logoPath is a public URL |

---

## Standard Stack

### Core (already installed — no new packages)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@sveltejs/kit` | 2.59.1 | `hooks.server.ts`, `+layout.server.ts`, `event.locals`, `error()` helper | Framework — already the project's server runtime |
| `$env/static/public` | built-in | Access `VITE_DEV_CLUB` in server code | SvelteKit env module for public env vars |
| `$env/static/private` | built-in | `AUTH_TOKEN` (already used) | SvelteKit env module for private env vars |

[VERIFIED: svelte.dev/docs/kit/hooks] [VERIFIED: svelte.dev/docs/kit/load]

### No New Packages

Phase 06 installs zero new npm dependencies. All implementation uses existing SvelteKit primitives.

**Installation:** none required.

---

## Package Legitimacy Audit

No packages installed in this phase.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| (none) | — | — | — | — | — | — |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

---

## Architecture Patterns

### System Architecture Diagram

```
HTTP Request (stordalen.skytterinfo.no/*)
        |
        v
hooks.server.ts: handle()
  - parse event.url.hostname → extract subdomain
  - look up clubs[subdomain]
  - dev override: import.meta.env.VITE_DEV_CLUB
  - set event.locals.club = { clubId, name, logoPath }
  - throw error(404) if not found
        |
        v
+layout.server.ts: load({ locals })
  - return { club: locals.club }
        |
     +layout.svelte: data.club.logoPath, data.club.name
        |
        v
+page.server.ts (all three routes): load({ locals })
  - const { clubId } = locals.club
  - call getShootersByClub(clubId)
```

### Recommended Project Structure

```
src/
├── hooks.server.ts          # NEW — club resolution, locals.club
├── app.d.ts                 # UPDATE — add App.Locals.club type
├── lib/
│   ├── clubs.ts             # NEW — static map of subdomain → ClubConfig
│   ├── constants.ts         # UPDATE — remove DEFAULT_CLUB_ID or keep for reference only
│   └── assets/
│       └── stordalen.jpg    # DELETE (moved to static/clubs/stordalen.jpg)
└── routes/
    ├── +layout.server.ts    # NEW — returns { club: locals.club }
    ├── +layout.svelte       # UPDATE — use data.club.logoPath / data.club.name
    ├── +error.svelte        # UPDATE — replace stordalenLogo import with static /favicon.png
    ├── +page.server.ts      # UPDATE — replace ?c= with locals.club.clubId
    ├── skyttere/
    │   └── +page.server.ts  # UPDATE — same
    └── premieliste/
        └── +page.server.ts  # UPDATE — same
static/
└── clubs/
    └── stordalen.jpg        # NEW — moved from src/lib/assets/
```

### Pattern 1: hooks.server.ts — Centralized Club Resolution

**What:** Single `handle()` function parses subdomain, looks up `clubs` map, sets `event.locals.club`.
**When to use:** Any request-scoped data that multiple server load functions need — the canonical SvelteKit pattern for auth, session, and multi-tenant resolution.

```typescript
// src/hooks.server.ts
// Source: https://svelte.dev/docs/kit/hooks
import { error, type Handle } from '@sveltejs/kit';
import { clubs } from '$lib/clubs';
import { DEV } from '$app/environment';

export const handle: Handle = async ({ event, resolve }) => {
	let slug: string;

	if (DEV || event.url.hostname === 'localhost' || event.url.hostname === '127.0.0.1') {
		const devClub = import.meta.env.VITE_DEV_CLUB;
		if (!devClub) {
			throw new Error('VITE_DEV_CLUB must be set in .env.local for local development');
		}
		slug = devClub;
	} else {
		// 'stordalen.skytterinfo.no' → 'stordalen'
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

[CITED: svelte.dev/docs/kit/hooks]

### Pattern 2: clubs.ts — Static Config Map

**What:** Typed record of subdomain slug → club config. Single source of truth.

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

[ASSUMED — TypeScript type shape; standard Record<string, T> pattern]

### Pattern 3: app.d.ts — Locals Typing

**What:** Extend `App.Locals` so `event.locals.club` is typed everywhere.

```typescript
// src/app.d.ts
import type { ClubConfig } from '$lib/clubs';

declare global {
	namespace App {
		interface Locals {
			club: ClubConfig;
		}
	}
}

export {};
```

[CITED: svelte.dev/docs/kit/hooks — "Typing locals" section]

### Pattern 4: +layout.server.ts — Expose Club to Layout

**What:** Thin server loader — reads from locals, returns to layout component.

```typescript
// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return { club: locals.club };
};
```

[CITED: svelte.dev/docs/kit/load — layout server load]

### Pattern 5: Page Loader — Read clubId from locals

**What:** Replace `url.searchParams.get('c') || DEFAULT_CLUB_ID` with `locals.club.clubId`.

```typescript
// src/routes/+page.server.ts (and the two siblings)
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

[CITED: svelte.dev/docs/kit/load — server load, locals]

### Pattern 6: +error.svelte — Logo Fallback

**What:** When unknown subdomain fires 404, layout data never resolves, so `data.club` is unavailable in `+error.svelte`. Replace `stordalenLogo` import with static `/favicon.png`.

```svelte
<!-- src/routes/+error.svelte — logo line change only -->
<img src="/favicon.png" alt="Skytterinfo" class="h-8 w-auto sm:h-10" />
```

[ASSUMED — fallback approach; verified that +error.svelte currently imports stordalenLogo]

### Anti-Patterns to Avoid

- **Re-parsing host in each page loader:** All three `+page.server.ts` files would duplicate the `hostname.split('.')[0]` + clubs lookup logic. A single bug requires three fixes. Use `locals` instead.
- **`await parent()` to get clubId in page loaders:** Calling `await parent()` couples page loaders to layout loader execution order and adds latency. `locals` is set before any load function runs.
- **Using `$env/static/public` for `VITE_DEV_CLUB` in hooks.server.ts:** `$env/static/public` works in hooks but `import.meta.env.VITE_DEV_CLUB` is equally valid and consistent with the CONTEXT.md description.
- **Importing clubs.ts from a `+page.server.ts` that runs client-side:** `clubs.ts` is not in `src/lib/server/` so it is importable anywhere. But club resolution must only happen in server-side code.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Request-scoped data propagation | Global variable or module-level singleton | `event.locals` via `hooks.server.ts` | Locals are per-request; module singletons bleed across requests in serverless |
| 404 error rendering | Custom error component | `error(404, message)` + existing `+error.svelte` | Already wired up; D-05 locks this |
| Env var access in server code | `process.env.VITE_DEV_CLUB` | `import.meta.env.VITE_DEV_CLUB` | SvelteKit Vite-based; `process.env` not reliable in all adapters |

**Key insight:** `event.locals` is the SvelteKit-idiomatic, per-request data channel. Using it avoids the serverless request-bleed problem and avoids coupling page loaders to layout load order.

---

## D-10 Resolution: hooks.server.ts + locals wins

**Decision:** Use `hooks.server.ts` to set `locals.club` once. Page server loaders read `event.locals.club.clubId` directly.

**Rationale:**

1. **Idiomatic SvelteKit:** Official docs describe `handle()` + `event.locals` as the standard pattern for request-scoped data that must be available across multiple load functions. [CITED: svelte.dev/docs/kit/hooks]

2. **Single parse:** Host header is read and subdomain resolved exactly once per request, not three times.

3. **No coupling:** Page loaders do not need `await parent()`. They are independent of each other and of layout execution order.

4. **Future-proof:** If a `+server.ts` API route is added, it also receives `event.locals.club` without any additional wiring.

5. **vs. re-reading per loader:** Three separate `hostname.split('.')[0]` + clubs lookup calls. If club resolution logic changes (e.g., adding a second-level domain check), it requires updating three files.

6. **vs. `await parent()` in page loaders:** SvelteKit docs warn that calling `parent()` introduces a waterfall if the parent load is async. Locals are synchronous and pre-populated before any load runs.

---

## Common Pitfalls

### Pitfall 1: `+error.svelte` reads `data.club` when subdomain is unknown

**What goes wrong:** The 404 is thrown inside `+layout.server.ts` (or `hooks.server.ts`). When this happens, `locals.club` is never set (or the layout load never completes). The `+error.svelte` page cannot access `data.club` — it will be `undefined`. Any template line that reads `data.club.logoPath` throws a JS exception on the error page itself, producing a blank screen.

**Why it happens:** `+error.svelte` is rendered outside the normal data flow when a load function throws.

**How to avoid:** In `+error.svelte`, replace the `stordalenLogo` import with a static fallback (`/favicon.png`) that does not depend on `data.club`. Do NOT attempt `data.club?.logoPath` — `data` may not be the layout data shape at all.

**Warning signs:** Error page renders blank or logs "Cannot read properties of undefined" in console.

### Pitfall 2: `event.url.hostname` vs `request.headers.get('host')` in Vercel

**What goes wrong:** Some SvelteKit GitHub issues report `event.url.host` being `undefined` in certain Vercel configurations (especially with `--https` dev flag). Using `request.headers.get('host')` is more direct but includes the port (`localhost:5173`).

**How to avoid:** Use `event.url.hostname` (no port, no protocol) as primary. In dev, bypass via `VITE_DEV_CLUB` entirely — so localhost hostname parsing never runs in production.

**Warning signs:** `slug` is `undefined`, `clubs[slug]` returns `undefined`, 404 fires for known clubs.

### Pitfall 3: `VITE_DEV_CLUB` in `hooks.server.ts` uses `import.meta.env` not `$env`

**What goes wrong:** Using `$env/static/public` (`PUBLIC_VITE_DEV_CLUB`) doesn't match the `VITE_` prefix convention. Using `$env/dynamic/public` adds unnecessary runtime overhead.

**How to avoid:** Use `import.meta.env.VITE_DEV_CLUB` directly. SvelteKit's Vite integration makes `VITE_*` vars available via `import.meta.env` in all server files.

**Warning signs:** `import.meta.env.VITE_DEV_CLUB` is `undefined` even when set in `.env.local` — check that `.env.local` (not `.env`) is the file being edited and that the var is prefixed `VITE_`.

### Pitfall 4: `clubs.ts` imported from client-side code

**What goes wrong:** `clubs.ts` is in `src/lib/` (not `src/lib/server/`), so it CAN be imported in `+page.svelte` or `+page.ts` without SvelteKit throwing a server-only error. But it contains no secrets, so this is not a security issue — just dead code.

**How to avoid:** Only import `clubs.ts` in server-side files (`hooks.server.ts`, `+layout.server.ts`). No page component needs it.

### Pitfall 5: `DEFAULT_CLUB_ID` still referenced after removal

**What goes wrong:** `constants.ts` exports `DEFAULT_CLUB_ID = '10782'`. All three loaders import it. After removing `url.searchParams.get('c')`, if the import is not also removed, TypeScript/ESLint will flag unused imports, or a future developer will wonder why it exists.

**How to avoid:** Remove `DEFAULT_CLUB_ID` import from all three loaders. Decide whether to delete `constants.ts` entirely or keep it for other future constants.

---

## Runtime State Inventory

> Phase 06 is a server-side refactor, not a rename/rebrand. No runtime state items apply.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — no database or in-memory store references club ID as a stored key | none |
| Live service config | None — no external service config stores the `?c=` param or club ID | none |
| OS-registered state | None | none |
| Secrets/env vars | `.env.local` gains `VITE_DEV_CLUB=stordalen`; existing `AUTH_TOKEN` unchanged | add new var to `.env.local` |
| Build artifacts | `src/lib/assets/stordalen.jpg` → `static/clubs/stordalen.jpg` move; build will reference new path | git mv; update imports |

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node 22.x | SvelteKit server | ✓ | 22.x (Vercel config) | — |
| Vercel | Deployment (adapter-vercel) | ✓ | adapter-vercel 6.3.3 | — |
| `VITE_DEV_CLUB` env var | Dev club resolution | ✗ (not yet set) | — | Must be added to `.env.local` before dev testing |
| Wildcard DNS `*.skytterinfo.no` | Subdomain routing in production | ✓ (Phase 5 prereq — documented in README) | — | Not needed for dev (uses `VITE_DEV_CLUB`) |

**Missing dependencies with no fallback:**
- `VITE_DEV_CLUB` in `.env.local` — planner must include a Wave 0 task to create/update `.env.local`.

**Missing dependencies with fallback:**
- None.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None installed — no vitest/jest in project |
| Config file | none |
| Quick run command | `yarn check` (svelte-check type checking) |
| Full suite command | `yarn lint && yarn check` |

No automated test framework exists in this project. All validation is type-checking + manual verification.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CLUB-01 | `clubs.ts` exports typed map with stordalen entry | type-check | `yarn check` | ❌ Wave 0 |
| CLUB-02 | Layout renders dynamic logo/name from `data.club` | manual | dev server visual check | N/A |
| ROUTE-01 | Loaders use `locals.club.clubId`, not `?c=` | type-check + manual | `yarn check` | N/A |
| ROUTE-02 | Unknown subdomain returns 404 page (not blank) | manual | dev server with unknown subdomain | N/A |
| ROUTE-03 | `?c=` param absent from all three loaders | grep / type-check | `grep -r 'searchParams' src/routes` | N/A |

### Sampling Rate

- **Per task commit:** `yarn check`
- **Per wave merge:** `yarn lint && yarn check`
- **Phase gate:** Full lint + check green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/lib/clubs.ts` — create before any other file references it (all other files import from it)
- [ ] `src/app.d.ts` — update `App.Locals` interface before `hooks.server.ts` can type-check
- [ ] `.env.local` — add `VITE_DEV_CLUB=stordalen` before dev testing
- [ ] `static/clubs/` directory with `stordalen.jpg` (moved from `src/lib/assets/`)

---

## Security Domain

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | yes — subdomain slug must match known keys | `clubs[slug]` lookup returns `undefined` for unknown slugs; `error(404)` thrown immediately |
| V6 Cryptography | no | — |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Host header injection (attacker sets arbitrary `Host:` header) | Spoofing | `clubs[slug]` lookup gates all resolution — unknown slug always 404s. No secret is gated by club resolution. |
| `VITE_DEV_CLUB` env var exposure | Information Disclosure | `VITE_` prefix means the var is baked into the client bundle in production if not controlled. Ensure `.env.local` is gitignored and `VITE_DEV_CLUB` is only set locally, not in Vercel env. |

---

## Code Examples

### Host Parsing (subdomain extraction)

```typescript
// Source: standard URL API — event.url is a URL instance
// event.url.hostname = 'stordalen.skytterinfo.no'
const slug = event.url.hostname.split('.')[0]; // → 'stordalen'
```

[CITED: svelte.dev/docs/kit/web-standards — URL interface]

### Dev Branch in handle()

```typescript
// VITE_DEV_CLUB is a public env var accessed via import.meta.env
// Source: SvelteKit Vite env var docs
const devClub = import.meta.env.VITE_DEV_CLUB;
if (!devClub) throw new Error('VITE_DEV_CLUB must be set in .env.local');
```

[CITED: svelte.dev/docs/kit/env — VITE_ prefix public vars]

### error() helper — already in project

```typescript
// Source: https://svelte.dev/docs/kit/errors — already used in project
import { error } from '@sveltejs/kit';
error(404, 'Siden finnes ikke');
```

[CITED: svelte.dev/docs/kit/errors]

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `url.searchParams.get('c')` query param | Host-header subdomain resolution | Phase 06 | Club ID no longer exposed in URL; no user-facing URL changes needed |
| Static `stordalenLogo` import in layout | Dynamic `data.club.logoPath` from server | Phase 06 | Layout works for any configured club |

**Deprecated/outdated after this phase:**
- `DEFAULT_CLUB_ID` constant: no longer used in loaders. Retire the constant (or keep file empty for future use).
- `src/lib/assets/stordalen.jpg`: moved to `static/clubs/stordalen.jpg`. The assets directory may become empty.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | TypeScript `Record<string, ClubConfig>` is the appropriate type for the clubs map | Standard Stack / Code Examples | Low — standard TS pattern; planner may use `{ [slug: string]: ClubConfig }` instead, functionally identical |
| A2 | `+error.svelte` logo fallback should use `/favicon.png` (static file) | Architecture Patterns — Pattern 6 | Low — UI-SPEC says "use /favicon.png or omit logo"; planner should verify favicon.png exists in static/ |
| A3 | `import.meta.env.VITE_DEV_CLUB` is accessible in `hooks.server.ts` | Architecture Patterns — Pattern 1 | Low — standard Vite/SvelteKit behavior; if not, fallback is `$env/static/public` with `PUBLIC_DEV_CLUB` naming |

---

## Open Questions

1. **Should `constants.ts` be deleted or emptied?**
   - What we know: `DEFAULT_CLUB_ID` is the only export. Phase 06 removes all usages.
   - What's unclear: Whether keeping an empty `constants.ts` is cleaner than deleting the file and its import references.
   - Recommendation: Delete the file and its imports in all three loaders. Simpler than leaving a dead export.

2. **`+error.svelte` logo: `/favicon.png` or no logo?**
   - What we know: UI-SPEC says "use a static `/favicon.png` or omit the logo". `favicon.ico` exists in `static/`; a separate `.png` may not exist.
   - What's unclear: Whether `static/favicon.png` (PNG format) exists. `static/` contains `favicon.ico`.
   - Recommendation: Planner checks `ls static/favicon*` in Wave 0. If only `.ico`, remove the logo `<img>` from `+error.svelte` entirely rather than pointing to a missing file.

---

## Sources

### Primary (HIGH confidence)
- [svelte.dev/docs/kit/hooks](https://svelte.dev/docs/kit/hooks) — `handle()`, `event.locals`, TypeScript typing in `app.d.ts`
- [svelte.dev/docs/kit/load](https://svelte.dev/docs/kit/load) — layout server load, `parent()`, locals in page server load
- [svelte.dev/docs/kit/routing](https://svelte.dev/docs/kit/routing) — `+layout.server.ts` data flow to children

### Secondary (MEDIUM confidence)
- [github.com/sveltejs/kit/issues/8335](https://github.com/sveltejs/kit/issues/8335) — subdomain routing is not a built-in; confirmed custom hook-based approach is required
- [github.com/sveltejs/kit/discussions/11900](https://github.com/sveltejs/kit/discussions/11900) — `event.url.hostname` vs. proxy host header notes

### Tertiary (LOW confidence / not needed)
- None — all critical claims verified via official docs or codebase inspection.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; all existing SvelteKit primitives verified in official docs
- Architecture: HIGH — `hooks.server.ts` + `locals` pattern confirmed in SvelteKit docs with code examples
- D-10 resolution: HIGH — locals pattern is documented as canonical; `await parent()` alternative is documented as introducing waterfall
- Pitfalls: MEDIUM — Vercel hostname reliability based on GitHub issues (not official docs); dev branch bypasses this entirely

**Research date:** 2026-05-21
**Valid until:** 2026-08-21 (stable SvelteKit 2.x; no breaking changes expected for these primitives)
