# Skytterinfo

PWA for Norwegian rifle shooting clubs — schedule, shooter results, and prize lists at the range.

## Stack

- SvelteKit 2.x — full-stack framework, routing, SSR/CSR
- Svelte 5.x (runes) — component model (`$props`, `$derived`, `$state`)
- TypeScript 5.x — all source in `src/`
- TailwindCSS 4.x — utility CSS via `@tailwindcss/vite`
- Vite 7.x — dev server and bundler
- graphql-request 7.x — lightweight GraphQL client
- Node 22.x — runtime
- Yarn — package manager
- Vercel (`@sveltejs/adapter-vercel`) — deployment target

## Data Source

External read-only GraphQL API at `leonls.kongsberg-ts.no`. The API shape is owned by an
external operator — cannot add batching, change query structure, or modify schema without
owner cooperation. All queries are in `src/lib/graphql/queries.ts`.

## Development

```sh
yarn install      # install dependencies
yarn dev          # start dev server
yarn build        # production build
yarn check        # type-check (svelte-check + tsc)
yarn lint         # ESLint
yarn format       # Prettier
```

## Deployment Prerequisites

> These are MANUAL human steps outside code. Phase 5 documents the requirements;
> Phase 6 ships the routing code that depends on them being in place.

### Domain

Choose and register one of the following — **TBD (owner to confirm and register)**:

- `skytterinfo.no`
- `skytterinfo.app`

### Wildcard DNS

Configure a wildcard DNS record so every subdomain routes to the same Vercel deployment.
This must be in place before Phase 6 goes live.

DNS record to add at your registrar:

```
*.<domain>  CNAME  cname.vercel-dns.com
```

Replace `<domain>` with the registered domain (e.g. `skytterinfo.no`).

### Vercel Wildcard Domain

In the Vercel dashboard → project → Domains → Add, enter `*.<domain>` as a wildcard
domain on the project. Vercel requires this in addition to the DNS record.

### Phase 6 Dependency

Phase 6 introduces `src/lib/clubs.ts` mapping subdomain → club configuration. The subdomain
keys in `clubs.ts` must match the DNS pattern (e.g. a `stordalen` subdomain key requires
`stordalen.<domain>` DNS to resolve). Register the domain and configure wildcard DNS before
Phase 6 ships.

## Project Structure

### Routes

- `/` — schedule page; groups shooter events by date, auto-scrolls to today
- `/skyttere` — shooters page; per-shooter event list with collapsible result detail
- `/premieliste` — prize list page; distinctions per shooter + prize summary

Each route has a paired `+page.ts` loader that fetches from the GraphQL API and passes
data down via the `data` prop. No global store — all data flows downward from `load`.

### Key Directories

- `src/lib/graphql/` — GraphQL client singleton, query functions, domain types
- `src/lib/components/` — reusable UI components (status badge, refresh button, install prompt, etc.)
- `src/lib/utils/` — pure utility functions: Norwegian date/time formatting, event status logic
- `src/routes/` — SvelteKit page templates and loaders
- `static/` — service worker (`sw.js`), PWA manifest, icons
