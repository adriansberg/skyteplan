# Phase 5: Generic Branding - Pattern Map

**Mapped:** 2026-05-19
**Files analyzed:** 10
**Analogs found:** 10 / 10

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `static/manifest.json` | config | static | self (current state) | exact |
| `src/app.html` | config | static | self (current state) | exact |
| `src/routes/+page.svelte` | route | request-response | `src/routes/skyttere/+page.svelte` | exact |
| `src/routes/skyttere/+page.svelte` | route | request-response | `src/routes/premieliste/+page.svelte` | exact |
| `src/routes/premieliste/+page.svelte` | route | request-response | `src/routes/+page.svelte` | exact |
| `src/routes/+layout.svelte` | layout | request-response | `src/routes/+error.svelte` | role-match |
| `src/routes/+error.svelte` | layout | request-response | `src/routes/+layout.svelte` | role-match |
| `src/lib/components/Splash.svelte` | component | event-driven | self (current state) | exact |
| `vite.config.ts` | config | static | self (current state) | exact |
| `README.md` | docs | — | none | no-analog |

## Pattern Assignments

### `static/manifest.json` (config, static)

**Analog:** self — read directly

**Current state** (lines 1–5):
```json
{
	"name": "Stordalen Skytterlag",
	"short_name": "Stordalen",
	"description": "Skyteprogram og skyttere for Stordalen Skytterlag",
```

**Target state** — replace three string values, leave all other fields unchanged:
```json
{
	"name": "Skytterappen",
	"short_name": "Skytterappen",
	"description": "Skyteprogram og resultater for skytterlaget",
```

Note: `icons[].src` paths (`/stordalen.jpg`) are asset filenames — do NOT change (Phase 6 concern per RESEARCH.md).

---

### `src/app.html` (config, static)

**Analog:** self — read directly

**Current state** (line 17):
```html
<meta name="apple-mobile-web-app-title" content="Stordalen" />
```

**Target state** — replace content attribute value only:
```html
<meta name="apple-mobile-web-app-title" content="Skytterappen" />
```

All other lines unchanged. Asset hrefs (`stordalen.jpg`) are NOT changed.

---

### `src/routes/+page.svelte` (route, request-response)

**Analog:** self — read directly

**Current state** (line 83):
```svelte
<svelte:head>
	<title>Skyteplan - Stordalen Skytterlag</title>
</svelte:head>
```

**Target state** — replace title string only:
```svelte
<svelte:head>
	<title>Skyteplan - Skytterappen</title>
</svelte:head>
```

Pattern: Each route owns its own `<svelte:head><title>` — no shared constant. Format is `<Page name> - <App name>`.

---

### `src/routes/skyttere/+page.svelte` (route, request-response)

**Analog:** self — read directly

**Current state** (line 19):
```svelte
<svelte:head>
	<title>Skyttere - Stordalen Skytterlag</title>
</svelte:head>
```

**Target state**:
```svelte
<svelte:head>
	<title>Skyttere - Skytterappen</title>
</svelte:head>
```

---

### `src/routes/premieliste/+page.svelte` (route, request-response)

**Analog:** self — read directly

**Current state** (lines 85–88):
```svelte
<svelte:head>
	<title>Premieliste - Stordalen Skytterlag</title>
	<meta name="description" content="Skyttere som har oppnådd premier" />
</svelte:head>
```

**Target state** — title only; meta description unchanged:
```svelte
<svelte:head>
	<title>Premieliste - Skytterappen</title>
	<meta name="description" content="Skyttere som har oppnådd premier" />
</svelte:head>
```

---

### `src/routes/+layout.svelte` (layout, request-response)

**Analog:** self — read directly

**Current state** (line 26):
```svelte
<a href="/"><img src={stordalenLogo} alt="Stordalen Skytterlag" class="h-8 w-auto" /></a>
```

**Target state** — `alt` attribute only:
```svelte
<a href="/"><img src={stordalenLogo} alt="Skytterappen" class="h-8 w-auto" /></a>
```

The `import stordalenLogo from '$lib/assets/stordalen.jpg'` line is NOT changed (asset rename deferred to Phase 6 per RESEARCH.md).

---

