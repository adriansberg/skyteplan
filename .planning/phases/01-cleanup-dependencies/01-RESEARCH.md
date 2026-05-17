# Phase 1: Cleanup & Dependencies - Research

**Researched:** 2026-05-17
**Domain:** SvelteKit dependency upgrade + dead code removal
**Confidence:** HIGH

## Summary

Phase 1 is a mandatory sequenced upgrade from a partially-updated stack (SvelteKit 2.26, Vite 7, TS 5) to the target stack (SvelteKit 2.59, Vite 8, TS 6), combined with straightforward dead code removal. All upgrade targets exist on npm and have been verified. No breaking changes exist in the SvelteKit 2.22→2.59 range for standard load-function apps. Vite 8 breaking changes (renamed rollupOptions, esbuildOptions) do not apply because vite.config.ts only uses `plugins: []`. TypeScript 6's `types:[]` default change is low-impact because the project uses lib:DOM for browser globals and has no @types/node dependency in TS source files.

The code cleanup tasks (CLEAN-01 through CLEAN-04, SEC-03) are all single-file surgical edits with zero risk of cascading breakage — `@sveltestack/svelte-query` has exactly one import site, the deprecated formatters have zero callers, the club ID appears in exactly three files, and the hardcoded year is in exactly one component.

**Primary recommendation:** Execute in four sequenced steps. Run `yarn check && yarn build` after each step. Never batch Vite with TypeScript — svelte peer constraint forces svelte upgrade to happen at or before step 3.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Dependency version management | Build/Dev | — | package.json + yarn; no runtime impact |
| Club ID constant | Frontend Server (SSR) | — | Used in universal load functions (+page.ts), not client-only |
| Dead code removal | All tiers | — | formatters.ts (utils), pwa.ts (browser), layout.svelte (frontend) |
| Year in external URL | Browser/Client | — | ShooterExternalLink.svelte renders href at component level |

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CLEAN-01 | Remove @sveltestack/svelte-query from layout and package.json | Confirmed: one import site in +layout.svelte lines 4, 11, 69-71; QueryClientProvider wraps children but no page uses useQuery/useMutation hooks |
| CLEAN-02 | Delete formatNorwegianDateLocal and formatNorwegianTimeLocale from formatters.ts | Confirmed: both functions exist at lines 37-43, 63-65; grep finds zero callers in codebase |
| CLEAN-03 | Delete duplicate install-prompt logic from pwa.ts | Confirmed: pwa.ts lines 16-31 duplicate InstallPrompt.svelte's beforeinstallprompt/appinstalled handlers; keep SW registration (lines 2-13); deferredPrompt export has no importers |
| CLEAN-04 | Extract club ID '10782' to shared constant | Confirmed: '10782' appears in exactly 3 files (+page.ts, skyttere/+page.ts, premieliste/+page.ts line 6 each); target: src/lib/constants.ts |
| SEC-03 | Replace hardcoded 2025 in lsres.no URL with new Date().getFullYear() | Confirmed: ShooterExternalLink.svelte line 11: href="https://2025.lsres.no/..." |
| DEPS-01 | Patch/minor dependency bumps | Verified on npm: svelte 5.55.7, svelte-check 4.4.8, graphql-request 7.4.0, eslint 9.39.4, prettier 3.8.3, @vercel/analytics 1.6.1 |
| DEPS-02 | SvelteKit 2.22→2.59 | Verified: 2.59.1 on npm; zero breaking changes for standard load-function apps in 2.22-2.59 range |
| DEPS-03 | Vite 7→8, adapter-vercel 5→6 | Verified: vite 8.0.13, vite-plugin-svelte 7.1.2, adapter-vercel 6.3.3 on npm; vite.config.ts needs no changes |
| DEPS-04 | TypeScript 5→6 | Verified: typescript 6.0.3 on npm; types:[] default change is low-impact for this project |
</phase_requirements>

## Standard Stack

### Current vs Target Versions

