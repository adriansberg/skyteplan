---
title: App Name and Domain Selection
trigger_condition: Before Phase 5 (Multi-Club Support) planning begins
planted_date: 2026-05-19
---

## What This Is

The app needs a generic name and domain before multi-club work starts. Both affect code (manifest.json, app.html title, README) and infrastructure (Vercel project name, DNS).

## Constraints

- Name must not reference any specific club
- Norwegian or English both acceptable
- Domain needs wildcard subdomain support (`*.domain.no`)
- Should be memorable for shooters at the range

## Candidates to Consider

- `skyteplan.no` — "shooting plan", direct, Norwegian
- `skytterplan.no` — "shooter plan"
- `lsapp.no` — references LS (landsskytterstevne) system
- Something with "mester", "resultat", "bane"

## When to Act

Decide name + register domain before kicking off `/gsd-new-milestone` for v3. The domain name affects the `clubs.ts` subdomain keys and any hardcoded references in app.html/manifest.json.
