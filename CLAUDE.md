<!-- GSD:project-start source:PROJECT.md -->

## Project

**Stordalen Skytterlag PWA**

A progressive web app for Stordalen Skytterlag members. Displays shooting schedule, shooter results, and prize lists — fetched from the leonls.kongsberg-ts.no GraphQL API. Used primarily on mobile at the range during competitions.

**Core Value:** Shooters can instantly see today's schedule and their results on their phone at the range — no friction, no loading confusion.

### Constraints

- **API**: leonls.kongsberg-ts.no is external — cannot change API shape or add batching without owner cooperation
- **Deployment**: Vercel via @sveltejs/adapter-vercel — must stay on Vercel
- **Runtime**: Node 22.x, Yarn package manager
- **Design**: Must remain clean and legible on phones in outdoor lighting conditions
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->

## Technology Stack

## Overview

## Languages

- TypeScript 5.x — all source files in `src/`
- Svelte 5.x — component files (`.svelte`) in `src/lib/components/` and `src/routes/`
- JavaScript — config files (`svelte.config.js`, `eslint.config.js`)
- CSS — `src/app.css` (Tailwind utility classes)
- HTML — `src/app.html` (shell template)

## Frameworks & Libraries

- SvelteKit 2.x — full-stack framework, routing, SSR/CSR; config: `svelte.config.js`
- Svelte 5.x — component model; uses runes API (`$props`, `$derived`)
- TailwindCSS 4.x — utility CSS; integrated via `@tailwindcss/vite` plugin; `@tailwindcss/typography` for prose
- `graphql-request` 7.x — lightweight GraphQL client; used in `src/lib/graphql/client.ts`
- `graphql` 16.x — peer dependency for schema/query parsing
- `@sveltestack/svelte-query` 1.x — React Query port for Svelte; QueryClient set up in `src/routes/+layout.svelte`
- `@vercel/analytics` 1.x — installed as dependency; no usage found in source (likely unused or pending integration)

## Build & Dev Tools

- Vite 7.x — dev server and production bundler; config: `vite.config.ts`
- `svelte-check` 4.x — type-checking for Svelte files
- `typescript` 5.x — compiler
- ESLint 9.x — flat config at `eslint.config.js`; plugins: `eslint-plugin-svelte`, `typescript-eslint`
- Prettier 3.x — formatter; plugins: `prettier-plugin-svelte`, `prettier-plugin-tailwindcss`
- `@sveltejs/adapter-vercel` 5.x — builds for Vercel serverless/edge; configured in `svelte.config.js`

## Runtime Environment

## Key Dependencies

- `graphql-request` — sole data access mechanism; all queries in `src/lib/graphql/queries.ts`
- `@sveltejs/kit` — routing, load functions, SSR control
- `@sveltejs/adapter-vercel` — deployment target; changing adapter = deployment change
- `tailwindcss` 4.x — entire UI relies on utility classes; no separate CSS modules
- `@sveltestack/svelte-query` — cache/refetch logic for shooter data

## Scripts

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

## Overview

## Naming Conventions

- Svelte components: PascalCase — `EventStatusBadge.svelte`, `RefreshButton.svelte`, `ShooterExternalLink.svelte`
- TypeScript modules: camelCase — `formatters.ts`, `helpers.ts`, `queries.ts`, `client.ts`
- SvelteKit routes: lowercase with `+` prefix — `+page.svelte`, `+page.ts`, `+layout.svelte`
- Route directories: lowercase Norwegian words — `skyttere/`, `premieliste/`
- camelCase: `getEventStatus`, `hasPartialResults`, `formatNorwegianDate`, `parseAsLocalTime`
- Named descriptively with verb prefix: `get*`, `has*`, `format*`, `parse*`, `categorize*`
- Event handlers prefixed `handle*`: `handleRefresh`
- camelCase throughout
- Boolean variables use `is*` prefix in reactive context: `isToday`, `isSchedulePage`, `isShootersPage`
- Constants in SCREAMING_SNAKE_CASE: `THREE_HOURS_IN_MS`, `EIGHT_HOURS_IN_MS`
- PascalCase type aliases: `Shot`, `Series`, `Event`, `Shooter`, `ShooterWithDistinctions`
- Response/variable types suffixed `Response`/`Variables`: `GetShooterByClubResponse`, `GetShooterVariables`
- All types in `src/lib/graphql/types.ts` — exported as named exports, not default
- Tailwind utility classes only; no custom class names except inherited SvelteKit/component conventions

## Code Style

