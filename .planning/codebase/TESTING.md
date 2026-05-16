# Testing Patterns

**Analysis Date:** 2026-05-17

## Overview

No automated tests exist in this codebase. There are no test files (`*.test.*`, `*.spec.*`), no test runner configuration, and no test-related scripts in `package.json`. Type checking via `svelte-check` and ESLint serve as the primary quality gates.

## Test Framework

**Runner:** None configured

**Type checking (substitute for unit tests):**
- `svelte-check` — validates Svelte component types and template expressions
- `typescript-eslint` — catches type errors and anti-patterns at lint time

**Run Commands:**
```bash
yarn check          # svelte-kit sync && svelte-check --tsconfig ./tsconfig.json
yarn check:watch    # svelte-check in watch mode
yarn lint           # prettier --check . && eslint .
```

## Test File Organization

No test files present. If tests were added, the SvelteKit convention would be:

**Co-located with source:**
```
src/lib/utils/formatters.test.ts
src/lib/utils/helpers.test.ts
src/lib/graphql/queries.test.ts
```

**Separate directory (alternative):**
```
tests/
  unit/
  integration/
```

## Test Structure

Not applicable — no tests exist.

If unit tests were introduced, the highest-value targets are the pure utility functions in:
- `src/lib/utils/formatters.ts` — `parseAsLocalTime`, `formatNorwegianDate`, `formatNorwegianTime`, `getDateLabel`
- `src/lib/utils/helpers.ts` — `hasPartialResults`, `hasAllResults`, `getEventStatus`

These are pure functions with no external dependencies, making them ideal candidates for unit testing.

## Coverage

**Requirements:** None enforced

**Current state:** 0% automated test coverage

**Type coverage:** `tsconfig.json` enables `"strict": true`, so TypeScript enforces types across the entire codebase. This catches a class of bugs that tests would otherwise catch.

## Test Patterns

Not established. Recommended patterns if tests are introduced:

**Framework to add:** Vitest (native to Vite-based projects like SvelteKit)

```bash
yarn add -D vitest @vitest/coverage-v8
```

**vitest.config.ts (suggested):**
```typescript
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'node'
  }
});
```

**Unit test pattern for utility functions:**
```typescript
// src/lib/utils/formatters.test.ts
import { describe, it, expect } from 'vitest';
import { parseAsLocalTime, formatNorwegianDate } from './formatters';

describe('parseAsLocalTime', () => {
  it('strips UTC Z suffix', () => {
    const d = parseAsLocalTime('2025-08-01T10:00:00Z');
    // interpreted as local 10:00, not converted from UTC
    expect(d.getHours()).toBe(10);
  });
});
```

**Test pattern for `getEventStatus`:**
```typescript
// src/lib/utils/helpers.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getEventStatus } from './helpers';

describe('getEventStatus', () => {
  it('returns completed when all series have results', () => {
    const event = {
      checkinDateTime: '2025-08-01T08:00:00',
      series: [{ sum: '150', shots: [] }]
    };
    expect(getEventStatus(event)).toBe('completed');
  });
});
```

## How to Run Tests

No test commands exist. Current quality checks:

```bash
yarn lint           # ESLint + Prettier check
yarn format         # Auto-fix formatting
yarn check          # TypeScript + Svelte type check
yarn check:watch    # Type check in watch mode
```

To add Vitest in the future, add to `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

---

*Testing analysis: 2026-05-17*
