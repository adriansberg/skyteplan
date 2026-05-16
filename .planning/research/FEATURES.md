# Feature Landscape: Mobile PWA UX Patterns

**Domain:** Mobile-first data-display PWA — shooting sports schedule, results, prize list
**Researched:** 2026-05-17
**Overall confidence:** HIGH (patterns well-established; sources: UX Planet, Lollypop Design, Industrial UX, DEV.to)

---

## Overview

This app is used **at the range, outdoors, one-handed, in a hurry**. The primary job: answer "when is my next event?" and "what did I shoot?" in under 3 seconds without squinting. The current app works but reads like a website — small tap targets, dense text, header nav that wastes thumb reach.

The right model is not a generic PWA. It's closer to a **transit/sports score app**: data-first, opinionated hierarchy, no chrome. The redesign should feel like the user installed a native app.

---

## Table Stakes

Features users expect. Missing = product feels broken or unfinished.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Bottom tab navigation (3 tabs) | Thumbs live at the bottom of the phone; top nav forces awkward reach | Low | Tabs: Skyteplan / Skyttere / Premieliste. Replace current top nav link row. |
| Safe-area padding on bottom nav | iOS notch / home indicator overlap is immediately visible and jarring | Low | `viewport-fit=cover` + `env(safe-area-inset-bottom)` on nav container. Already have `apple-mobile-web-app-capable` meta — just needs CSS. |
| Today-section auto-scroll on open | Users open the schedule to find today; scrolling from top is friction | Low | Already implemented (`scrollIntoView`). Must survive redesign — keep and refine. |
| "Today" visual anchor | Users need to orient instantly — which date section is now | Low | Highlighted section header (accent color or "Today" label, not just the date). |
| Large touch targets (min 44×44 px) | Fat-finger misses on small items erode trust fast | Low | All interactive elements: min `h-11` (44 px) in Tailwind. Spacing between targets: min 8 px, prefer 12 px. |
| Status badges clearly readable outdoors | "Completed / Ongoing / Upcoming" must parse in 1 glance | Low | Bold pill badges, high-contrast fill colors, no gradients. See Outdoor section. |
| Pull-to-refresh with visual feedback | Users at the range expect live data; they need to know a refresh happened | Low | Already implemented. Must show clear start + end state. Add a subtle "Last updated X min ago" if feasible. |
| Skeleton loading screens | Schedule and results load from network; staring at blank white is disorienting | Medium | Replace current loading state with per-row skeleton placeholders matching card layout. Spinner acceptable only for manual refresh action. |
| Error state that doesn't feel broken | Connectivity at outdoor ranges is spotty; graceful degradation is expected | Low | Already partially done (Norwegian error box). Show last-cached data with staleness label instead of blocking on error. |
| Readable at a glance — visual hierarchy | Results and schedules are data-dense; users must scan, not read | Medium | Two type sizes max per card: primary (shooter name / event name) large + bold, secondary (time, score) smaller. No more than 3 pieces of info per row without a separator. |

---

## Differentiators

Not expected, but lift the experience meaningfully.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| "Your next event" highlight | Shooter sees their own next event instantly, no searching | High | Requires knowing the shooter — no auth exists. Could be a stored local name filter: "My name contains…" saved to localStorage. Nice-to-have, skip for MVP. |
| Sticky date headers while scrolling | Users scrolling through multi-day schedule always know what day they're in | Low | CSS `position: sticky` on date group headers. Native apps (Google Calendar, Strava) all do this. Trivial to add. |
| Ongoing event pulsing indicator | Live "something is happening now" cue without polling | Low | CSS `animate-pulse` on ongoing badge. No backend change needed — status is computed from `getEventStatus()`. |
| Haptic feedback on pull-to-refresh | Feels native on iOS/Android; confirms gesture recognized | Low | `navigator.vibrate(10)` at gesture threshold. PWA APIs support this. |
| Outdoor-optimized color mode | Range use in bright sunlight is the primary context | Medium | High-contrast palette by default — not a toggle. Design the base theme for outdoor readability rather than adding a "sun mode". |
| Compact vs comfortable density toggle | Some users want more data per screen; others want breathing room | High | Skip for MVP. Default to comfortable (large targets). |

---

## Anti-Features

