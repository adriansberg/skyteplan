# External Integrations

**Analysis Date:** 2026-05-17

## Overview

Single external API integration: the Kongsberg TS LeonLS GraphQL API for shooter and event data. Deployment via Vercel. Optional analytics package installed but not wired up.

## External APIs

**LeonLS / Kongsberg TS GraphQL API:**
- Purpose: All shooter data — schedules, results, distinctions, club membership
- Endpoint: `https://leonls.kongsberg-ts.no/api`
- Protocol: GraphQL over HTTPS
- Client: `graphql-request` (`src/lib/graphql/client.ts`)
- Auth: Bearer token via `VITE_AUTH_TOKEN` env var
- Queries: `src/lib/graphql/queries.ts`
  - `GetShooterByClub` — all shooters + events for a club
  - `GetShooter` — individual shooter with distinctions
- Data scope: Fixed date range `2017-01-01` to `2030-12-31`; limit 100 per request; default club ID `10782`

## Third-party Services

**Vercel:**
- Role: Hosting and deployment platform
- Adapter: `@sveltejs/adapter-vercel` 5.x (`svelte.config.js`)
- Output: Serverless/edge functions (adapter default)

**Vercel Analytics:**
- Package: `@vercel/analytics` 1.x (installed in `package.json`)
- Status: Not wired into any source file — not active

## Environment Variables

| Variable | Required | Purpose | Used in |
|----------|----------|---------|---------|
| `VITE_AUTH_TOKEN` | Yes | Bearer token for LeonLS GraphQL API | `src/lib/graphql/client.ts` |

**Notes:**
- `VITE_` prefix means this variable is inlined at build time and exposed to the browser bundle
- `.env.example` present at project root with empty `VITE_AUTH_TOKEN=`
- No server-only secrets (no `SECRET_` or non-`VITE_` vars)

## Auth / Identity

**No user authentication.** App is read-only public display of shooting data.

API authentication is service-to-service only: static bearer token (`VITE_AUTH_TOKEN`) sent as `Authorization: Bearer <token>` header on every GraphQL request.

## Data Storage

**None.** No database, no file storage, no caching layer beyond in-memory `@sveltestack/svelte-query` QueryClient (browser session only).

## PWA / Offline

**Service Worker:** `static/sw.js` — registered by `src/lib/pwa.ts` on browser load
**Manifest:** `static/manifest.json` — standalone display mode, Norwegian locale, portrait orientation

No push notifications or background sync configured.

## Monitoring & Observability

**Error Tracking:** None configured
**Logs:** `console.error` / `console.warn` in `src/lib/graphql/queries.ts` for failed API calls; no structured logging

## Webhooks & Callbacks

**Incoming:** None
**Outgoing:** None

---

*Integration audit: 2026-05-17*