| Package | Installed | Target | Notes |
|---------|-----------|--------|-------|
| svelte | 5.37.1 | 5.55.7 | Must reach ≥5.46.4 before vite-plugin-svelte@7 [VERIFIED: npm registry] |
| @sveltejs/kit | 2.26.1 | 2.59.1 | No breaking changes for standard apps [VERIFIED: npm registry] |
| vite | 7.0.6 | 8.0.13 | Rolldown era; vite.config.ts needs no changes [VERIFIED: npm registry] |
| @sveltejs/vite-plugin-svelte | 6.1.0 | 7.1.2 | Requires vite@8 AND svelte@≥5.46.4 [VERIFIED: npm registry] |
| @sveltejs/adapter-vercel | 5.8.1 | 6.3.3 | Peer: @sveltejs/kit ^2.4.0 — compatible [VERIFIED: npm registry] |
| typescript | 5.9.2 | 6.0.3 | types:[] default change; low impact here [VERIFIED: npm registry] |
| svelte-check | 4.3.0 | 4.4.8 | Patch bump [VERIFIED: npm registry] |
| graphql-request | 7.2.0 | 7.4.0 | Minor bump [VERIFIED: npm registry] |
| eslint | 9.32.0 | 9.39.4 | Stay on 9.x (10.x is latest, not targeted) [VERIFIED: npm registry] |
| prettier | 3.6.2 | 3.8.3 | Patch bump [VERIFIED: npm registry] |
| @vercel/analytics | 1.5.0 | 1.6.1 | Stay on 1.x (2.x is latest) [VERIFIED: npm registry] |

### Packages NOT being bumped (already at target or not in scope)
- tailwindcss 4.1.11 — already latest in 4.x series
- graphql 16.14.0 — already latest
- @tailwindcss/vite 4.1.11 — peer-compatible with Vite 8 (peerDep: ^5.2.0 || ^6 || ^7 || ^8)

### Installation — Step 1 (patch bumps)
```bash
yarn add -D svelte@5.55.7 svelte-check@4.4.8 eslint@9.39.4 prettier@3.8.3
yarn add graphql-request@7.4.0 @vercel/analytics@1.6.1
```

### Installation — Step 2 (SvelteKit)
```bash
yarn add -D @sveltejs/kit@2.59.1
```

### Installation — Step 3 (Vite + adapter)
```bash
yarn add -D vite@8.0.13 @sveltejs/vite-plugin-svelte@7.1.2 @sveltejs/adapter-vercel@6.3.3
```

### Installation — Step 4 (TypeScript)
```bash
yarn add -D typescript@6.0.3
```

## Package Legitimacy Audit