Features to explicitly avoid.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Hamburger / sidebar navigation | Hides navigation behind a tap — users must discover it every time; wrong for 3-section apps | Bottom tab bar — always visible |
| Top header navigation links | Puts navigation in thumb-dead zone at top of screen | Move all primary nav to bottom |
| Decorative illustrations or hero images | Wastes screen real estate; adds no value for data-display app at the range | Zero decorative chrome; data only |
| Dark mode as primary design goal | Dark-on-light is actually better for outdoor sunlight readability (higher contrast under glare) | Light base theme optimized for outdoors; skip dark mode unless explicitly requested |
| Gradients, shadows, fades on data rows | Drop shadows and fades disappear in sunlight — wasted effort and they blur distinct boundaries | Flat design with sharp color boundaries and solid fills |
| Complex animated transitions between tabs | Animation between Schedule → Shooters adds latency and no value | Instant tab switch; animate only micro-interactions (badge pulse, refresh spinner) |
| Accordion collapse on schedule rows | Collapsing requires extra tap to see detail; at the range users want all data visible | Show event detail inline; use whitespace to group, not collapse |
| Infinite scroll / pagination | Shooter lists and prize lists are small (club-sized, ~10-50 shooters); pagination adds friction | Render full list; let OS scroll handle it |
| Toast notifications for routine events | Refreshes and normal loads should be silent | Reserve toasts/banners for actual errors only |
| Custom pull-to-refresh spinners that fight browser | Browser-native scroll behavior on iOS is tuned; fighting it causes jank | Keep PullToRefresh gesture threshold conservative; let browser handle momentum |

---

## Design Patterns

### Outdoor Readability (HIGH confidence)

The primary use context is bright outdoor lighting. Sunlight raises the perceived black level of any LCD, compressing contrast. Design for this explicitly:

- **Use light backgrounds, not dark.** Dark-on-light outperforms light-on-dark in sunlight because ambient reflections raise black levels. A white card on off-white background loses less contrast than white text on a dark card.
- **Eliminate gradients on data elements.** Gradients and drop shadows vanish in glare. Use solid fills with sharp edges for cards and badges.
- **Avoid blue-heavy palettes.** Blues lose luminance outdoors. Prefer high-luminance accent colors: amber, green, or high-contrast neutrals.
- **Bold typography, large sizes.** `font-bold` or `font-semibold` at `text-base` (16 px) minimum for body data. Primary labels (`text-lg` or larger). Thin fonts fail in sunlight.
- **High contrast ratio ≥ 4.5:1 for all data text** (WCAG AA). In practice, shoot for 7:1 given sunlight degradation.
- **Status badge fills over outlines.** Outlined badges with colored text lose legibility in glare. Solid-fill badges with white or near-white text stay readable.

### Bottom Navigation (HIGH confidence)

3-tab apps are the canonical case for bottom navigation:

- 3 tabs maximum — Skyteplan, Skyttere, Premieliste.
- Icon + label for each tab (icon-only risks ambiguity, especially in a language minority context with Norwegian labels).
- Active tab: filled icon + accent color label. Inactive: outlined icon + muted label.
- Tab bar height: min 56 px content area + `env(safe-area-inset-bottom)` padding.
- No scroll behind the tab bar — main content area must end above the nav (`pb-[56px + safe-area]`).
- Implementation: `position: fixed; bottom: 0; left: 0; right: 0` with `padding-bottom: env(safe-area-inset-bottom)`.

### Schedule Card Layout (MEDIUM confidence)

Sports schedule apps (comparable: transit apps, race result apps) converge on:

- **Date section header** — sticky, bold date label, contrasting background. "Today" label replaces date when section is current day.
- **Event row** — one row per event. Left: time (bold, fixed-width column). Center: event name. Right: status badge.
- **Felt sub-events** — indent sub-events under parent or use a subtle left border. Do not collapse.
- **Score row** — show total score directly on the row when available. No tap-to-reveal for primary data.
- Relay/target info: secondary text below the event name, `text-sm text-muted`.

### Status Badge Convention (HIGH confidence)

Consistent badge semantics across all three views:

| Status | Color (light theme) | Label (Norwegian) |
|--------|--------------------|--------------------|
| Ongoing | Green fill, white text | Pågår |
| Completed | Blue/slate fill, white text | Ferdig |
| Upcoming | Amber fill, dark text | Kommende |
| Did not start | Gray fill, dark text | Møtte ikke |

Use `animate-pulse` ring or badge background pulse for `ongoing` only. All others static.

### Loading States (HIGH confidence)

- **Initial page load:** Skeleton screen matching card layout — gray placeholder bars at same height/width as real content rows.
- **Manual refresh (button click):** Spinner icon in RefreshButton replaces the static icon. Full-page skeleton is too heavy for a known-short refresh.
- **Pull-to-refresh:** Progress indicator at top + brief spinner. Existing PullToRefresh component covers this.
- **Error state:** Show last successful data (from service worker cache) with a banner: "Viser lagrede data — X min siden". Only show full error when no cache exists.

### Touch Target Sizing (HIGH confidence)

- Minimum 44×44 px for all interactive elements (Apple HIG, Material Design, WCAG 2.2).
- Prefer 48 px height for list rows that are themselves tappable.
- Spacing between adjacent tap targets: 8 px minimum, 12 px preferred.
- In Tailwind: `h-11` = 44 px, `h-12` = 48 px, `py-3` = 12 px padding.
- RefreshButton and tab items must meet this threshold.

