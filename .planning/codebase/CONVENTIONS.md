# Coding Conventions

**Analysis Date:** 2026-05-17

## Overview

SvelteKit + TypeScript project. Svelte 5 runes in newer components, Svelte 4 reactive syntax in older routes. Strict TypeScript throughout. Tailwind CSS for all styling — no CSS modules or scoped styles except one `<style>` block in `src/routes/skyttere/+page.svelte` for `<details>` marker hacks.

## Naming Conventions

**Files:**
- Svelte components: PascalCase — `EventStatusBadge.svelte`, `RefreshButton.svelte`, `ShooterExternalLink.svelte`
- TypeScript modules: camelCase — `formatters.ts`, `helpers.ts`, `queries.ts`, `client.ts`
- SvelteKit routes: lowercase with `+` prefix — `+page.svelte`, `+page.ts`, `+layout.svelte`
- Route directories: lowercase Norwegian words — `skyttere/`, `premieliste/`

**Functions:**
- camelCase: `getEventStatus`, `hasPartialResults`, `formatNorwegianDate`, `parseAsLocalTime`
- Named descriptively with verb prefix: `get*`, `has*`, `format*`, `parse*`, `categorize*`
- Event handlers prefixed `handle*`: `handleRefresh`

**Variables:**
- camelCase throughout
- Boolean variables use `is*` prefix in reactive context: `isToday`, `isSchedulePage`, `isShootersPage`
- Constants in SCREAMING_SNAKE_CASE: `THREE_HOURS_IN_MS`, `EIGHT_HOURS_IN_MS`

**Types:**
- PascalCase type aliases: `Shot`, `Series`, `Event`, `Shooter`, `ShooterWithDistinctions`
- Response/variable types suffixed `Response`/`Variables`: `GetShooterByClubResponse`, `GetShooterVariables`
- All types in `src/lib/graphql/types.ts` — exported as named exports, not default

**CSS Classes:**
- Tailwind utility classes only; no custom class names except inherited SvelteKit/component conventions

## Code Style

**Formatting (enforced by Prettier):**
- Tabs for indentation (not spaces)
- Single quotes for strings
- No trailing commas
- Print width: 100 characters
- Svelte files parsed with `prettier-plugin-svelte`
- Tailwind class sorting via `prettier-plugin-tailwindcss`

**TypeScript:**
- Strict mode enabled (`"strict": true` in `tsconfig.json`)
- `allowJs: true`, `checkJs: true` — JS files type-checked
- Module resolution: `bundler`
- No `any` (implied by strict + typescript-eslint recommended rules)
- `no-undef` ESLint rule disabled — TypeScript handles undefined globals

**Svelte:**
- Newer components use Svelte 5 runes: `$props()`, `$derived()`, `$state()` — see `EventStatusBadge.svelte`, `+layout.svelte`, `premieliste/+page.svelte`
- Older route pages still use Svelte 4 syntax: `export let data`, `$:` reactive statements — see `+page.svelte`, `skyttere/+page.svelte`
- When modifying existing Svelte 4 files, match their existing syntax; new components should use Svelte 5 runes

**Imports:**
- Path alias `$lib` for `src/lib/`
- SvelteKit aliases: `$app/navigation`, `$app/environment`, `$app/state`
- No barrel re-exports except `src/lib/index.ts` which exports from graphql queries
- Imports grouped: external packages first, then `$lib/*`, then local relative — no enforced sorting rule

## Linting & Formatting

**ESLint config:** `eslint.config.js` (flat config format)
- `@eslint/js` recommended
- `typescript-eslint` recommended
- `eslint-plugin-svelte` recommended + prettier integration
- `eslint-config-prettier` to disable formatting rules
- `no-undef` disabled (TypeScript handles this)
- Gitignored files automatically excluded via `includeIgnoreFile`

**Prettier config:** `.prettierrc`
- `prettier-plugin-svelte` for `.svelte` parsing
- `prettier-plugin-tailwindcss` for class sorting
- `tailwindStylesheet` points to `./src/app.css`

**Type checking:** `svelte-check` with `tsconfig.json` — run via `yarn check`

**Run commands:**
```bash
yarn lint      # prettier --check . && eslint .
yarn format    # prettier --write .
yarn check     # svelte-kit sync && svelte-check --tsconfig ./tsconfig.json
```

## Patterns to Follow

**JSDoc on all exported utility functions** — every function in `formatters.ts` and `helpers.ts` has `@param` and `@returns` doc comments. Include `@deprecated` tag with migration guidance when deprecating.

**Named constants for magic numbers:**
```typescript
const THREE_HOURS_IN_MS = 3 * 60 * 60 * 1000;
```
Not inline numeric literals for time thresholds.

**Type-safe GraphQL** — always define request/response types in `src/lib/graphql/types.ts` and pass them as generics to `graphqlClient.request<T>()`.

**Error handling in load functions** — wrap async data fetching in try/catch, return `{ error: message }` shape on failure, never throw from `load`:
```typescript
// src/routes/+page.ts
try {
  const shooters = await getShootersByClub(clubId);
  return { shooters, clubId };
} catch (error) {
  return { shooters: null, error: error instanceof Error ? error.message : 'Unknown error occurred', clubId };
}
```

**Parallel async operations** — use `Promise.all` with `.map` for independent requests:
```typescript
const results = await Promise.all(promises);
```

**Svelte component props interface** — in Svelte 5 components, define a typed `interface Props` before destructuring with `$props()`:
```typescript
interface Props {
  event: Event & { shooter: Shooter };
  class?: string;
}
let { event, class: className = '' }: Props = $props();
```

**Scoped CSS only as last resort** — use `<style>` blocks only when Tailwind cannot achieve the desired result (e.g., browser-specific pseudo-elements like `::-webkit-details-marker`).

## Patterns to Avoid

**Do not use `formatNorwegianDateLocal` or `formatNorwegianTimeLocale`** — both are `@deprecated` in `src/lib/utils/formatters.ts`. Use `formatNorwegianDate` and `formatNorwegianTime` which call `parseAsLocalTime` to avoid UTC/timezone offset bugs.

**Do not mix Svelte 4 and Svelte 5 syntax in the same component** — a component using `export let` should not also use `$props()`.

**Do not add new scoped `<style>` blocks** unless absolutely necessary. All styling via Tailwind.

**Do not inline GraphQL query strings outside `src/lib/graphql/queries.ts`** — keep all queries centralized.

**Do not use `console.log` for debug output in production paths** — `console.error` and `console.warn` are used only in error/catch branches.

---

*Convention analysis: 2026-05-17*
