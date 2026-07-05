# Skytterinfo

PWA for Norwegian rifle shooting clubs — schedule, shooter results, and prize lists at the range.

Installable on iOS and Android. Designed for outdoor use: clean layout, fast load, no friction.

## Stack

- SvelteKit 2.x — full-stack framework, routing, SSR
- Svelte 5.x (runes) — component model (`$props`, `$derived`, `$state`)
- TypeScript 5.x
- TailwindCSS 4.x via `@tailwindcss/vite`
- Vite 7.x
- graphql-request 7.x
- Node 22.x / Yarn
- Vercel (`@sveltejs/adapter-vercel`)

## Routes

| Route          | Description                                                      |
| -------------- | ---------------------------------------------------------------- |
| `/`            | Schedule — events grouped by date, auto-scrolls to today         |
| `/skyttere`    | Shooters — per-shooter event list with collapsible result detail |
| `/premieliste` | Prize list — distinctions per shooter + prize summary            |
| `/facebook`    | Post drafting — generate morning/results text to copy or share   |

## Multi-Club Routing

Each club gets its own subdomain (e.g. `stordalen.skytterinfo.no`). The subdomain is resolved server-side in `src/hooks.server.ts` and injected into `event.locals.club`. Unknown subdomains return a Norwegian 404.

Club config lives in `src/lib/clubs.ts`:

```ts
export const clubs: Record<string, ClubConfig> = {
	stordalen: {
		clubId: '10782',
		name: 'Stordalen Skytterlag',
		logoPath: '/clubs/stordalen.jpg'
	}
};
```

Add a new club by adding an entry here and dropping its logo in `static/clubs/`.

## Data Source

Read-only GraphQL API at `leonls.kongsberg-ts.no`. The API shape is owned by an external operator — queries are in `src/lib/server/graphql/queries.ts`.

## Development

### Environment

Create `.env.local`:

```
AUTH_TOKEN=<bearer token for leonls.kongsberg-ts.no>
VITE_DEV_CLUB=stordalen
```

`VITE_DEV_CLUB` sets which club slug to resolve when running on localhost. Set it to any key defined in `src/lib/clubs.ts`.

### Commands

```sh
yarn install      # install dependencies
yarn dev          # start dev server
yarn build        # production build
yarn run check    # type-check (svelte-check)
yarn lint         # Prettier + ESLint
```

## Deployment (Vercel)

1. Set `AUTH_TOKEN` environment variable in the Vercel dashboard.
2. Register a domain and add a wildcard DNS record:
   ```
   *.<domain>  CNAME  cname.vercel-dns.com
   ```
3. Add `*.<domain>` as a wildcard domain in Vercel → project → Domains.
4. Each club subdomain must match a key in `src/lib/clubs.ts`.

## Project Structure

```
src/
  hooks.server.ts           # resolves club from subdomain per request
  lib/
    clubs.ts                # club config map (subdomain → clubId, name, logo)
    server/graphql/         # GraphQL client, queries, types (server-only)
    components/             # reusable UI components
    utils/                  # date/time formatting, event status logic
  routes/
    +layout.server.ts       # passes locals.club to layout
    +layout.svelte          # nav, PWA init, club logo in top bar
    +page.server.ts         # schedule loader
    skyttere/               # shooters page
    premieliste/            # prize list page
static/
  clubs/                    # club logo images
  sw.js                     # service worker (cache-first static, network-first API)
  manifest.json             # PWA manifest
```
