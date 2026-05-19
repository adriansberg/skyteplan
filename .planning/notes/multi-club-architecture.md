---
title: Multi-Club Architecture Decisions
date: 2026-05-19
context: explore session — project rename / multi-club generalization
---

## Decisions

**Routing mechanism:** Wildcard subdomain (`*.domain.no`) → Vercel → SvelteKit server loaders read `request.headers.get('host')`, extract subdomain prefix, look up club config.

**Club config:** Static TypeScript file `src/lib/clubs.ts`. Map shape:
```ts
type ClubConfig = {
  clubId: string
  name: string
  logoPath: string  // path under /static/, or external URL
}

const clubs: Record<string, ClubConfig> = {
  stordalen: { clubId: '10782', name: 'Stordalen Skytterlag', logoPath: '/logos/stordalen.svg' },
  // kongsberg: { clubId: '99999', name: 'Kongsberg Skytterlag', logoPath: '/logos/kongsberg.svg' },
}
```

**Adding a club:** Edit `clubs.ts` + add logo file + deploy. No env var changes, no infra.

**Unknown subdomain:** Norwegian 404/landing page — "Ingen klubb funnet for denne adressen."

**`?c=` param:** Retire in favor of subdomain-only routing. Removes ambiguity, simplifies loaders.

**Top bar:** Club logo replaces current logo placeholder. Club name as alt text / fallback text.

## Open Questions

- What is the app name and domain? (see seed: app-name-domain)
- Does direct access at root domain (`domain.no` with no subdomain) show a landing page or redirect to a default club?
- Should `logoPath` support external URLs (hosted by the club) or only bundled static assets?