### `src/routes/+error.svelte` (layout, request-response)

**Analog:** self — read directly

**Current state** (lines 9–10):
```svelte
<img src={stordalenLogo} alt="Stordalen Skytterlag" class="h-8 w-auto sm:h-10" />
<span class="hidden text-lg font-semibold text-gray-900 sm:inline">Stordalen Skytterlag</span>
```

**Target state** — both `alt` and visible text span:
```svelte
<img src={stordalenLogo} alt="Skytterappen" class="h-8 w-auto sm:h-10" />
<span class="hidden text-lg font-semibold text-gray-900 sm:inline">Skytterappen</span>
```

The `import stordalenLogo from '$lib/assets/stordalen.jpg'` line is NOT changed.

---

### `src/lib/components/Splash.svelte` (component, event-driven)

**Analog:** self — read directly

**Current state** — two changes required:

`alt` attribute (line 33):
```svelte
<img
	src={stordalenLogo}
	alt="Stordalen Skytterlag"
	class="animate-fade-in h-auto w-64 max-w-sm"
/>
```

sessionStorage key (lines 10, 15):
```typescript
const hasSeenSplash = sessionStorage.getItem('stordalen-splash-shown');
// ...
sessionStorage.setItem('stordalen-splash-shown', 'true');
```

**Target state:**
```svelte
<img
	src={stordalenLogo}
	alt="Skytterappen"
	class="animate-fade-in h-auto w-64 max-w-sm"
/>
```

```typescript
const hasSeenSplash = sessionStorage.getItem('skytterappen-splash-shown');
// ...
sessionStorage.setItem('skytterappen-splash-shown', 'true');
```

Note: Renaming the sessionStorage key causes existing browser sessions to lose the "seen splash" flag — users see splash once more on next visit. Acceptable per RESEARCH.md.

---

### `vite.config.ts` (config, static)

**Analog:** self — read directly

**Current state** (lines 18, 27):
```typescript
version = 'stordalen-dev';
// ...
version = 'stordalen-' + hash;
```

**Target state**:
```typescript
version = 'skytterappen-dev';
// ...
version = 'skytterappen-' + hash;
```

Full plugin context for precision (lines 14–29):
```typescript
buildStart() {
	const template = readFileSync('static/sw.template.js', 'utf-8');
	let version: string;
	if (resolvedMode === 'development') {
		version = 'skytterappen-dev';
	} else {
		let hash: string;
		try {
			hash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
		} catch {
			const sha = process.env.VERCEL_GIT_COMMIT_SHA ?? 'unknown';
			hash = sha.slice(0, 7);
		}
		version = 'skytterappen-' + hash;
	}
	writeFileSync('static/sw.js', template.replace('__CACHE_VERSION__', version));
}
```

After editing, run `yarn build` to regenerate `static/sw.js` with the new prefix before committing.

---

## Shared Patterns

### String replacement convention
**Apply to:** All 9 code/config files above  
All replacements are in-place string substitutions. No structural changes, no new imports, no new constants. The chosen app name is `Skytterappen` throughout.

### Asset filename invariant
**Apply to:** `+layout.svelte`, `+error.svelte`, `Splash.svelte`  
`import stordalenLogo from '$lib/assets/stordalen.jpg'` — import path stays unchanged in all three files. Only `alt=` text changes. Asset rename is Phase 6 scope.

### Tab title format
**Apply to:** All three `+page.svelte` files  
Format: `<Page name> - Skytterappen` — literal string in each file's `<svelte:head><title>`. No shared constant.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `README.md` | docs | — | No project README exists yet (current file is default SvelteKit scaffold); write from scratch per RESEARCH.md BRAND-02 section |

README must include: project description using generic app name, and a "## Deployment Prerequisites" section documenting wildcard DNS requirement for Phase 6 (`*.domain CNAME cname.vercel-dns.com`, Vercel wildcard domain config, subdomain-to-club mapping).

---

## Metadata

**Analog search scope:** `src/routes/`, `src/lib/components/`, `static/`, project root
**Files scanned:** 10 (all direct reads — no search needed; all files explicitly named in RESEARCH.md inventory)
**Pattern extraction date:** 2026-05-19
