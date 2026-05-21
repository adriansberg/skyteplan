---
status: complete
quick_id: 260521-vy5
completed: 2026-05-21
---

# Summary: Rename Skytterappen → Skytterinfo

## Changes (10 files)

- `static/manifest.json` — name, short_name updated
- `src/app.html` — apple-mobile-web-app-title content updated
- `vite.config.ts` — cache prefix literals: `skytterinfo-dev`, `skytterinfo-` + hash
- `src/lib/components/Splash.svelte` — sessionStorage key (x2) + alt text
- `src/routes/+page.svelte` — title updated
- `src/routes/skyttere/+page.svelte` — title updated
- `src/routes/premieliste/+page.svelte` — title updated
- `src/routes/+layout.svelte` — header img alt updated
- `src/routes/+error.svelte` — img alt + span text updated
- `README.md` — all occurrences (both cases) replaced

## Verification

- `grep -rn "Skytterappen" src/ static/manifest.json README.md` → zero matches (PASS)
- `npx svelte-check` → 0 errors (1 pre-existing warning in premieliste, unrelated)
- `yarn build` → `static/sw.js` carries `skytterinfo-<hash>` cache prefix (gitignored, not committed)

## Notes

Asset filenames (`stordalen.jpg`, `stordalenLogo`) unchanged — Phase 6 scope.
