# Phase 3: UX Redesign - Pattern Map

**Mapped:** 2026-05-18
**Files analyzed:** 6
**Analogs found:** 5 / 6 (BottomTabBar is new — no analog; patterns drawn from layout)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/routes/+layout.svelte` | layout | request-response | self (current version) | self-edit |
| `src/routes/+page.svelte` | route page | request-response | self (current version) | self-edit |
| `src/routes/skyttere/+page.svelte` | route page | request-response | `src/routes/+page.svelte` | role-match |
| `src/routes/premieliste/+page.svelte` | route page | request-response | `src/routes/+page.svelte` | role-match |
| `src/lib/components/EventStatusBadge.svelte` | component | request-response | self (current version) | self-edit |
| `src/lib/components/BottomTabBar.svelte` | component (NEW) | request-response | `src/routes/+layout.svelte` lines 13-15, 36-62 | partial (active-route + nav pattern) |

---

## Pattern Assignments

### `src/routes/+layout.svelte` (layout — slim top bar + BottomTabBar mount)

**Self-edit.** Current file is the analog.

**Svelte 5 runes + active-route detection** (lines 10-15):
```svelte
let { children } = $props();

const isSchedulePage = $derived(page.url.pathname === '/');
const isShootersPage = $derived(page.url.pathname === '/skyttere');
const isPremielistePage = $derived(page.url.pathname === '/premieliste');
```

**Current header to replace** (lines 27-64):
```svelte
<header class="sticky top-0 z-40 border-b border-gray-200 bg-white">
  <div class="container mx-auto flex items-center justify-between px-2 py-2 sm:px-4 sm:py-3">
    <a href="/" class="flex items-center space-x-2 transition-opacity hover:opacity-80">
      <img src={stordalenLogo} alt="Stordalen Skytterlag" class="h-8 w-auto sm:h-10" />
      <span class="hidden text-lg font-semibold text-gray-900 sm:inline">
        Stordalen Skytterlag
      </span>
    </a>
    <nav class="flex items-center space-x-2 sm:space-x-4">
      <RefreshButton />
      <a href="/" class="...{isSchedulePage ? 'bg-blue-100 text-blue-800 ...' : '...'}">
        📅 Skyteplan
      </a>
      ...
    </nav>
  </div>
</header>
```

**Target header** (from UI-SPEC.md):
```svelte
<header class="sticky top-0 z-40 h-10 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between px-4">
  <a href="/"><img src={stordalenLogo} alt="Stordalen Skytterlag" class="h-8 w-auto" /></a>
  <RefreshButton />
</header>
```

**Page content wrapper — add pb-16** (line 66):
```svelte
<!-- Before: -->
{@render children?.()}

<!-- After: wrap children in a div with pb-16 -->
<div class="pb-16">
  {@render children?.()}
</div>
```

**Mount BottomTabBar after PullToRefresh** (lines 68-72):
```svelte
<PullToRefresh />
<BottomTabBar />
<InstallPrompt />
```
BottomTabBar import added to script block alongside existing component imports.

---

### `src/lib/components/BottomTabBar.svelte` (NEW component)

**No direct analog.** Active-route pattern drawn from `+layout.svelte` lines 4, 13-15.

**Script block — Svelte 5 runes, page import, derived active state:**
```svelte
<script lang="ts">
  import { page } from '$app/state';

  const isSchedulePage = $derived(page.url.pathname === '/');
  const isShootersPage = $derived(page.url.pathname === '/skyttere');
  const isPremielistePage = $derived(page.url.pathname === '/premieliste');
</script>
```
No `$props()` needed — component takes no props.

**Nav shell** (from UI-SPEC.md — `env()` must be inline style, not Tailwind):
```svelte
<nav
  class="fixed bottom-0 left-0 right-0 z-50 flex h-14 border-t border-neutral-200 bg-neutral-50"
  style="padding-bottom: env(safe-area-inset-bottom)"
>
  <!-- tabs here -->
</nav>
```

**Tab anatomy — active vs inactive class pattern** (from UI-SPEC.md D-06):
```svelte
<a
  href="/"
  class="flex-1 flex flex-col items-center justify-center border-t-2 text-xs font-medium
    {isSchedulePage
      ? 'border-emerald-600 text-emerald-600'
      : 'border-transparent text-neutral-500'}"
>
  Skyteplan
