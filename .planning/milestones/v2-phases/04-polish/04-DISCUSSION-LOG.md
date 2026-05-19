# Phase 4: Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-19
**Phase:** 4-polish
**Areas discussed:** Skeleton screens, iOS safe area (top), SW plugin implementation

---

## Skeleton Screens

### Visual style

| Option | Description | Selected |
|--------|-------------|----------|
| Pulse bars | animate-pulse + bg-neutral-200 rounded bars matching content shape | ✓ |
| Spinner only | Single centered spinner per route | |
| Shimmer / gradient sweep | CSS shimmer animation — requires custom CSS | |

**User's choice:** Pulse bars
**Notes:** None

### Content shape

| Option | Description | Selected |
|--------|-------------|----------|
| Content-shaped | Date header block + event rows for schedule; shooter name bars for skyttere; shooter blocks for premieliste | ✓ |
| Generic rows | Same-height bars regardless of route | |
| You decide | Leave to implementer | |

**User's choice:** Content-shaped

### Component strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Inline per route | Each route has its own skeleton markup | ✓ |
| Shared component | One SkeletonLoader.svelte with props | |

**User's choice:** Inline per route

### Premieliste loading strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Full skeleton until all data ready | Wait for Promise.all, then render | ✓ |
| Progressive reveal | Stream in shooters as each resolves (out of scope) | |

**User's choice:** Full skeleton until all data ready

---

## iOS Safe Area (top)

### Applying env(safe-area-inset-top)

| Option | Description | Selected |
|--------|-------------|----------|
| Inline style on top bar div | style="padding-top: env(safe-area-inset-top)" | ✓ |
| CSS variable in app.css | Define --safe-area-top in :root | |
| Tailwind pt-safe plugin | Requires adding a Tailwind plugin | |

**User's choice:** Inline style on top bar div

### Sticky date header offset

| Option | Description | Selected |
|--------|-------------|----------|
| CSS variable --top-bar-height | calc(2.5rem + env(safe-area-inset-top)) in :root | ✓ |
| Hardcode top-[84px] | Over-pads on non-iOS; fragile | |
| Accept the overlap on iOS | Leave top-[40px] unchanged | |

**User's choice:** CSS variable --top-bar-height

### theme-color for status bar

| Option | Description | Selected |
|--------|-------------|----------|
| Update to neutral-50 (#fafafa) | Matches top bar background | ✓ |
| Keep #1f2937 (dark) | Contrasts with neutral-50 top bar | |
| You decide | Leave to implementer | |

**User's choice:** Update to neutral-50 (#fafafa)

---

## SW Plugin Implementation

### Template vs in-place

| Option | Description | Selected |
|--------|-------------|----------|
| Template approach: sw.template.js → sw.js | Committed template, generated output, gitignore sw.js | ✓ |
| In-place replacement on sw.js | Modify sw.js directly — makes it dirty on every build | |

**User's choice:** Template approach

### Plugin location

| Option | Description | Selected |
|--------|-------------|----------|
| Inline in vite.config.ts | ~15 lines as plain object with buildStart hook | ✓ |
| Separate vite-plugin-sw-version.ts | Extracted file — overkill for 15 lines | |

**User's choice:** Inline in vite.config.ts

### Dev vs prod cache name

| Option | Description | Selected |
|--------|-------------|----------|
| Fixed stordalen-dev in dev, git hash only in prod | No churn in development | ✓ |
| Git hash always | New cache on every dev restart | |

**User's choice:** Fixed stordalen-dev in dev, git hash in prod

### Gitignore generated sw.js

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, gitignore static/sw.js | Generated file stays out of source control | ✓ |
| No, keep sw.js committed | Error-prone — placeholder value could be committed | |

**User's choice:** Yes, gitignore static/sw.js

---

## Claude's Discretion

None — all decisions made explicitly by user.

## Deferred Ideas

None — discussion stayed within phase scope.
