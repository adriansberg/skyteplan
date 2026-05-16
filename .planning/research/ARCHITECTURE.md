# Architecture: SvelteKit Server-Side Migration

**Project:** Stordalen Skytterlag PWA
**Researched:** 2026-05-17
**Confidence:** HIGH (SvelteKit official docs via Context7)

---

## Overview

The current codebase uses universal loaders (`+page.ts`) for all three routes. `graphql-request`
creates a `GraphQLClient` singleton in `src/lib/graphql/client.ts` using
`import.meta.env.VITE_AUTH_TOKEN`. Any `VITE_`-prefixed variable is inlined into the client JS
bundle by Vite at build time — visible in DevTools and the compiled output.

The fix: rename each `+page.ts` to `+page.server.ts`, swap the token source to
`$env/static/private`, and create a server-scoped GraphQL client (not a module singleton).

---

## Server vs Universal Loaders

### Universal loader (`+page.ts`)

- Runs on the server during SSR (initial load), then in the browser on every subsequent
  client-side navigation.
- Has access to `url`, `params`, `fetch`, `depends`.
- Cannot import `$env/static/private` — Vite enforces this at build time with a hard error.
- The GraphQL client and its `VITE_AUTH_TOKEN` are shipped to the browser.

### Server loader (`+page.server.ts`)

- Runs **only** on the server — always, on every load (initial and on `invalidateAll()`).
- Has additional context: `cookies`, `locals`, `platform`, `request`.
- Can import `$env/static/private`. The token never leaves the server.
- Returns plain serialisable data (no class instances, no functions). SvelteKit serialises the
  return value and sends it to the browser as JSON over the internal streaming protocol.
- Type changes: `PageLoad` → `PageServerLoad`, `import('./$types').PageServerLoad`.

### What changes on `invalidateAll()`

`invalidateAll()` re-runs all active load functions for the current page. For server loaders this
means a network round-trip to the SvelteKit server, which then calls the external GraphQL API and
returns fresh JSON. The browser never sees the token — the round-trip is:

```
Browser → SvelteKit server → leonls.kongsberg-ts.no → SvelteKit server → Browser
```

This is the same round-trip that happens for every navigation with a server loader. On Vercel the
SvelteKit server is a Vercel Serverless Function, so the hop is in-cloud.

---

## Migration Pattern

### Step 1 — Rename loaders

```
src/routes/+page.ts              → src/routes/+page.server.ts
src/routes/skyttere/+page.ts     → src/routes/skyttere/+page.server.ts
src/routes/premieliste/+page.ts  → src/routes/premieliste/+page.server.ts
```

### Step 2 — Create a server-only GraphQL client factory

Move the client out of the module-singleton pattern into a factory function importable only from
server contexts. Place it in `src/lib/server/graphql/client.ts` — the `src/lib/server/` path is
enforced by SvelteKit: any file under `$lib/server/` cannot be imported by client-side code.

```typescript
// src/lib/server/graphql/client.ts
import { GraphQLClient } from 'graphql-request';
import { AUTH_TOKEN } from '$env/static/private';

const endpoint = 'https://leonls.kongsberg-ts.no/api';

export function createGraphQLClient(): GraphQLClient {
  return new GraphQLClient(endpoint, {
    headers: {
      Authorization: `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
}
```

A factory (not a singleton) is preferred here because serverless functions can share module state
across requests in edge cases. A fresh client per request is safer and costs nothing for this
workload.

### Step 3 — Refactor query functions

Query functions in `src/lib/graphql/queries.ts` currently import the singleton `graphqlClient`.
After migration, they must accept a client argument (dependency injection), or be moved into
server-only modules.

Simplest approach — accept client as parameter:

```typescript
// src/lib/server/graphql/queries.ts
import type { GraphQLClient } from 'graphql-request';
import { gql } from 'graphql-request';
import type { GetShooterByClubResponse } from '$lib/graphql/types';

export async function getShootersByClub(client: GraphQLClient, clubId: string) {
  const { getShooterByClub: data } = await client.request<GetShooterByClubResponse>(
    gql`...`,
    { clubId }
  );
  return data;
}
```

Types (`src/lib/graphql/types.ts`) stay in `$lib` — they are plain TypeScript interfaces with no
runtime behaviour and are safe to import from anywhere.

### Step 4 — Update each loader

```typescript
// src/routes/+page.server.ts
import type { PageServerLoad } from './$types';
import { createGraphQLClient } from '$lib/server/graphql/client';
import { getShootersByClub } from '$lib/server/graphql/queries';

export const load: PageServerLoad = async ({ url }) => {
  const clubId = url.searchParams.get('c') || '10782';
  try {
    const client = createGraphQLClient();
    const shooters = await getShootersByClub(client, clubId);
    return { shooters, clubId };
  } catch (error) {
    console.error('Error loading shooters:', error);
    return {
      shooters: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      clubId,
    };
  }
};
```

### Step 5 — `.env` changes

```
# Before
VITE_AUTH_TOKEN=<token>