- Tabs for indentation (not spaces)
- Single quotes for strings
- No trailing commas
- Print width: 100 characters
- Svelte files parsed with `prettier-plugin-svelte`
- Tailwind class sorting via `prettier-plugin-tailwindcss`
- Strict mode enabled (`"strict": true` in `tsconfig.json`)
- `allowJs: true`, `checkJs: true` — JS files type-checked
- Module resolution: `bundler`
- No `any` (implied by strict + typescript-eslint recommended rules)
- `no-undef` ESLint rule disabled — TypeScript handles undefined globals
- Newer components use Svelte 5 runes: `$props()`, `$derived()`, `$state()` — see `EventStatusBadge.svelte`, `+layout.svelte`, `premieliste/+page.svelte`
- Older route pages still use Svelte 4 syntax: `export let data`, `$:` reactive statements — see `+page.svelte`, `skyttere/+page.svelte`
- When modifying existing Svelte 4 files, match their existing syntax; new components should use Svelte 5 runes
- Path alias `$lib` for `src/lib/`
- SvelteKit aliases: `$app/navigation`, `$app/environment`, `$app/state`
- No barrel re-exports except `src/lib/index.ts` which exports from graphql queries
- Imports grouped: external packages first, then `$lib/*`, then local relative — no enforced sorting rule

## Linting & Formatting

- `@eslint/js` recommended
- `typescript-eslint` recommended
- `eslint-plugin-svelte` recommended + prettier integration
- `eslint-config-prettier` to disable formatting rules
- `no-undef` disabled (TypeScript handles this)
- Gitignored files automatically excluded via `includeIgnoreFile`
- `prettier-plugin-svelte` for `.svelte` parsing
- `prettier-plugin-tailwindcss` for class sorting
- `tailwindStylesheet` points to `./src/app.css`

## Patterns to Follow

## Patterns to Avoid

<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

## System Overview

```text

```

## Component Responsibilities

| Component           | Responsibility                                                | File                                            |
| ------------------- | ------------------------------------------------------------- | ----------------------------------------------- |
| Root layout         | Nav, QueryClientProvider, PWA init                            | `src/routes/+layout.svelte`                     |
| Schedule page       | Flatten + group shooter events by date, auto-scroll today     | `src/routes/+page.svelte`                       |
| Schedule loader     | Fetch shooters by club ID from URL param `?c=`                | `src/routes/+page.ts`                           |
| Shooters page       | Per-shooter event list with collapsible detail                | `src/routes/skyttere/+page.svelte`              |
| Shooters loader     | Same fetch as schedule page                                   | `src/routes/skyttere/+page.ts`                  |
| Premieliste page    | Display distinctions per shooter + prize summary              | `src/routes/premieliste/+page.svelte`           |
| Premieliste loader  | Fan-out: fetch all shooters then distinctions in parallel     | `src/routes/premieliste/+page.ts`               |
| GraphQL client      | Singleton client with Bearer auth                             | `src/lib/graphql/client.ts`                     |
| GraphQL queries     | Three exported async functions                                | `src/lib/graphql/queries.ts`                    |
| Types               | Domain types: Shot, Series, Event, Shooter, Distinction       | `src/lib/graphql/types.ts`                      |
| Formatters          | Norwegian date/time formatting, parseAsLocalTime              | `src/lib/utils/formatters.ts`                   |
| Helpers             | Event status logic (completed/ongoing/did_not_start/upcoming) | `src/lib/utils/helpers.ts`                      |
| EventStatusBadge    | Renders status pill from event data                           | `src/lib/components/EventStatusBadge.svelte`    |
| ShooterExternalLink | External link to lsres.no search                              | `src/lib/components/ShooterExternalLink.svelte` |
| RefreshButton       | Calls `invalidateAll()` to re-run load functions              | `src/lib/components/RefreshButton.svelte`       |
| PullToRefresh       | Touch gesture → `invalidateAll()` + SW skip-waiting           | `src/lib/components/PullToRefresh.svelte`       |
| InstallPrompt       | Deferred PWA install banner                                   | `src/lib/components/InstallPrompt.svelte`       |
| Splash              | Session-scoped splash screen (sessionStorage gate)            | `src/lib/components/Splash.svelte`              |
| Service worker      | Cache-first for static, network-first for API                 | `static/sw.js`                                  |
| PWA init            | Registers SW, handles install lifecycle                       | `src/lib/pwa.ts`                                |

## Pattern Overview

- Each route has a paired `+page.ts` loader that calls GraphQL and returns data to `+page.svelte` via `data` prop
- All three routes share the same club ID resolution: `url.searchParams.get('c') || '10782'`
- `@sveltestack/svelte-query` is mounted in the layout (`QueryClientProvider`) but individual pages use direct `load` functions rather than reactive queries
- Svelte 5 runes (`$state`, `$derived`, `$props`) used in newer components; Svelte 4 reactive syntax (`$:`, `export let`) still present in older pages
- Data refresh: `invalidateAll()` re-runs all active load functions — triggered by RefreshButton and PullToRefresh

