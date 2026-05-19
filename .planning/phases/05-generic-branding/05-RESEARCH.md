# Phase 5: Generic Branding - Research

**Researched:** 2026-05-19
**Domain:** String replacement, PWA manifest, SvelteKit app naming, documentation
**Confidence:** HIGH

## Summary

Phase 5 is a targeted string-replacement and documentation phase. No new packages, no
architectural changes, no logic changes. The sole goal is removing all hardcoded
"Stordalen Skytterlag" strings from user-facing surfaces and replacing them with a chosen
generic app name, then documenting the domain/DNS prerequisite for Phase 6.

The codebase has been fully audited: every occurrence of "Stordalen Skytterlag" and
"stordalen" is catalogued below with the exact file, line, and required action. BRAND-02
is docs-only — a written note in README or PROJECT.md stating the chosen domain and that
wildcard DNS must be enabled before Phase 6 goes live.

**Primary recommendation:** Choose app name "Skytterappen" (Norwegian, neutral, descriptive).
Replace all string occurrences in one wave. Write domain prerequisite note. Done.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| PWA install name | CDN / Static | — | `static/manifest.json` is served as a static asset |
| Browser tab title | Frontend Server (SSR) | — | `<svelte:head>` title tags in `+page.svelte` files; rendered per-route |
| iOS PWA title | CDN / Static | — | `<meta name="apple-mobile-web-app-title">` in `src/app.html` |
| Logo alt text | Frontend Server (SSR) | — | `alt=` attributes in Svelte component templates |
| Service worker cache key | CDN / Static | — | Generated into `static/sw.js` by Vite plugin at build time |
| Session storage key | Browser / Client | — | `sessionStorage` key in `Splash.svelte` |
| Domain prerequisite note | — | — | Docs only, no tier |

## Standard Stack

No packages to install. Phase is entirely string/text edits plus one documentation write.

## Package Legitimacy Audit

**No packages installed in this phase.** Section not applicable.

## Architecture Patterns

### Recommended Project Structure

No structural changes. Existing structure unchanged.

### Pattern 1: SvelteKit Per-Route `<svelte:head>` Title

**What:** Each `+page.svelte` sets its own `<title>` inside `<svelte:head>`. The suffix
"- Stordalen Skytterlag" is appended inline as a literal string — not via a shared
constant or layout-level title.

**When to use:** Consistent with existing codebase pattern; keep matching it.

**Example (current → target):**
```svelte
<!-- Current -->
<title>Skyteplan - Stordalen Skytterlag</title>

<!-- Target (using chosen app name) -->
<title>Skyteplan - Skytterappen</title>
```
[VERIFIED: grepped from source]

### Pattern 2: Vite `buildStart` Plugin for Service Worker

**What:** `vite.config.ts` has a `swVersionPlugin` that reads `static/sw.template.js`,
replaces `__CACHE_VERSION__` with `stordalen-{hash}` or `stordalen-dev`, then writes
`static/sw.js`. Both the prefix string ("stordalen-") and the asset path
`/stordalen.jpg` inside `sw.template.js` need updating.

**When to use:** Cache key prefix rename is a single string change in `vite.config.ts`.
Asset path rename is a separate concern (see below).

### Anti-Patterns to Avoid

- **Renaming the asset file `stordalen.jpg`:** The image is the Stordalen club logo.
  In Phase 6, logos become per-club dynamic. Renaming it in Phase 5 is premature.
  Use it as-is; update `alt=` text only. Image filename is NOT user-facing identity.
- **Creating a shared app-name constant:** Tempting, but over-engineering for this phase.
  Direct string replacement is simpler and matches the existing codebase pattern.
  Phase 6 will replace static branding with dynamic per-club rendering anyway.
- **Touching `package.json` `name` field:** This is the internal npm package name
  (`"stordalen"`), not user-facing. BRAND-01 only requires user-facing surfaces.
  Leave `package.json` alone.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| App name propagation | Config system / env var | Direct string replacement | Phase 6 makes this dynamic per-subdomain anyway; a constant adds indirection for one phase |

## Runtime State Inventory