# After
AUTH_TOKEN=<token>
```

Remove the `VITE_` prefix. `$env/static/private` loads from `.env` and `process.env`. Vercel
environment variables set without the `VITE_` prefix are server-only by default — no change needed
in the Vercel dashboard beyond renaming the variable.

### Step 6 — Remove the client singleton

`src/lib/graphql/client.ts` (the `VITE_AUTH_TOKEN` singleton) becomes dead code. Delete it.
Update `src/lib/index.ts` barrel if it re-exports anything from the old client path.

---

## PWA Implications

### Service worker and data fetching

The current `sw.js` applies network-first caching to any request that hits an external hostname
(`url.hostname !== location.hostname`). This matches the direct browser → `leonls.kongsberg-ts.no`
GraphQL calls made by universal loaders.

After migration, the browser no longer calls `leonls.kongsberg-ts.no` directly. Instead it calls
the SvelteKit server (same hostname, e.g. `stordalen.vercel.app`). The service worker's fetch
handler path changes:

| Before | After |
|--------|-------|
| External hostname → network-first via SW | Same hostname → cache-first via SW |

**Concrete effect:** The page HTML responses for `/`, `/skyttere`, `/premieliste` now carry fresh
data on every server request. The SW's stale-while-revalidate logic for same-origin responses
could serve a cached (stale) page shell — but the data inside it is baked into the HTML at render
time, not fetched separately.

However, for subsequent client-side navigations (clicking tabs), SvelteKit does not do a full page
load — it calls a special internal fetch to `/__data.json` endpoints to retrieve serialised load
function output. These `__data.json` requests go to the same origin, so the SW's cache-first logic
would also intercept them.

**Mitigation:** Update `sw.js` to exclude `/__data.json` (SvelteKit's internal data endpoint) from
caching entirely, or apply network-first to it:

```javascript
// In sw.js fetch handler, add near top of respondWith logic:
if (url.pathname.endsWith('/__data.json') || url.pathname.endsWith('.json')) {
  // Always network for SvelteKit data responses
  event.respondWith(fetch(request));
  return;
}
```

### Offline behaviour

With universal loaders, the SW could cache GraphQL POST responses and serve them offline. GraphQL
uses POST requests which are not cacheable by the Cache API by default (the current SW caches them
anyway via `cache.put(request, responseClone)` — this works but is non-standard).

With server loaders, the data is embedded in the page HTML or `__data.json`. Offline behaviour
becomes: serve cached page HTML → stale data visible. This is acceptable for a read-only display
app. No functional regression.

### Pull-to-refresh / `invalidateAll()`

`invalidateAll()` in `RefreshButton.svelte` and `PullToRefresh.svelte` re-runs load functions.
With server loaders this triggers a fetch to the SvelteKit server. If the device is offline this
fetch fails — the catch in each loader surfaces an error message to the user. This is correct
behaviour and requires no code changes beyond ensuring the error return shape matches what
`+page.svelte` expects.

The SW's `REFRESH_CACHE` message handler (which clears `dynamic-*` caches) becomes irrelevant
after migration since there are no more dynamic GraphQL caches to clear. It can be removed for
clarity but causes no harm if left.

---

## Data Flow After Migration

```
Browser navigates to /
  └─ SvelteKit server executes +page.server.ts load()
       ├─ Reads AUTH_TOKEN from $env/static/private
       ├─ Creates GraphQLClient with Bearer header
       ├─ POST → https://leonls.kongsberg-ts.no/api
       ├─ Receives Shooter[] JSON
       └─ Returns { shooters, clubId } (serialised)
            └─ SvelteKit sends serialised data to browser
                 └─ +page.svelte receives data prop, renders

Browser clicks refresh (invalidateAll)
  └─ SvelteKit server re-executes +page.server.ts load()
       └─ Same path as above
            └─ Updated data prop → Svelte reactive update
```

No token appears at any point in browser-accessible code or network traffic.

---

## Build Order / Dependency Constraints

This migration has a clear execution order with no circular dependencies:

1. **Types stay in `$lib/graphql/types.ts`** — no changes, shared by both client and server.
2. **Create `$lib/server/graphql/client.ts`** — new file, no existing dependents.
3. **Create `$lib/server/graphql/queries.ts`** — depends on new client, imports types from `$lib`.
4. **Rename + update each `+page.server.ts`** — three files, identical pattern, can be done in any
   order. Each is self-contained.
5. **Delete `$lib/graphql/client.ts`** — after all loaders stop importing it.
6. **Update `$lib/index.ts`** — remove barrel export of `getShootersByClub` if it references the
   old client-side path. Server query functions should not be re-exported from `$lib/index.ts`
   (client barrel); they belong only in `$lib/server/`.
7. **Update `.env` / Vercel env vars** — rename `VITE_AUTH_TOKEN` → `AUTH_TOKEN`.
8. **Update `sw.js`** — exclude `/__data.json` from caching.

Steps 2–6 must complete before `VITE_AUTH_TOKEN` is removed. Step 7 is a deploy-time concern.

---

## Key Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Serialisation error: non-plain data returned from server loader | Low | Build error / runtime error | Query functions already return plain typed objects; no risk |
| `$lib/index.ts` barrel exports old client path | Medium | Build fails (can't import `$lib/server` from client barrel) | Audit `index.ts` before deleting old client |
| SW caches stale `__data.json` after mutation | Low | Stale data on client nav | Exclude `/__data.json` from SW cache |
| Vercel cold-start latency on invalidateAll | Low | Slightly slower refresh | Acceptable; Vercel Functions warm quickly |
| `premieliste` N+1 requests still slow on server | Known | Page load time unchanged | Not a regression; batching is a separate concern |

---

## Sources

- SvelteKit docs: Universal vs Server load functions — https://svelte.dev/docs/kit/load (HIGH)
- SvelteKit docs: `$env/static/private` — https://svelte.dev/docs/kit/%24env-static-private (HIGH)
- SvelteKit docs: `invalidateAll` — https://svelte.dev/docs/kit/%24app-navigation (HIGH)
- SvelteKit docs: `+page.server.js` routing — https://svelte.dev/docs/kit/routing (HIGH)
- Codebase analysis: `/Users/asb/Projects/stordalen/.planning/codebase/ARCHITECTURE.md` (HIGH)