## Layers

- Purpose: Page templates, reactive derived state, template logic
- Location: `src/routes/`
- Contains: `+page.svelte`, `+page.ts`, `+layout.svelte`
- Depends on: `$lib` utilities, components, graphql types
- Used by: Browser
- Purpose: Reusable UI pieces with no data fetching
- Location: `src/lib/components/`
- Contains: `.svelte` files accepting props
- Depends on: `$lib/utils/helpers`, `$lib/graphql/types`
- Used by: Route pages
- Purpose: All GraphQL queries encapsulated here
- Location: `src/lib/graphql/`
- Contains: `client.ts` (singleton), `queries.ts` (functions), `types.ts` (domain types)
- Depends on: `graphql-request`, `VITE_AUTH_TOKEN` env var
- Used by: `src/routes/*/+page.ts`, `src/lib/index.ts`
- Purpose: Pure functions for formatting and business logic
- Location: `src/lib/utils/`
- Contains: `formatters.ts` (date/time), `helpers.ts` (event status)
- Depends on: nothing internal
- Used by: pages, components
- Purpose: Offline capability and installability
- Location: `static/sw.js`, `src/lib/pwa.ts`
- Contains: service worker (cache strategy), install prompt lifecycle
- Depends on: browser APIs
- Used by: layout (dynamically imports `pwa.ts` on browser)

## Data Flow

### Primary Request Path (Schedule / Shooters)

### Premieliste Fan-out Path

### Refresh Path

- No global store. All data flows downward from `load` → `data` prop → component
- `@sveltestack/svelte-query` QueryClient is initialized in layout but not actively used by current pages
- Local component state uses Svelte 5 `$state` runes or Svelte 4 reactive declarations

## Key Abstractions

- Purpose: Core domain entity — a person registered in the club
- Examples: `src/lib/graphql/types.ts:27`
- Pattern: Plain TypeScript type; no class or ORM
- Purpose: A shooting session a shooter participates in (Bane, Felt, Finale, etc.)
- Examples: `src/lib/graphql/types.ts:15`
- Pattern: Nested under `Shooter.events[]`; contains `Series[]`
- Purpose: Computed state (completed / ongoing / did_not_start / upcoming) from timing + result data
- Implementation: `getEventStatus()` in `src/lib/utils/helpers.ts:48`
- Logic: Compares `checkinDateTime` to `now`, checks for partial/complete results; 3-hour and 8-hour thresholds for DNS detection
- Purpose: "Felt" shooting events have sub-disciplines (Minne, Felthurtig, Stang) that share the same time/target/relay — grouped as parent + subEvents on the schedule page
- Implementation: `src/routes/+page.svelte:61-107`
- Pattern: In-memory grouping in `$:` reactive block, keyed by `name+shootingDateTime+targetNumber+relayNumber`

## Entry Points

- Location: `src/app.html`
- Triggers: Browser load
- Responsibilities: PWA manifest link, iOS meta tags, SvelteKit body injection
- Location: `src/routes/+layout.svelte`
- Triggers: All routes
- Responsibilities: Sticky nav, `QueryClientProvider` wrapping, PWA dynamic import, PullToRefresh and InstallPrompt mounting
- Location: `src/lib/index.ts`
- Exports: `getShootersByClub` — the only function exposed via `$lib` import

## Architectural Constraints

- **Rendering:** Universal loaders (`+page.ts`) run on both server (SSR) and client. No `+page.server.ts` used — meaning the GraphQL Bearer token (`VITE_AUTH_TOKEN`) is embedded in the client bundle.
- **Global state:** `graphqlClient` is a module-level singleton (`src/lib/graphql/client.ts:6`). `QueryClient` instantiated once in layout but unused by pages.
- **Parallel data fetching:** Premieliste makes N+1 GraphQL requests (one for club list, then one per shooter). No batching.
- **Timezone:** All datetime strings from API treated as local time by stripping timezone suffix via `parseAsLocalTime()` (`src/lib/utils/formatters.ts:11`).
- **Club ID:** Hardcoded default `'10782'` in every loader. Overridable via `?c=` query param but no UI for this.

## Anti-Patterns

### Mixed Svelte 4 and Svelte 5 syntax

### Auth token exposed to client

### Unused QueryClient

## Error Handling

- Errors surface as Norwegian-language messages in red bordered boxes
- `getShootersWithDistinctions` catches per-shooter failures silently with `console.warn` and skips failed shooters rather than failing the whole request
- No global error boundary or SvelteKit `+error.svelte` page

## Cross-Cutting Concerns

<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.

<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.

<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.

<!-- GSD:profile-end -->
