# Stack Research: Dependency Upgrade

**Project:** Stordalen Skytterlag PWA
**Researched:** 2026-05-17
**Scope:** Current vs latest versions, breaking changes, upgrade sequence

---

## Overview

All core dependencies have had major version bumps since the current pinned versions.
Notable: Vite has gone 7 → 8 (Rolldown bundler, architectural shift), vite-plugin-svelte
6 → 7 (required for Vite 8), adapter-vercel 5 → 6, TypeScript 5 → 6. SvelteKit itself
stays at 2.x (no v3 stable yet). Svelte stays at 5.x.

---

## Current vs Latest Versions

| Package | Current (package.json) | Latest (May 2026) | Major bump? |
|---------|------------------------|-------------------|-------------|
| `svelte` | ^5.0.0 | 5.55.7 | No — minor updates only |
| `@sveltejs/kit` | ^2.22.0 | 2.59.1 | No — stay on 2.x |
| `vite` | ^7.0.4 | **8.0.13** | **YES — v8 out Mar 2026** |
| `@sveltejs/vite-plugin-svelte` | ^6.0.0 | **7.1.2** | **YES — required for Vite 8** |
| `@sveltejs/adapter-vercel` | ^5.6.3 | **6.3.3** | **YES — v6 out** |
| `tailwindcss` | ^4.0.0 | 4.2.4 | No — minor updates only |
| `@tailwindcss/vite` | ^4.0.0 | 4.2.4 | No |
| `@tailwindcss/typography` | ^0.5.15 | 0.5.19 | No — patch only |
| `prettier-plugin-tailwindcss` | ^0.6.11 | 0.8.0 | No — minor |
| `typescript` | ^5.0.0 | **6.0.3** | **YES — v6 out Mar 2026** |
| `svelte-check` | ^4.0.0 | 4.4.8 | No — minor updates |
| `eslint` | ^9.18.0 | 9.x (latest) | No — stay on 9.x |
| `typescript-eslint` | ^8.20.0 | 8.x (latest) | No — v8 is current |
| `eslint-plugin-svelte` | ^3.0.0 | 3.17.1 | No — minor updates |
| `graphql-request` | ^7.2.0 | 7.4.0 | No — v7 is current |
| `graphql` | ^16.11.0 | 16.x | No |
| `@vercel/analytics` | ^1.5.0 | 1.x | No |
| `@sveltestack/svelte-query` | ^1.6.0 | REMOVE | — unmaintained Svelte 3-era pkg |

**Confidence:** HIGH for all versions (npm/GitHub releases verified).

---

## Breaking Changes

### Vite 7 → 8 (HIGH impact)

- **Rolldown replaces Rollup/esbuild** as the internal bundler. Rust-based, 10-30x faster
  builds. Vite ships a compatibility layer that auto-converts most `rollupOptions` config,
  so most projects migrate without changes.
- **CJS interop** — Vite 8 unifies how `default` imports from CJS modules resolve between
  dev and production. Previously could silently differ; now consistent. Packages that only
  ship CJS without a valid `default` export will break at runtime (`Cannot read properties
  of undefined`). Fix: find the ESM build of the offending package, or replace it.
- **`output.manualChunks` object form removed** — must migrate to Rolldown's `codeSplitting`
  option if used. This project does not appear to use manual chunks, so likely no impact.
- **Node requirement unchanged** — still Node 20.19+ or 22.12+ (same as Vite 7).
- **SvelteKit compatibility** — Vite 8 support landed in `@sveltejs/kit` 2.53.x. Current
  pinned version is 2.22.0, so kit upgrade is required before or with Vite 8.
- **`@sveltejs/vite-plugin-svelte` must jump 6 → 7** — v6 only supports Vite 6/7. v7 is
  required for Vite 8. This is a hard peer dependency requirement.
- **`@tailwindcss/vite` works without changes** in Vite 8.

### @sveltejs/vite-plugin-svelte 6 → 7 (MEDIUM impact)

- Requires `svelte` 5.46.4+. Current install is ^5.0.0 which resolves to 5.55.7, so no
  issue.
- Removes `cssHash` override (Svelte 5 now generates stable CSS hashes natively). Only
  relevant if you customized this option — this project does not.
- `vite-plugin-svelte-inspector` merged into the main package (removes circular dep).
  No user-facing config changes needed.

### @sveltejs/adapter-vercel 5 → 6 (LOW impact for this project)

- **Breaking change:** Removes Node.js built-in polyfills. Projects that relied on
  Node polyfills (e.g., using `crypto`, `http`, `net` from Node in edge functions) will
  break.
- This project uses Node 22.x and the standard serverless runtime, not edge. No polyfills
  are depended upon. Impact: none expected.
- Latest: 6.3.3. No other notable breaking changes in changelog.

### TypeScript 5 → 6 (MEDIUM impact — check tsconfig)

- **`strict: true` by default** — already explicitly set in `tsconfig.json`, no change.
- **`moduleResolution: bundler` already set** — matches the new recommended default for
  Vite/SvelteKit projects. No change needed.
