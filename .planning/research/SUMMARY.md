# Research Summary: Stordalen PWA Modernization

## Summary

This project modernizes a working SvelteKit 2 / Svelte 5 PWA used at shooting ranges. Three parallel tracks: (1) fix a security gap where the GraphQL auth token leaks into client bundles by migrating to server-side loaders, (2) upgrade four major dependencies (Vite 7→8, vite-plugin-svelte 6→7, adapter-vercel 5→6, TypeScript 5→6) in a specific order to avoid compounding failures, and (3) redesign the UI for outdoor, one-handed, mobile-first use with bottom tab navigation, high-contrast typography, and solid-fill status badges.

---

## Recommended Stack (Current → Target)

| Package | Current | Target | Breaking? |
|---------|---------|--------|-----------|
| `vite` | ^7.0.4 | ^8.0.13 | YES — Rolldown bundler; config key renames |
| `@sveltejs/vite-plugin-svelte` | ^6.0.0 | ^7.1.2 | YES — hard peer dep on Vite 8 |
| `@sveltejs/adapter-vercel` | ^5.6.3 | ^6.3.3 | LOW — removes Node polyfills (unused here) |
| `typescript` | ^5.0.0 | ^6.0.3 | MEDIUM — `types` defaults change, import assertion syntax |
| `@sveltejs/kit` | ^2.22.0 | ^2.59.1 | NO — same major, required before Vite 8 |
| `svelte` | ^5.0.0 | 5.55.7 | NO — additive only |
| `tailwindcss` | ^4.0.0 | 4.2.4 | NO — already on v4 |
| `@sveltestack/svelte-query` | ^1.6.0 | REMOVE | unmaintained Svelte 3-era pkg |

**Upgrade order is mandatory:** kit 2.59 → Vite 8 + vite-plugin-svelte 7 + adapter-vercel 6 → TypeScript 6. Do not batch Vite with TypeScript.

---

## Architecture Change

**Current:** Universal loaders (`+page.ts`) run in browser and server. `VITE_AUTH_TOKEN` is inlined into the client bundle — visible in DevTools.

**Target:** Rename each `+page.ts` to `+page.server.ts`. Create server-only GraphQL client factory at `src/lib/server/graphql/client.ts` importing `AUTH_TOKEN` from `$env/static/private`. Query functions move to `src/lib/server/graphql/queries.ts` (dependency injection, not singleton). Delete old `src/lib/graphql/client.ts`. Rename env var from `VITE_AUTH_TOKEN` to `AUTH_TOKEN`.

**Service worker impact:** Browser no longer calls GraphQL host directly. Update `sw.js` to exclude `/__data.json` from caching. Do not cache GraphQL POST responses — non-idempotent.

---

## UX Direction

Primary use: outdoor range, bright sunlight, one hand, under 3 seconds to find next event.

- **Navigation:** Fixed bottom tab bar (Skyteplan / Skyttere / Premieliste). 56px + `env(safe-area-inset-bottom)`. No hamburger.
- **Color/type:** White / `neutral-50` backgrounds. `neutral-900` text. Min `text-base font-semibold` for data. Monospace for times/scores. `emerald-600` accent. No gradients, no shadows.
- **Status badges:** Solid-fill pills. Green pulse = Pågår. Slate = Ferdig. Amber = Kommende. Gray = Møtte ikke.
- **Schedule:** Sticky date headers. "I dag" label replaces date string for today. Inline sub-events — no accordion.
- **Loading:** Skeleton screens on initial load. Spinner on manual refresh only.
- **iOS polish:** `viewport-fit=cover`, `apple-mobile-web-app-status-bar-style: black-translucent`, tab bar `padding-bottom: env(safe-area-inset-bottom)`.

---

## Top Pitfalls to Avoid

- **Do not upgrade Vite before kit 2.53+.** Hard peer dep failure. Pin `@sveltejs/vite-plugin-svelte` to `^7` explicitly.
- **Verify auth token absent from client bundle post-migration.** `yarn build && grep -r "TOKEN_VALUE" .svelte-kit/output/client/` must return zero. If old `src/lib/graphql/client.ts` is re-exported via `$lib/index.ts`, token stays in bundle.
- **Return only plain serializable data from server loaders.** `devalue` throws in prod on class instances, `undefined` in nested arrays, circular refs.
- **Do not set `runes: true` globally.** Applies to node_modules — breaks Svelte 4-era libraries. Per-file only via `<svelte:options runes={true} />`.
- **Vite `define` does not reach `static/sw.js`.** Use a Vite plugin that writes `sw.js` from a template at build time. Add old-cache eviction in the `activate` handler.
- **Upgrade one concern per commit.** Batching failures = untraceable breakage.
- **Tailwind class renames produce no errors.** `shadow` → `shadow-sm` etc. Visual QA on real mobile at high brightness after every Tailwind change.

---

## Recommended Phase Order

1. **Remove `@sveltestack/svelte-query`** — zero risk, < 1 hour
2. **Dependency upgrades** — sequential, gated by build: patch → kit 2.59 → Vite 8 + vite-plugin-svelte 7 + adapter-vercel 6 → TypeScript 6
3. **Server loader migration** — security. Three routes, one at a time. Verify token absent from build.
4. **UX redesign MVP** — bottom tab nav, outdoor palette, solid badges, sticky headers, touch targets, iOS meta
5. **UX polish** — skeleton loading, error states, SW cache automation
6. **Rune migration (optional)** — bottom-up per component, audit `bind:` usages first

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack versions | HIGH | npm + GitHub releases verified |
| Vite 8 / TS 6 breaking changes | HIGH | Official changelogs |
| Architecture migration | HIGH | SvelteKit official docs pattern |
| UX patterns | HIGH | Established PWA + sports app patterns |
| CJS interop impact | MEDIUM | Requires build test to confirm |
| Rune migration scope | MEDIUM | Depends on actual bind: and $: count |

---

*Research synthesized: 2026-05-17*
