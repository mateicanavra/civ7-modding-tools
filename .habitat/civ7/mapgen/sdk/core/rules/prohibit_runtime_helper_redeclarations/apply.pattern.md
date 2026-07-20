---
level: none
---
# Prohibit Runtime Helper Redeclarations

Mechanically replaces exact runtime helper redeclarations with canonical helper
imports when the helper body has a proven equivalent public helper.

```grit
language js(typescript)

or {
  program($statements) where {
    $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps/.*|domain/.*/ops/.*/strategies)/.*\.ts$",
    $statements <: some $helper where {
      $helper <: `function clamp01($value: number): number { return Math.max(0, Math.min(1, $value)); }`,
      $helper => .
    },
    $statements <: some $anchor where { $anchor <: import_statement() },
    $anchor += `\nimport { clamp01 } from "@swooper/mapgen-core";`
  },
  program($statements) as $program where {
    $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps/.*|domain/.*/ops/.*/strategies)/.*\.ts$",
    $statements <: some $helper where {
      $helper <: `function clamp01($value: number): number { if (!Number.isFinite($value)) return 0; return Math.max(0, Math.min(1, $value)); }`,
      $helper => .
    },
    $program <: contains bubble {
      `clamp01($arg)` => `clampPct($arg, 0, 1, 0)`
    },
    $statements <: some $anchor where { $anchor <: import_statement() },
    $anchor += `\nimport { clampPct } from "@swooper/mapgen-core";`
  }
}
```

## Rewrites plain clamp01 helper

```typescript
// @filename: mods/mod-swooper-maps/src/domain/hydrology/ops/demo/strategies/default.ts
import { createStrategy } from "@swooper/mapgen-core/authoring";

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export const demo = clamp01(0.5);
```

```typescript
// @filename: mods/mod-swooper-maps/src/domain/hydrology/ops/demo/strategies/default.ts
import { createStrategy } from "@swooper/mapgen-core/authoring";
import { clamp01 } from "@swooper/mapgen-core";


export const demo = clamp01(0.5);
```

## Rewrites non-finite clamp01 helper to explicit clampPct calls

```typescript
// @filename: mods/mod-swooper-maps/src/domain/morphology/ops/demo/strategies/default.ts
import { createStrategy } from "@swooper/mapgen-core/authoring";

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export const finite = clamp01(0.25);
export const nan = clamp01(Number.NaN);
export const infinity = clamp01(Infinity);
export const negativeInfinity = clamp01(-Infinity);
```

```typescript
// @filename: mods/mod-swooper-maps/src/domain/morphology/ops/demo/strategies/default.ts
import { createStrategy } from "@swooper/mapgen-core/authoring";
import { clampPct } from "@swooper/mapgen-core";


export const finite = clampPct(0.25, 0, 1, 0);
export const nan = clampPct(Number.NaN, 0, 1, 0);
export const infinity = clampPct(Infinity, 0, 1, 0);
export const negativeInfinity = clampPct(-Infinity, 0, 1, 0);
```

## Ignores non-equivalent clamp01 fallback

```typescript
// @filename: mods/mod-swooper-maps/src/domain/morphology/ops/demo/strategies/default.ts
import { createStrategy } from "@swooper/mapgen-core/authoring";

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0.5;
  return Math.max(0, Math.min(1, value));
}

export const demo = clamp01(Number.NaN);
```

## Ignores out-of-scope helper path

```typescript
// @filename: packages/mapgen-core/src/lib/heightfield/base.ts
function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}
```

## Ignores helper with no import anchor

```typescript
// @filename: mods/mod-swooper-maps/src/domain/morphology/ops/demo/strategies/default.ts
function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}
```
