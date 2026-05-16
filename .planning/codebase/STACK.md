# Technology Stack

**Analysis Date:** 2026-05-17

## Overview

SvelteKit PWA displaying shooting schedule and shooter results for Stordalen Skytterlag. Data fetched client-side via GraphQL. Deployed to Vercel.

## Languages

**Primary:**
- TypeScript 5.x — all source files in `src/`
- Svelte 5.x — component files (`.svelte`) in `src/lib/components/` and `src/routes/`

**Secondary:**
- JavaScript — config files (`svelte.config.js`, `eslint.config.js`)
- CSS — `src/app.css` (Tailwind utility classes)
- HTML — `src/app.html` (shell template)

## Frameworks & Libraries

**Core:**
- SvelteKit 2.x — full-stack framework, routing, SSR/CSR; config: `svelte.config.js`
- Svelte 5.x — component model; uses runes API (`$props`, `$derived`)
- TailwindCSS 4.x — utility CSS; integrated via `@tailwindcss/vite` plugin; `@tailwindcss/typography` for prose

**Data Fetching:**
- `graphql-request` 7.x — lightweight GraphQL client; used in `src/lib/graphql/client.ts`
- `graphql` 16.x — peer dependency for schema/query parsing
- `@sveltestack/svelte-query` 1.x — React Query port for Svelte; QueryClient set up in `src/routes/+layout.svelte`

**Analytics:**
- `@vercel/analytics` 1.x — installed as dependency; no usage found in source (likely unused or pending integration)

## Build & Dev Tools

**Bundler:**
- Vite 7.x — dev server and production bundler; config: `vite.config.ts`

**TypeScript:**
- `svelte-check` 4.x — type-checking for Svelte files
- `typescript` 5.x — compiler

**Linting & Formatting:**
- ESLint 9.x — flat config at `eslint.config.js`; plugins: `eslint-plugin-svelte`, `typescript-eslint`
- Prettier 3.x — formatter; plugins: `prettier-plugin-svelte`, `prettier-plugin-tailwindcss`

**Adapter:**
- `@sveltejs/adapter-vercel` 5.x — builds for Vercel serverless/edge; configured in `svelte.config.js`

## Runtime Environment

**Node.js:** 22.x (detected: v22.14.0; no `.nvmrc` pinning)

**Package Manager:** yarn (lockfile: `yarn.lock`)

**Module System:** ESM (`"type": "module"` in `package.json`)

**Browser targets:** Modern browsers; PWA with service worker (`static/sw.js`), Web App Manifest (`static/manifest.json`)

## Key Dependencies

**Critical:**
- `graphql-request` — sole data access mechanism; all queries in `src/lib/graphql/queries.ts`
- `@sveltejs/kit` — routing, load functions, SSR control
- `@sveltejs/adapter-vercel` — deployment target; changing adapter = deployment change

**Infrastructure:**
- `tailwindcss` 4.x — entire UI relies on utility classes; no separate CSS modules
- `@sveltestack/svelte-query` — cache/refetch logic for shooter data

## Scripts

```bash
yarn dev        # Vite dev server
yarn build      # Production build
yarn preview    # Preview production build
yarn check      # svelte-check type validation
yarn lint       # prettier --check + eslint
yarn format     # prettier --write
```

---

*Stack analysis: 2026-05-17*