### iOS PWA Polish (HIGH confidence)

Already in project: `apple-mobile-web-app-capable`, splash screens. Missing:

- `viewport-fit=cover` in viewport meta.
- `apple-mobile-web-app-status-bar-style: black-translucent` for edge-to-edge feel.
- Bottom nav `padding-bottom: env(safe-area-inset-bottom)` to avoid home indicator overlap.
- These are 3 lines of code; high impact on perceived quality.

---

## Component Conventions

Conventions to apply consistently across all three views.

### Typography Scale

| Use | Tailwind classes | Notes |
|-----|-----------------|-------|
| Date section header | `text-sm font-semibold uppercase tracking-wide text-muted-foreground` | Sticky header |
| "Today" label | `text-sm font-bold uppercase text-accent` | Replaces date in current section |
| Event name | `text-base font-semibold` | Primary data — always readable |
| Time / score | `text-base font-mono` | Monospace keeps columns aligned |
| Secondary info (relay, target) | `text-sm text-muted-foreground` | Beneath primary row |
| Badge label | `text-xs font-bold uppercase` | Inside solid-fill pill |

### Card / Row Structure

```
┌─────────────────────────────────────────┐
│  [TIME]   [Event Name]       [BADGE]    │
│           [Relay · Target]             │
└─────────────────────────────────────────┘
```

- Padding: `px-4 py-3` per row.
- Dividers: `border-b border-neutral-100` between rows (light, not heavy).
- Cards for grouped content (Felt sub-events): `rounded-lg bg-neutral-50 mx-4 my-2 divide-y`.
- No card shadow (fails outdoors). Subtle background difference handles grouping.

### Color Palette Principles

- Base: white (`#fff`) background, `neutral-900` text.
- Muted: `neutral-500` for secondary text.
- Accent: pick one brand color. Club has no strict brand — recommend `emerald-600` (green: high luminance outdoors, sports-appropriate).
- Surface: `neutral-50` for card backgrounds (barely-off-white — readable outdoors).
- Borders: `neutral-200` — visible but not heavy.
- Avoid: `blue-*` as primary accent (low luminance outdoors). Avoid `gray-400` text on white (low contrast in sun).

### Spacing Rhythm

- Section gaps: `mt-6` between date groups.
- Row gaps: no gap — dividers handle separation.
- Screen edge padding: `px-4` consistently.
- Bottom content padding: must account for fixed tab bar. Use `pb-20` or utility wrapping `env(safe-area-inset-bottom)`.

---

## MVP Priority

**Build first (phase 1 of redesign):**
1. Bottom tab navigation with safe-area handling (replaces top nav)
2. Outdoor-optimized color palette and typography scale (bold, high-contrast, no gradients)
3. Status badges — solid fill, consistent across all three views
4. Today section highlight + sticky date headers (schedule view)
5. Touch target sizing on all interactive elements

**Build second (phase 2):**
6. Skeleton loading screens
7. Ongoing event pulse animation
8. Error state with cached-data fallback display
9. iOS PWA polish (`viewport-fit=cover`, status bar style)

**Defer:**
- "My name" local filter — requires UX design beyond visual redesign
- Density toggle — over-engineering for club-sized dataset
- Haptic feedback — low priority, easy to add later

---

## Sources

- PWA UX patterns: [Lollypop Design — PWA UX Tips 2025](https://lollypop.design/blog/2025/september/progressive-web-app-ux-tips-2025/)
- Outdoor readability: [Industrial UX: Sunlight Susceptible Screens](https://medium.com/@callumjcoe/industrial-ux-sunlight-susceptible-screens-2e52b1d9706b)
- Bottom nav best practices: [UX Planet — Bottom Tab Bar Design](https://uxplanet.org/bottom-tab-bar-design-best-practices-ef3ee71de0fc)
- Touch target sizing: [Smart Interface Design Patterns — Accessible Tap Target Sizes](https://smart-interface-design-patterns.com/articles/accessible-tap-target-sizes/)
- iOS PWA polish: [DEV.to — Make Your PWAs Look Handsome on iOS](https://dev.to/karmasakshi/make-your-pwas-look-handsome-on-ios-1o08)
- Safe area insets: [DEV.to — Avoid notches in your PWA with just CSS](https://dev.to/marionauta/avoid-notches-in-your-pwa-with-just-css-al7)
- Skeleton vs spinner: [Onething Design — Skeleton Screens vs Loading Spinners](https://www.onething.design/post/skeleton-screens-vs-loading-spinners)
- Sports app UI patterns: [Togwe — Winning Sports App UI Design Tips](https://www.togwe.com/blog/sports-app-ui-design/)
