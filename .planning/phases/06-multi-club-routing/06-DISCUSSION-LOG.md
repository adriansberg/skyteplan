# Phase 6: Multi-Club Routing - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-21
**Phase:** 6-multi-club-routing
**Areas discussed:** Dev environment fallback, Club logo storage, Unknown subdomain page, Stordalen as initial club

---

## Dev Environment Fallback

| Option | Description | Selected |
|--------|-------------|----------|
| Hardcode Stordalen as dev default | When host is localhost, fall back to Stordalen config silently | |
| Read from env var VITE_DEV_CLUB | Set VITE_DEV_CLUB=stordalen in .env.local | ✓ |
| Keep ?c= param for dev only | localhost still accepts ?c= as override | |

**User's choice:** `VITE_DEV_CLUB` env var in `.env.local`
**Notes:** If `VITE_DEV_CLUB` is not set, throw a clear error — no silent fallback. Developers must explicitly configure which club to test.

---

## Club Logo Storage

| Option | Description | Selected |
|--------|-------------|----------|
| static/clubs/{slug}.jpg | Public static files, logoPath is '/clubs/stordalen.jpg' | ✓ |
| src/lib/assets/{slug}.jpg | Current pattern, requires import per club | |
| External URL | Club-provided logo URLs | |

**User's choice:** `static/clubs/{slug}.jpg`
**Notes:** Existing `src/lib/assets/stordalen.jpg` moves to `static/clubs/stordalen.jpg`.

---

## Unknown Subdomain Page

| Option | Description | Selected |
|--------|-------------|----------|
| SvelteKit error() in +layout.server.ts | Throws error(404, message), renders existing +error.svelte | ✓ |
| Dedicated +error route for unknown clubs | New page with more control over copy | |
| Redirect to landing page | Unknown subdomains redirect to info page | |

**User's choice:** `error(404, ...)` in `+layout.server.ts` — reuse existing `+error.svelte`

**Norwegian copy follow-up:**

| Option | Description | Selected |
|--------|-------------|----------|
| "Ukjent skytterklubb" | Technical, explains what went wrong | |
| "Siden finnes ikke" | Generic 404 copy | ✓ |
| You decide | Claude picks Norwegian copy | |

**User's choice:** "Siden finnes ikke"

---

## Stordalen as Initial clubs.ts Entry

**Subdomain key:**

| Option | Description | Selected |
|--------|-------------|----------|
| stordalen | Clean, obvious | ✓ |
| stordalen-skytterlag | More explicit, longer subdomain | |
| You decide | Claude picks by convention | |

**User's choice:** `stordalen`

**Display name:**

| Option | Description | Selected |
|--------|-------------|----------|
| Stordalen Skytterlag | Official full name | |
| Stordalen | Short form for mobile | |
| You decide | Claude decides based on UX | ✓ |

**Claude's decision:** "Stordalen Skytterlag" — official name, used for alt text and text rendering. Top bar shows logo image primarily.

---

## Claude's Discretion

- Stordalen display name: "Stordalen Skytterlag"
- Whether club resolution is centralized in `hooks.server.ts` (locals) or per-loader — planner/researcher decides idiomatic SvelteKit approach
- TypeScript type shape for clubs map

## Deferred Ideas

None — discussion stayed within phase scope.
