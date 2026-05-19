# Phase 2: Security & Tech Debt - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-18
**Phase:** 2-security-tech-debt
**Areas discussed:** Server client structure, Error page style

---

## Server Client Structure

### Q1: Where should the server-only GraphQL client live?

| Option | Description | Selected |
|--------|-------------|----------|
| `src/lib/server/graphql/client.ts` | SvelteKit convention — anything in `$lib/server/` is automatically server-only. Uses `$env/static/private`. | ✓ |
| Keep `src/lib/graphql/client.ts`, add server guard | Keep existing location, switch env var. SvelteKit errors at build if client imports it. | |
| Inline token in each loader | No separate client file — each loader reads env directly. Verbose, zero abstraction. | |

**User's choice:** `src/lib/server/graphql/client.ts`

---

### Q2: Env var name — VITE_AUTH_TOKEN or AUTH_TOKEN?

| Option | Description | Selected |
|--------|-------------|----------|
| Rename to `AUTH_TOKEN` on Vercel | Clean break — add new secret, document change. | ✓ |
| Keep `VITE_AUTH_TOKEN` name | Same Vercel var, just import via `$env/static/private`. Confusing name. | |

**User's choice:** Rename to `AUTH_TOKEN`

---

### Q3: Where does queries.ts live after migration?

| Option | Description | Selected |
|--------|-------------|----------|
| Move to `src/lib/server/graphql/queries.ts` | Co-located with server client. No accidental client use. | ✓ |
| Keep at `$lib/graphql/queries.ts` | Stays accessible from client (runtime broken, build passes). | |

**User's choice:** Move to `src/lib/server/graphql/`

---

## Error Page Style

### Q1: How styled is +error.svelte?

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal — Norwegian message, match existing error box | Same red border box already used on pages. No nav. | |
| Styled — app nav + error card | Full sticky nav + error card. Consistent with app layout. | ✓ |

**User's choice:** Styled with app nav + error card

---

### Q2: Norwegian error message text?

| Option | Description | Selected |
|--------|-------------|----------|
| Generic: "Noe gikk galt. Prøv igjen." + home link | Simple fallback. | |
| "Kunne ikke laste data. Sjekk nettforbindelsen og prøv igjen." + retry link | More specific to network/API failures. | ✓ |
| You decide | Claude picks. | |

**User's choice:** "Kunne ikke laste data. Sjekk nettforbindelsen og prøv igjen." + retry link

---

## Skipped Area

### Validation failure behavior (SEC-02)

User did not select this area for discussion — deferred to Claude's discretion.

---

## Claude's Discretion

- **SEC-02 validation failure:** Fall back to `DEFAULT_CLUB_ID` silently when `?c=` fails `/^\d+$/`
- **DEBT-01 + DEBT-03 task ordering:** Whether to combine rune migration with Felt grouping extraction per page or separate passes
- **Error page retry link target:** `window.history.back()` vs `href="/"`

## Deferred Ideas

None — discussion stayed within phase scope.