</a>
```
Same ternary pattern repeated for `/skyttere` (isShootersPage) and `/premieliste` (isPremielistePage).

**Tab labels (no emojis, Norwegian):** "Skyteplan", "Skyttere", "Premieliste"

---

### `src/routes/+page.svelte` (schedule — sticky headers, shadow removal, scroll-mt)

**Self-edit.** Key surgical changes:

**Date section card — remove shadow + gradient, make header sticky** (lines 105-119):
```svelte
<!-- BEFORE (lines 107-108): -->
<div
  use:registerTodaySection={isToday}
  class="scroll-mt-14 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md sm:scroll-mt-20 sm:rounded-xl sm:shadow-lg"
>
  <!-- Date Header (lines 110-118): -->
  <div class="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-3 sm:px-6 sm:py-4">
    <h2 class="text-lg font-semibold text-gray-900 sm:text-xl">

<!-- AFTER: outer div loses shadow, becomes non-overflow, header becomes sticky -->
<div
  use:registerTodaySection={isToday}
  class="scroll-mt-10"
>
  <div class="sticky top-10 z-30 bg-neutral-50 border-b border-neutral-200 px-3 py-3 sm:px-6 sm:py-4">
    <h2 class="text-xl font-bold text-neutral-900">
```

**scroll-mt change:** `scroll-mt-14 sm:scroll-mt-20` → `scroll-mt-10` (matches `h-10` top bar)

**Outer container — add pb-16** (line 94):
```svelte
<!-- BEFORE: -->
<div class="container mx-auto px-2 py-4 pt-6 sm:px-4 sm:py-6 sm:pt-8">

<!-- AFTER: pb-16 added (or can rely on layout wrapper — check which approach planner chooses) -->
<div class="container mx-auto px-2 py-4 pt-6 pb-16 sm:px-4 sm:py-6 sm:pt-8">
```

**Typography on event name** (line 138): `text-sm font-semibold` → `text-base font-semibold`

**Monospace on time** (line 170): add `font-mono` to `<span>{formatNorwegianTime(...)}</span>`

**Monospace on score** (line 174): add `font-mono` to score `<div>`

---

### `src/routes/skyttere/+page.svelte` (shooter list — shadows, gradient, typography, copy)

**Self-edit.** Analogs: `+page.svelte` for shadow/gradient removal pattern.

**Shooter card — remove shadow + gradient** (lines 64-69):
```svelte
<!-- BEFORE (line 64-65): -->
<details
  class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md sm:rounded-xl sm:shadow-lg [&_summary::-webkit-details-marker]:hidden [&_summary::marker]:hidden"
>
  <summary
    class="cursor-pointer border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-3 transition-colors hover:from-blue-100 hover:to-indigo-100 sm:px-6 sm:py-4"
  >

<!-- AFTER: remove shadow-md sm:shadow-lg; replace gradient with neutral -->
<details
  class="overflow-hidden rounded-lg border border-gray-200 bg-white [&_summary::-webkit-details-marker]:hidden [&_summary::marker]:hidden"
>
  <summary
    class="cursor-pointer border-b border-neutral-200 bg-neutral-100 px-3 py-3 sm:px-6 sm:py-4"
  >
```

**Shooter name typography** (line 75): `text-lg font-semibold` → `text-xl font-bold` for heading role; body data text gets `text-base font-semibold`

**Error copy** (line 26): `"Error loading data:"` → `"Feil ved lasting av data:"` (line 26)
**Error copy** (line 27): `"Error: {error}"` → `"Feil: {error}"`
**Loading copy** (line 22): `"Loading shooters data..."` → `"Laster inn skyttere..."`
**Empty events copy** (line 360): `"No events scheduled"` → `"Ingen skytinger planlagt"`
**Desktop empty results** (line 349): `"No results yet"` → `"Ingen resultater enda"`

**Outer container — add pb-16** (line 30):
```svelte
<div class="container mx-auto px-2 py-4 pt-6 pb-16 sm:px-4 sm:py-6 sm:pt-8">
```

**Monospace on times** (line 175): add `font-mono` to time `<span>`
**Monospace on scores** (line 187): add `font-mono` to score `<div>`

---

### `src/routes/premieliste/+page.svelte` (prize list — shadow removal, typography)

**Self-edit.**

**Shooter card — remove shadow-sm** (line 110):
```svelte
<!-- BEFORE: -->
<div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">