- **`types` defaults to `[]`** — no longer auto-includes `@types/*`. May cause errors like
  `Cannot find name 'process'`. SvelteKit's generated `.svelte-kit/tsconfig.json` (which
  the project extends) typically handles this, but verify after upgrade.
- **`module` defaults to `esnext`** — project is already ESM (`"type": "module"`), no issue.
- **Import assertions deprecated** — `assert { type: 'json' }` syntax now errors; use
  `with { type: 'json' }`. Unlikely used in this codebase, but grep for `assert {` to confirm.
- **`moduleResolution: node` (node10) deprecated** — already using `bundler`, no issue.
- **`outFile`, `amd/umd/systemjs` removed** — not used.
- **`esModuleInterop` always true** — project already has it explicit in tsconfig.
- **TypeScript 7 (Go rewrite)** — in progress, not stable. Skip for now.

### SvelteKit 2.22 → 2.59 (LOW impact — same major)

- Staying on 2.x. No breaking changes between minor versions within 2.x series.
- `$app/stores` deprecated in favor of `$app/state` (runes-based). Not a hard break but
  migration is recommended since SvelteKit 3 will remove `$app/stores`.
- SvelteKit 3 milestone exists on GitHub but no stable release as of May 2026.

### Svelte 5.0 → 5.55 (LOW impact — same major)

- Runes API stable. Only additive changes since 5.0.
- Experimental async SSR added (5.39.3). Not needed for this project.
- No breaking changes within 5.x.

### Tailwind 4.0 → 4.2 (NONE — already on v4)

- Already migrated to v4 (CSS-first config, `@tailwindcss/vite` plugin). No action needed.
- Typography plugin: 0.5.15 → 0.5.19 (patch, bugfix only).

### graphql-request 7.2 → 7.4 (NONE)

- Still on v7. Minor releases only. Safe patch upgrade.

---

## Upgrade Sequence

Order matters: Vite 8 requires vite-plugin-svelte 7, which requires kit 2.53+.
Do NOT upgrade Vite before upgrading kit and vite-plugin-svelte.

**Step 1 — Remove dead dependency (zero risk)**
```bash
yarn remove @sveltestack/svelte-query
```
Also remove QueryClient setup from `src/routes/+layout.svelte`.

**Step 2 — Patch upgrades (no breaking changes)**
```bash
yarn upgrade svelte svelte-check eslint eslint-plugin-svelte typescript-eslint \
  graphql graphql-request @vercel/analytics \
  @tailwindcss/typography prettier-plugin-tailwindcss
```
Run `yarn check && yarn lint` to confirm clean.

**Step 3 — SvelteKit minor upgrade (required for Vite 8 support)**

Edit `package.json`:
```
"@sveltejs/kit": "^2.59.1"
```
```bash
yarn install
yarn build
```
Verify deploy still works. This stays on 2.x — no migration guide needed.

**Step 4 — Vite 8 + vite-plugin-svelte 7 + adapter-vercel 6 (bundle together)**

Edit `package.json`:
```
"vite": "^8.0.13"
"@sveltejs/vite-plugin-svelte": "^7.1.2"
"@sveltejs/adapter-vercel": "^6.3.3"
```
```bash
yarn install
yarn build
```
Watch for CJS interop runtime errors. If any dependency imports break
(symptoms: `Cannot read properties of undefined`), find the ESM build of that package.

**Step 5 — TypeScript 6**

Edit `package.json`:
```
"typescript": "^6.0.3"
```
```bash
yarn install
yarn check
```
Expected issues to triage:
- Grep for `assert {` in `src/` — change to `with {` if found.
- If `Cannot find name 'process'` errors appear, add `"types": ["node"]` to `tsconfig.json`.
- Review any strict-mode errors that surface (though strict was already on).

**Step 6 — Verify full stack**
```bash
yarn build && yarn preview
```
Test all three routes: `/`, `/skyttere`, `/premieliste`.
Confirm PWA service worker, manifest, and installability still work.

---

## What NOT to Upgrade

| Package | Reason |
|---------|--------|
| `@sveltestack/svelte-query` | Remove entirely. Unmaintained (last release 2021), Svelte 3-era. No equivalent v5-compatible replacement needed — server-side loads + manual refresh covers the use case. |
| SvelteKit v3 | No stable release. Stay on 2.x until v3 ships. |
| TypeScript 7 | Go-rewrite, not stable. May have IDE tooling gaps. Skip until ecosystem catches up. |
| Node.js runtime | Already on 22.x which satisfies all peer deps. No change needed. |

---

## Confidence

| Area | Level | Basis |
|------|-------|-------|
| Version numbers | HIGH | npm registry, GitHub releases verified |
| Vite 8 breaking changes | HIGH | Official blog + real-world migration article |
| vite-plugin-svelte 7 requirements | HIGH | GitHub changelog + npm page |
| adapter-vercel v6 breaking changes | HIGH | GitHub changelog verified |
| TypeScript 6 breaking changes | HIGH | Official TS docs |
| TypeScript 6 impact on this tsconfig | MEDIUM | Inferred from tsconfig.json content — no runtime test done |
| CJS interop impact | MEDIUM | Depends on transitive deps; requires build test to confirm |
| SvelteKit 2.x minor changes | HIGH | Staying on same major, only additive |