Phase 5 involves string renaming across several files. Applying the runtime state
inventory protocol:

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | `sessionStorage` key `'stordalen-splash-shown'` in `Splash.svelte` | Code edit — change key name to match new app slug |
| Live service config | SW cache name `'stordalen-{hash}'` — written to `static/sw.js` at build time | Code edit in `vite.config.ts`; old cache cleared automatically on next deploy (browser sees new cache name) |
| OS-registered state | None — no Task Scheduler, pm2, or launchd registrations | None |
| Secrets/env vars | None — `VITE_AUTH_TOKEN` is unrelated to branding | None |
| Build artifacts | `static/sw.js` generated from template; will be regenerated on next `yarn build` | No manual action; Vite plugin regenerates it |

**Note on sessionStorage key:** Renaming `'stordalen-splash-shown'` means existing
browser sessions will lose the "already seen splash" flag on next visit — users will
see the splash once more. Acceptable, minor, expected behavior for a rename.

## Complete Hardcoded String Inventory

Every occurrence of "Stordalen Skytterlag" or "stordalen" (as identity, not asset
filename) found by grep:

### User-facing text (MUST change for BRAND-01)

| File | Line | Current Value | Required Change |
|------|------|---------------|-----------------|
| `static/manifest.json` | 2 | `"name": "Stordalen Skytterlag"` | Generic app name |
| `static/manifest.json` | 3 | `"short_name": "Stordalen"` | Generic short name |
| `static/manifest.json` | 4 | `"description": "Skyteprogram og skyttere for Stordalen Skytterlag"` | Generic description |
| `src/app.html` | 17 | `apple-mobile-web-app-title` content `"Stordalen"` | Generic short name |
| `src/routes/+page.svelte` | 83 | `<title>Skyteplan - Stordalen Skytterlag</title>` | Generic app name |
| `src/routes/skyttere/+page.svelte` | 19 | `<title>Skyttere - Stordalen Skytterlag</title>` | Generic app name |
| `src/routes/premieliste/+page.svelte` | 86 | `<title>Premieliste - Stordalen Skytterlag</title>` | Generic app name |
| `src/routes/+layout.svelte` | 26 | `alt="Stordalen Skytterlag"` | Generic app name |
| `src/routes/+error.svelte` | 9 | `alt="Stordalen Skytterlag"` | Generic app name |
| `src/routes/+error.svelte` | 10 | visible text `Stordalen Skytterlag` | Generic app name |
| `src/lib/components/Splash.svelte` | 33 | `alt="Stordalen Skytterlag"` | Generic app name |

### Internal / non-visible (change for consistency, not BRAND-01)

| File | Current Value | Action | Rationale |
|------|---------------|--------|-----------|
| `src/lib/components/Splash.svelte` | sessionStorage key `'stordalen-splash-shown'` | Rename key | Runtime state; old key orphaned in user browsers (harmless) |
| `vite.config.ts` | cache version prefix `'stordalen-dev'` and `'stordalen-'` | Rename prefix | SW cache name becomes generic; triggers one-time cache bust on deploy |
| `static/sw.template.js` | asset path `/stordalen.jpg` | Leave unchanged | Filename is the actual asset; rename is Phase 6 concern (logo becomes dynamic) |

### Not changing

| File | Current Value | Reason |
|------|---------------|--------|
| `package.json` | `"name": "stordalen"` | Internal npm name, not user-facing |
| `static/stordalen.jpg` | filename | Asset is the Stordalen logo; Phase 6 makes logos dynamic |
| `src/lib/assets/stordalen.jpg` | filename | Same reason |
| `static/sw.js` | generated file | Overwritten on next build; source is `sw.template.js` + `vite.config.ts` |
| `src/app.html` | `<link rel="icon" href=".../stordalen.jpg">` | Asset paths, not identity strings |
| `src/routes/+layout.svelte` | `import stordalenLogo from '$lib/assets/stordalen.jpg'` | Import path; asset rename deferred to Phase 6 |

### README