> slopcheck was not installable in this environment — all packages marked [ASSUMED] for provenance. All packages verified on npm registry with npm view. All are established packages with multi-year histories and official @sveltejs/* scope ownership.

| Package | Registry | Age | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-------------|-----------|-------------|
| svelte | npm | Since 2016 | github.com/sveltejs/svelte | unavailable | Approved — official [ASSUMED] |
| @sveltejs/kit | npm | Since 2020 | github.com/sveltejs/kit | unavailable | Approved — official [ASSUMED] |
| vite | npm | Since 2020 | github.com/vitejs/vite | unavailable | Approved — official [ASSUMED] |
| @sveltejs/vite-plugin-svelte | npm | Since 2020 | github.com/sveltejs/vite-plugin-svelte | unavailable | Approved — official [ASSUMED] |
| @sveltejs/adapter-vercel | npm | Since 2020 | github.com/sveltejs/kit | unavailable | Approved — official [ASSUMED] |
| typescript | npm | Since 2012 | github.com/microsoft/TypeScript | unavailable | Approved — official [ASSUMED] |
| eslint | npm | Since 2013 | github.com/eslint/eslint | unavailable | Approved — official [ASSUMED] |
| prettier | npm | Since 2017 | github.com/prettier/prettier | unavailable | Approved — official [ASSUMED] |
| graphql-request | npm | Since 2016 | github.com/jasonkuhrt/graphql-request | unavailable | Approved — well-known [ASSUMED] |
| @vercel/analytics | npm | Since 2022 | github.com/vercel/analytics | unavailable | Approved — official [ASSUMED] |

**Packages removed due to [SLOP]:** none
**Packages flagged [SUS]:** none

*slopcheck was unavailable. All packages are from official scopes (@sveltejs, microsoft, vitejs, eslint, prettier, vercel) with registries verified via `npm view`. Planner should add `checkpoint:human-verify` before each install step as a precaution.*

## Architecture Patterns

### Upgrade Sequence (MANDATORY ORDER)

```
State:  SvelteKit 2.26 + Vite 7 + TS 5 + svelte 5.37
        ↓
Step 1: Patch bumps (svelte 5.55.7 is KEY — unlocks vite-plugin-svelte@7)
        yarn check + yarn build ✓
        ↓
Step 2: SvelteKit 2.59.1
        yarn check + yarn build ✓
        ↓
Step 3: Vite 8.0.13 + vite-plugin-svelte 7.1.2 + adapter-vercel 6.3.3
        yarn check + yarn build ✓
        ↓
Step 4: TypeScript 6.0.3 + tsconfig review
        yarn check + yarn build ✓
```

**Why svelte must bump first:** `@sveltejs/vite-plugin-svelte@7` has peer constraint `svelte: ^5.46.4`. Current installed svelte is 5.37.1. Must be ≥5.46.4 before Step 3.

### Recommended Project Structure (additions only)
```
src/lib/
├── constants.ts       # NEW — shared constants (CLEAN-04)
├── graphql/
├── utils/
│   └── formatters.ts  # MODIFY — remove 2 deprecated functions
└── pwa.ts             # MODIFY — remove duplicate install-prompt logic
```

### Pattern: Shared Constants File (CLEAN-04)
```typescript
// src/lib/constants.ts
// Source: SvelteKit $lib convention — accessible as '$lib/constants'
export const DEFAULT_CLUB_ID = '10782';
```

Usage in all three loaders:
```typescript
import { DEFAULT_CLUB_ID } from '$lib/constants';
// ...
const clubId = url.searchParams.get('c') || DEFAULT_CLUB_ID;
```

### Pattern: Dynamic Year in External URL (SEC-03)
```typescript
// src/lib/components/ShooterExternalLink.svelte
// Before: href="https://2025.lsres.no/search/?s={...}"
// After:
const year = new Date().getFullYear();
// in template:
// href="https://{year}.lsres.no/search/?s={encodeURIComponent(shooterName)}"
```

### Pattern: Remove QueryClientProvider (CLEAN-01)
In `+layout.svelte`:
- Remove import of `QueryClient, QueryClientProvider` from `@sveltestack/svelte-query`
- Remove `const queryClient = new QueryClient()`
- Replace `<QueryClientProvider client={queryClient}>{@render children?.()}</QueryClientProvider>` with `{@render children?.()}`
- Run `yarn remove @sveltestack/svelte-query`

### Pattern: Slimmed pwa.ts (CLEAN-03)
After removal, pwa.ts should contain ONLY service worker registration:
```typescript
// src/lib/pwa.ts
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
```
Remove: `deferredPrompt` module variable, `beforeinstallprompt` listener, `appinstalled` listener, `export { deferredPrompt }`.

### Anti-Patterns to Avoid
- **Batching Vite with TypeScript**: Vite 8 and TS 6 must be separate steps — mixed peer constraints can produce confusing resolution failures.
- **Setting `runes: true` globally in svelte.config.js**: Per STATE.md decision, use per-file `<svelte:options runes={true} />` only.
- **Bumping eslint to 10.x**: The project targets eslint 9.x for this phase. eslint 10 is a separate major.
- **Bumping @vercel/analytics to 2.x**: May have breaking API changes — stay on 1.x for this phase.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Checking if package versions satisfy peer deps | Manual parsing | `npm view <pkg> peerDependencies` | npm registry is authoritative |
| TypeScript config for TS6 | Custom tsconfig | Extend .svelte-kit/tsconfig.json + minimal overrides | SvelteKit manages the base config |

## Common Pitfalls

### Pitfall 1: svelte version not bumped before vite-plugin-svelte@7
**What goes wrong:** yarn install fails with peer dependency conflict — `@sveltejs/vite-plugin-svelte@7` requires `svelte ^5.46.4` but installed is 5.37.1.
**Why it happens:** DEPS-01 patch bumps include svelte, but if only SvelteKit is bumped (DEPS-02) before Vite (DEPS-03), the svelte bump may be overlooked.
**How to avoid:** Step 1 explicitly bumps svelte to 5.55.7 before any other major bump.
**Warning signs:** `Unmet peer dependency` error from yarn during Step 3.

### Pitfall 2: TypeScript 6 types:[] breaking unknown globals
**What goes wrong:** `yarn check` fails with "Cannot find name 'X'" for global types.
**Why it happens:** TS6 defaults `types` to `[]` instead of auto-including all `@types/*` packages.
**How to avoid:** This project has no `@types/node` dependency in TS source files — browser globals come from `lib: [DOM, DOM.Iterable]` in `.svelte-kit/tsconfig.json`. Risk is LOW. If errors appear, add explicit `"types": ["cookie"]` (the only @types in node_modules).
**Warning signs:** Post-TS6-upgrade `yarn check` errors for names that aren't imported.

### Pitfall 3: Vite 8 vite-plugin-svelte-inspector conflict
**What goes wrong:** Build error or duplicate plugin warning — `@sveltejs/vite-plugin-svelte-inspector@5` was separate in plugin-svelte@6 ecosystem but is now integrated into plugin-svelte@7.
**Why it happens:** vite-plugin-svelte@7 integrates the inspector; `@sveltejs/vite-plugin-svelte-inspector` is a transitive install from the old version.
**How to avoid:** After Step 3, verify no duplicate inspector is registered. vite-plugin-svelte@7 handles this automatically — no manual config needed.
**Warning signs:** Build warnings about duplicate plugin registration.

### Pitfall 4: QueryClientProvider removal breaks children rendering
**What goes wrong:** After removing `<QueryClientProvider>`, the layout's `{@render children?.()}` stops rendering page content.
**Why it happens:** If QueryClientProvider was providing a context slot, removing it without the bare render call breaks the slot.
**How to avoid:** The layout already uses `{@render children?.()}` inside the provider. When removing the provider wrapper, keep the `{@render children?.()}` call in the same position.
**Warning signs:** Page routes render blank after CLEAN-01.

### Pitfall 5: Hardcoded year in template string vs href attribute
**What goes wrong:** The year fix is inside a Svelte template href attribute. Using `{new Date().getFullYear()}` directly in the href is valid but avoid putting it in a non-reactive expression if component doesn't re-render on year change.
**Why it happens:** `new Date().getFullYear()` evaluates at component mount — acceptable since competition apps restart daily.
**How to avoid:** Assign to a const at script top: `const year = new Date().getFullYear()`. Use in template as `https://{year}.lsres.no/...`.

## Code Examples

### CLEAN-01: Layout after svelte-query removal
```svelte
<script lang="ts">
    import '../app.css';
    import stordalenLogo from '$lib/assets/stordalen.jpg';
    import { page } from '$app/state';
    import { browser } from '$app/environment';
    import InstallPrompt from '$lib/components/InstallPrompt.svelte';
    import PullToRefresh from '$lib/components/PullToRefresh.svelte';
    import RefreshButton from '$lib/components/RefreshButton.svelte';

    let { children } = $props();

    const isSchedulePage = $derived(page.url.pathname === '/');
    const isShootersPage = $derived(page.url.pathname === '/skyttere');
    const isPremielistePage = $derived(page.url.pathname === '/premieliste');

    if (browser) {
        import('$lib/pwa');
    }
</script>
<!-- ... header unchanged ... -->
{@render children?.()}
<PullToRefresh />
<InstallPrompt />
```

### CLEAN-04: constants.ts
```typescript
// src/lib/constants.ts
export const DEFAULT_CLUB_ID = '10782';
```

### CLEAN-04: Loader after extraction
```typescript
// src/routes/+page.ts (and skyttere/+page.ts and premieliste/+page.ts)
import { DEFAULT_CLUB_ID } from '$lib/constants';
// ...
const clubId = url.searchParams.get('c') || DEFAULT_CLUB_ID;
```

### SEC-03: ShooterExternalLink fix
```svelte
<script lang="ts">
    interface Props {
        shooterName: string;
        class?: string;
    }
    let { shooterName, class: className = '' }: Props = $props();
    const year = new Date().getFullYear();
</script>

<a
    href="https://{year}.lsres.no/search/?s={encodeURIComponent(shooterName)}"
    ...
>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Rollup bundler in Vite | Rolldown (Rust) via Vite 8 | Vite 8.0.0 (2025) | Auto compat layer; vite.config.ts needs no changes for this project |
| esbuild transforms | Oxc transforms in Vite 8 | Vite 8.0.0 (2025) | Faster; no config changes needed |
| @types auto-include in TS | types:[] default in TS 6 | TypeScript 6.0 (2025) | Must explicitly declare @types if needed |
| vite-plugin-svelte-inspector separate | Integrated into vite-plugin-svelte@7 | v7.0.0 (2025) | Remove standalone inspector if present |

**Deprecated/outdated:**
- `@sveltestack/svelte-query`: Last release 2021, Svelte 3 era, unmaintained. Removed in CLEAN-01.
- `formatNorwegianDateLocal` / `formatNorwegianTimeLocale`: Marked `@deprecated` in source, zero callers. Removed in CLEAN-02.
- `build.rollupOptions` in Vite 8: Renamed to `build.rolldownOptions`. N/A for this project (no rollupOptions used).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | SvelteKit 2.22→2.59 has no breaking changes for standard load-function apps | Standard Stack / Pitfalls | Would require code migration steps not currently planned |
| A2 | @vercel/analytics 1.x→1.6.1 is a non-breaking bump | Standard Stack | API changes could affect analytics calls — but package is unused in source anyway |
| A3 | TypeScript 6 types:[] default doesn't break this project | Pitfall 2 | If @types/cookie or others are implicitly expected, yarn check would fail after TS6 upgrade |

## Open Questions (RESOLVED)

1. **eslint 9.x vs 10.x** — RESOLVED: Stay on 9.39.4 for Phase 1 (DEPS-01). 10.x may require eslint.config.js flat-config changes; not worth the risk in a cleanup phase. Evaluate 10.x separately.

2. **adapter-vercel 6 Vercel deployment compatibility** — RESOLVED: Accepted as LOW risk (01-04 plan). adapter-vercel 6.3.3 supports @sveltejs/kit ^2.4.0 with no visible API surface changes; no code changes required in svelte.config.js.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite 8 (requires ≥20.19+) | ✓ | v22.14.0 | — |
| Yarn | Package management | ✓ | 1.22.19 | — |
| npm CLI | Version verification | ✓ | (bundled) | — |

**Missing dependencies with no fallback:** None.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | svelte-check (type checking) + vite build |
| Config file | tsconfig.json + svelte.config.js |
| Type-check command | `yarn check` |
| Build command | `yarn build` |
| Lint command | `yarn lint` |

### Phase Requirements → Verification Map

| Req ID | Behavior | Verification | Command |
|--------|----------|--------------|---------|
| CLEAN-01 | No svelte-query imports | grep | `grep -r "svelte-query" src/ && echo FAIL \|\| echo PASS` |
| CLEAN-01 | Not in package.json | grep | `grep "svelte-query" package.json && echo FAIL \|\| echo PASS` |
| CLEAN-02 | Deprecated functions absent | grep | `grep -r "formatNorwegianDateLocal\|formatNorwegianTimeLocale" src/ && echo FAIL \|\| echo PASS` |
| CLEAN-03 | beforeinstallprompt only in InstallPrompt | grep | `grep -r "beforeinstallprompt" src/ \| grep -v InstallPrompt && echo FAIL \|\| echo PASS` |
| CLEAN-04 | '10782' in exactly one file | grep count | `grep -rl "'10782'" src/ \| wc -l` (expect: 1) |
| CLEAN-04 | That one file is constants.ts | grep | `grep -rl "'10782'" src/` (expect: `src/lib/constants.ts`) |
| SEC-03 | No hardcoded 2025 in lsres.no href | grep | `grep -r "2025.lsres.no" src/ && echo FAIL \|\| echo PASS` |
| DEPS-01 | Patch versions installed | yarn list | `yarn list --depth=0 2>/dev/null \| grep -E "svelte@5\|svelte-check@4\|eslint@9\|prettier@3"` |
| DEPS-02 | SvelteKit 2.59 installed | yarn list | `yarn list --depth=0 2>/dev/null \| grep "@sveltejs/kit@2.59"` |
| DEPS-03 | Vite 8 + adapter 6 installed | yarn list | `yarn list --depth=0 2>/dev/null \| grep -E "vite@8\|adapter-vercel@6\|vite-plugin-svelte@7"` |
| DEPS-04 | TypeScript 6 installed | yarn list | `yarn list --depth=0 2>/dev/null \| grep "typescript@6"` |
| All DEPS | Build passes | build | `yarn build` (exit code 0) |
| All DEPS | Type check passes | type check | `yarn check` (exit code 0) |

### Sampling Rate
- **Per task commit:** `yarn check` (type check only — fast)
- **After each upgrade step:** `yarn check && yarn build`
- **Phase gate:** `yarn lint && yarn check && yarn build` all green

### Wave 0 Gaps
None — this phase has no automated test files to create. Verification is via build toolchain (`yarn check`, `yarn build`) and grep assertions.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | no | SEC-02 (club ID validation) is Phase 2 |
| V6 Cryptography | no | — |

No security-relevant ASVS categories apply to Phase 1. SEC-03 (dynamic year) is a correctness fix, not a security control.

## Sources

### Primary (HIGH confidence)
- `npm view <pkg> version` and `npm view <pkg> peerDependencies` — all version/peer data verified via npm CLI
- `grep` on codebase — all occurrence counts are exact (run at research time)
- `yarn list --depth=0` output — all installed versions exact

### Secondary (MEDIUM confidence)
- [Vite 8 Migration Guide](https://vite.dev/guide/migration.html) — breaking changes list [CITED: vite.dev/guide/migration.html]
- [vite-plugin-svelte CHANGELOG](https://raw.githubusercontent.com/sveltejs/vite-plugin-svelte/main/packages/vite-plugin-svelte/CHANGELOG.md) — 6→7 breaking changes [CITED: github.com/sveltejs/vite-plugin-svelte]
- [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html) — types:[] default change [CITED: typescriptlang.org]
- [SvelteKit CHANGELOG raw](https://raw.githubusercontent.com/sveltejs/kit/main/packages/kit/CHANGELOG.md) — confirmed no standard-app breaking changes 2.22→2.60 [CITED: github.com/sveltejs/kit]

### Tertiary (LOW confidence)
- TypeScript 6.0 types:[] impact assessment for this specific project — [ASSUMED], based on @types absence in node_modules/

## Metadata

**Confidence breakdown:**
- Code inventory (CLEAN-* targets): HIGH — grep-verified exact occurrences
- Upgrade target versions: HIGH — verified on npm registry
- SvelteKit 2.22→2.59 no breaking changes: HIGH — verified via official changelog
- Vite 8 breaking changes not applicable: HIGH — project uses zero affected options
- TypeScript 6 types:[] impact: MEDIUM — assessed from @types inventory but not run yet
- vite-plugin-svelte@7 requires svelte≥5.46.4: HIGH — verified via npm peerDependencies

**Research date:** 2026-05-17
**Valid until:** 2026-06-17 (stable packages — 30 days)