<!-- AFTER: -->
<div class="rounded-lg border border-gray-200 bg-white p-4">
```

**Shooter name typography** (line 114): `text-lg font-semibold` → `text-base font-semibold` (data role)

**Outer container — add pb-16** (line 89):
```svelte
<div class="container mx-auto px-2 py-4 pt-6 pb-16 sm:px-4 sm:py-6 sm:pt-8">
```

**Remove emojis** from prize summary section headers (lines 155, 183, 211): `🎁`, `🏆`, `🥇` — replace with plain text or remove the `<span>` entirely, per D-03 (no emojis).

---

### `src/lib/components/EventStatusBadge.svelte` (badge — solid fill, Norwegian labels)

**Self-edit.** Current file uses Svelte 5 runes — keep `$props()` + `$derived()` structure.

**Current badge structure** (lines 1-39):
```svelte
<script lang="ts">
  import type { Event, Shooter } from '$lib/graphql/types';
  import { getEventStatus } from '$lib/utils/helpers';

  interface Props {
    event: Event & { shooter: Shooter };
    class?: string;
  }

  let { event, class: className = '' }: Props = $props();
  const status = $derived(getEventStatus(event));
</script>

{#if status === 'completed'}
  <span class="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 {className}">
    ✓
  </span>
{:else if status === 'ongoing'}
  <span class="inline-flex animate-pulse items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 {className}">
    🎯
  </span>
...
```

**Target badge structure** — keep Props interface and $derived, replace only the template:
```svelte
{#if status === 'completed'}
  <span class="inline-flex items-center rounded-full bg-slate-600 px-2 py-1 text-xs font-medium text-white {className}">
    Ferdig
  </span>
{:else if status === 'ongoing'}
  <span class="inline-flex animate-pulse items-center rounded-full bg-emerald-600 px-2 py-1 text-xs font-medium text-white {className}">
    Pågår
  </span>
{:else if status === 'did_not_start'}
  <span class="inline-flex items-center rounded-full bg-gray-400 px-2 py-1 text-xs font-medium text-white {className}">
    Møtte ikke
  </span>
{:else}
  <span class="inline-flex items-center rounded-full bg-amber-500 px-2 py-1 text-xs font-medium text-white {className}">
    Kommende
  </span>
{/if}
```
`else` covers `upcoming`. Script block unchanged.

---

## Shared Patterns

### Active-route detection
**Source:** `src/routes/+layout.svelte` lines 4, 13-15
**Apply to:** `BottomTabBar.svelte`
```svelte
import { page } from '$app/state';
const isSchedulePage = $derived(page.url.pathname === '/');
const isShootersPage = $derived(page.url.pathname === '/skyttere');
const isPremielistePage = $derived(page.url.pathname === '/premieliste');
```

### Svelte 5 runes component structure
**Source:** `src/lib/components/EventStatusBadge.svelte` lines 1-12
**Apply to:** `BottomTabBar.svelte` (new component must use runes, not Svelte 4 syntax)
```svelte
<script lang="ts">
  // $props() for props (none needed in BottomTabBar)
  // $derived() for computed values
  // No export let, no $: reactive statements
</script>
```

### `env(safe-area-inset-bottom)` as inline style
**Source:** CONTEXT.md / UI-SPEC.md (not yet in codebase — this is new)
**Apply to:** `BottomTabBar.svelte`
```svelte
style="padding-bottom: env(safe-area-inset-bottom)"
```
Cannot be expressed as a Tailwind utility class. Must be inline `style=` attribute.

### Neutral color palette replacement
**Apply to:** all 4 modified route/layout files
- `bg-white` top-bar/tab-bar backgrounds → `bg-neutral-50`
- `border-gray-200` → `border-neutral-200`
- `bg-gradient-to-r from-blue-50 to-indigo-50` headers → `bg-neutral-100`
- Shadow classes (`shadow-sm`, `shadow-md`, `shadow-lg`) → remove entirely

### pb-16 bottom padding
**Apply to:** `+layout.svelte` children wrapper OR each page's outermost container
**Decision for planner:** Apply at layout level (one change) rather than per-page. The layout wraps `{@render children?.()}` — wrap in `<div class="pb-16">`. Per-page containers then do not need individual pb-16.

### `<style>` block preservation
**Source:** `src/routes/skyttere/+page.svelte` lines 370-394
**Apply to:** skyttere page edit — preserve the `<style>` block for `details[open] summary .arrow` rotation and marker hiding. Do not remove it.

---

## No Analog Found

| File | Role | Reason |
|------|------|--------|
| `src/lib/components/BottomTabBar.svelte` | component | No bottom nav component exists yet. Active-route detection and nav `<a>` patterns drawn from `+layout.svelte`; `env()` inline style is net-new. |

---

## Metadata

**Analog search scope:** `src/routes/`, `src/lib/components/`
**Files scanned:** 6 source files read in full
**Pattern extraction date:** 2026-05-18