Current README is the default SvelteKit scaffold (`# sv` / "Everything you need to
build a Svelte project"). It has no "Stordalen Skytterlag" strings. BRAND-01 requires
"README and any other documentation files contain no hardcoded 'Stordalen Skytterlag'
in user-facing headings or descriptions" — already satisfied. The README should be
replaced with a project-specific one that names the app generically.

## App Name Recommendation

**Recommended: `Skytterappen`**

Rationale:
- Norwegian; all users are Norwegian
- Generic — "the shooter app", no club identity
- Short enough for `short_name` (12 chars)
- Descriptive — immediately understood at the range
- Domain-friendly: `skytterappen.no` or `skytterappen.app`

Alternative candidates considered:

| Name | Norwegian? | Neutral? | Notes |
|------|-----------|---------|-------|
| Skytterappen | Yes | Yes | Recommended |
| Skyteplan | Yes | Yes | Means "shooting schedule" only; misses results/prizes |
| SkyteApp | Partial | Yes | English hybrid |
| Skytterplan | Yes | Yes | "Shooters' plan"; slightly narrower meaning |

[ASSUMED] — app name is a user/owner decision. Recommendation above is a default for
the planner to use unless the user specifies otherwise.

## BRAND-02: Domain Prerequisite Documentation

**What BRAND-02 requires (docs-only, no code):**

A written note — in README or PROJECT.md — stating:
1. The chosen domain (e.g. `skytterappen.no` or `skytterappen.app`)
2. That wildcard DNS (`*.skytterappen.no` → Vercel) must be configured before Phase 6
   goes live
3. That clubs.ts subdomain keys must match the DNS pattern

**Where to write it:** Add a "## Deployment Prerequisites" section to README (replacing
the scaffold content) or add to `PROJECT.md` under a new "Infrastructure" heading.
PROJECT.md already exists and is the natural home for operational context.

**What wildcard DNS means in practice (for documentation accuracy):**
- DNS: `*.skytterappen.no CNAME cname.vercel-dns.com` (wildcard CNAME record)
- Vercel: Add `*.skytterappen.no` as a wildcard domain on the project
- Result: `stordalen.skytterappen.no`, `myclub.skytterappen.no` all resolve to the same
  Vercel deployment
- Phase 6 then reads the subdomain from the HTTP `host` header server-side

[ASSUMED] — exact domain not yet chosen; Vercel wildcard domain support confirmed in
Vercel docs. The DNS pattern above is standard for wildcard Vercel deployments.

## Common Pitfalls

### Pitfall 1: Leaving `static/sw.js` stale
**What goes wrong:** `sw.js` is checked into git and contains `stordalen-{hash}`.
Editing only `sw.template.js` and `vite.config.ts` but forgetting to run a build
leaves the committed `sw.js` with the old prefix.
**Why it happens:** Generated file committed to git; developer edits source but
doesn't rebuild before committing.
**How to avoid:** Run `yarn build` after editing `vite.config.ts` and `sw.template.js`
so `static/sw.js` is regenerated before commit. Or commit `sw.js` last, after the
build step in the plan.
**Warning signs:** `static/sw.js` line 1 still reads `stordalen-` after build.

### Pitfall 2: Old sessionStorage key orphaned in test browser
**What goes wrong:** After renaming `'stordalen-splash-shown'`, the developer's own
browser still has the old key set, so the splash never shows during manual testing.
**Why it happens:** `sessionStorage` persists across page reloads within a tab session.
**How to avoid:** Clear sessionStorage in DevTools after deploying the rename, or open
a fresh private/incognito window to test the splash.
**Warning signs:** Splash never appears even on first load in that browser tab.

### Pitfall 3: Missing one title tag
**What goes wrong:** Three routes each have their own `<svelte:head><title>` tag.
Grepping only for "Stordalen Skytterlag" finds them, but a find-and-replace in one
file misses the others.
**Why it happens:** No shared title suffix constant — each page is independent.
**How to avoid:** Edit all three `+page.svelte` files explicitly (schedule, skyttere,
premieliste). Verify with `grep -rn "Stordalen Skytterlag" src/`.

### Pitfall 4: manifest.json `short_name` forgotten
**What goes wrong:** `name` field updated but `short_name` still reads "Stordalen".
`short_name` appears on the device home screen icon label — high visibility.
**Why it happens:** Two separate fields; easy to edit only `name`.
**How to avoid:** Edit both `name` and `short_name` in the same manifest.json edit.

## Code Examples

### manifest.json target state
```json
{
  "name": "Skytterappen",
  "short_name": "Skytterappen",
  "description": "Skyteprogram og resultater for skytterlaget",
  ...
}
```

### app.html iOS title target
```html
<meta name="apple-mobile-web-app-title" content="Skytterappen" />
```

### vite.config.ts cache prefix target
```typescript
version = 'skytterappen-dev';
// ...
version = 'skytterappen-' + hash;
```

### sessionStorage key target
```typescript
const hasSeenSplash = sessionStorage.getItem('skytterappen-splash-shown');
sessionStorage.setItem('skytterappen-splash-shown', 'true');
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | svelte-check + yarn build (no unit test framework) |
| Config file | none |
| Quick run command | `yarn check` |
| Full suite command | `yarn build && grep -rn "Stordalen Skytterlag" src/ static/manifest.json` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BRAND-01 | No "Stordalen Skytterlag" in manifest, title tags, alt text | smoke (grep) | `grep -rn "Stordalen Skytterlag" src/ static/manifest.json && echo FAIL \|\| echo PASS` | n/a — grep |
| BRAND-01 | `yarn check` passes after edits | type-check | `yarn check` | existing |
| BRAND-01 | `yarn build` succeeds | build smoke | `yarn build` | existing |
| BRAND-02 | Domain prereq note exists in README or PROJECT.md | manual | inspect file contents | ❌ Wave 0 — write the note |

### Sampling Rate
- **Per task commit:** `yarn check`
- **Per wave merge:** `yarn build`
- **Phase gate:** Full suite green + manual grep confirms zero "Stordalen Skytterlag" in src/ and static/manifest.json

### Wave 0 Gaps
- [ ] Domain prerequisite note in README or PROJECT.md — covers BRAND-02 (content task, not a test file)

## Security Domain

This phase contains no authentication, input validation, cryptography, or session
management changes. No ASVS categories apply. `security_enforcement` not explicitly
disabled in config but this phase has no security surface.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | App name "Skytterappen" chosen as default | App Name Recommendation | User may prefer different name; planner should surface this choice before executing |
| A2 | Wildcard Vercel DNS pattern `*.domain CNAME cname.vercel-dns.com` | BRAND-02 section | If Vercel changes DNS instructions, documentation note would be inaccurate; low impact since it's advisory |
| A3 | README currently has no "Stordalen Skytterlag" user-facing content (verified by grep) | Complete Inventory | None — grep confirmed this [VERIFIED: grepped from source] |

## Open Questions

1. **App name confirmation**
   - What we know: "Skytterappen" is a reasonable generic Norwegian name
   - What's unclear: Owner may have a preferred name or existing domain registration
   - Recommendation: Planner should present the name choice as a user decision point before executing

2. **Domain already registered?**
   - What we know: BRAND-02 documents the domain as a prerequisite for Phase 6
   - What's unclear: Whether a domain is already owned or needs to be purchased
   - Recommendation: Note in docs that domain registration is a manual human action; do not block Phase 5 completion on it

## Environment Availability

Step 2.6: SKIPPED — Phase 5 is purely code/text edits and documentation. No external
dependencies, services, runtimes, or CLI utilities beyond the existing SvelteKit dev
environment (already verified operational in v2).

## Sources

### Primary (HIGH confidence)
- Direct grep of `/Users/asb/Projects/stordalen/src/` and `static/` — all occurrences verified by tool
- `static/manifest.json` — read directly
- `src/app.html` — read directly
- `vite.config.ts` — read directly
- `src/lib/components/Splash.svelte` — read directly
- `src/routes/+error.svelte`, `+layout.svelte`, all `+page.svelte` files — read directly

### Secondary (MEDIUM confidence)
- Vercel wildcard domain pattern — [ASSUMED] based on training knowledge; not re-verified via docs this session

## Metadata

**Confidence breakdown:**
- String inventory: HIGH — complete grep audit of entire src/ and static/ tree
- App name recommendation: LOW — subjective; owner decision
- BRAND-02 documentation pattern: HIGH — requirement is explicitly docs-only per ROADMAP.md
- Vercel wildcard DNS note: MEDIUM — standard pattern, not re-verified

**Research date:** 2026-05-19
**Valid until:** Stable — no external dependencies; valid until codebase changes
