---
phase: 02-security-tech-debt
plan: "01"
subsystem: graphql-server-migration
tags:
  - sveltekit
  - server-loaders
  - graphql
  - security
dependency_graph:
  requires: []
  provides:
    - src/lib/server/graphql/client.ts
    - src/lib/server/graphql/queries.ts
    - src/routes/+page.server.ts
    - src/routes/skyttere/+page.server.ts
    - src/routes/premieliste/+page.server.ts
  affects:
    - src/lib/index.ts
tech_stack:
  added: []
  patterns:
    - PageServerLoad server-only loaders
    - $env/static/private for secret management
    - /^\d+$/ input validation with silent fallback
key_files:
  created:
    - src/lib/server/graphql/client.ts
    - src/lib/server/graphql/queries.ts
    - src/routes/+page.server.ts
    - src/routes/skyttere/+page.server.ts
    - src/routes/premieliste/+page.server.ts
  modified:
    - src/lib/index.ts
  deleted:
    - src/lib/graphql/client.ts
    - src/lib/graphql/queries.ts
    - src/routes/+page.ts
    - src/routes/skyttere/+page.ts
    - src/routes/premieliste/+page.ts
decisions:
  - "AUTH_TOKEN read via $env/static/private; SvelteKit static analysis blocks client bundle inclusion"
  - "Club ID validated with /^\\d+$/ regex; non-digit values silently fall back to DEFAULT_CLUB_ID"
  - "premieliste loader returns error: null in success branch for consistent PageData type"
  - "src/lib/graphql/types.ts stays at client-safe path — types are not server-only"
  - "src/lib/index.ts kept as no-export module with comment to avoid server-only barrel taint"
metrics:
  duration: "~8 minutes"
  completed: "2026-05-18"
  tasks: 3
  files_changed: 10
---

# Phase 02 Plan 01: Server-Side GraphQL Migration Summary

Server-only GraphQL client using `$env/static/private` with three `PageServerLoad` loaders replacing universal loaders, eliminating auth token from client bundle (SEC-01), input validation on `?c=` param (SEC-02), and explicit error field in premieliste loader (DEBT-02).

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create server-only GraphQL module | ee3dfe3 | src/lib/server/graphql/client.ts, src/lib/server/graphql/queries.ts |
| 2 | Rename loaders to +page.server.ts with validation | 3d7e143 | src/routes/+page.server.ts, skyttere/+page.server.ts, premieliste/+page.server.ts |
| 3 | Delete legacy files, update barrel, verify build | 749d6a5 | src/lib/index.ts, deleted 5 legacy files |

## Security Verification

**SEC-01 (AUTH_TOKEN in client bundle):**
```
grep -r "AUTH_TOKEN" .svelte-kit/output/client/ → zero matches
```
Token absent from client bundle. SvelteKit's `$env/static/private` import boundary enforced at build time.

**SEC-02 (club ID injection):**
All three loaders apply `/^\d+$/.test(raw)` before using `?c=` value. Non-digit input silently falls back to `DEFAULT_CLUB_ID` per CONTEXT.md Claude's-Discretion decision.

**DEBT-02 (silent failure in premieliste):**
`premieliste/+page.server.ts` catch branch now returns `error: error instanceof Error ? error.message : 'Unknown error occurred'`. Success branch returns `error: null` for type consistency.

## yarn check / yarn build

- `svelte-check`: 0 errors, 2 pre-existing warnings (premieliste/+page.svelte reactive ref, tsconfig @types/node)
- `vite build`: exits 0, client bundle emitted to `.svelte-kit/output/client/`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Worktree missing .env with AUTH_TOKEN**
- **Found during:** Task 1 verification (`svelte-check`)
- **Issue:** Worktree had no `.env` file; `$env/static/private` type-checking requires `AUTH_TOKEN` to be defined. Error: `Module '$env/static/private' has no exported member 'AUTH_TOKEN'`
- **Fix:** Created `.env` in worktree root with the same `AUTH_TOKEN` value from main repo `.env`
- **Files modified:** `.env` (worktree-local, gitignored)
- **Impact:** None on production; dev/CI environments need `AUTH_TOKEN` in their `.env`

**2. VITE_AUTH_TOKEN in src/ check**
- Plan acceptance criterion: "No file under src/ contains VITE_AUTH_TOKEN"
- `src/lib/server/graphql/client.ts` contains `VITE_AUTH_TOKEN` in a comment (deployment instruction per plan spec). This is intentional — the comment text was required by the plan itself. Not an actual usage.

## Known Stubs

None. All data flows from real GraphQL queries through server loaders to page components.

## Threat Flags

None. All new surface (server loaders at trust boundary browser→server) was already in the plan's threat model and mitigated per T-2-01, T-2-02.

## Vercel Dashboard Action Required

**Before next deploy:** rename environment variable in Vercel dashboard:
- Old name: `VITE_AUTH_TOKEN`
- New name: `AUTH_TOKEN`

The `VITE_*` prefix is no longer used — the token is now read server-side via `$env/static/private`. If the rename is not done before deploy, the server will fail to authenticate with the GraphQL API.

## Self-Check: PASSED

- src/lib/server/graphql/client.ts: FOUND
- src/lib/server/graphql/queries.ts: FOUND
- src/routes/+page.server.ts: FOUND
- src/routes/skyttere/+page.server.ts: FOUND
- src/routes/premieliste/+page.server.ts: FOUND
- src/lib/graphql/client.ts: DELETED
- src/lib/graphql/queries.ts: DELETED
- src/routes/+page.ts: DELETED
- Commits: ee3dfe3, 3d7e143, 749d6a5 — all verified in git log
