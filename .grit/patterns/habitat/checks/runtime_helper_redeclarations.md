---
level: error
---
# Runtime Helper Redeclarations

Runtime layers use shared helpers from `@swooper/mapgen-core`.

```grit
language js(typescript)

or {
  `const clamp01 = $_` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" },
  `let clamp01 = $_` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" },
  `var clamp01 = $_` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" },
  `function clamp01($...) { $... }` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" },
  `const clampChance = $_` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" },
  `let clampChance = $_` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" },
  `var clampChance = $_` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" },
  `function clampChance($...) { $... }` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" },
  `const normalizeRange = $_` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" },
  `let normalizeRange = $_` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" },
  `var normalizeRange = $_` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" },
  `function normalizeRange($...) { $... }` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" },
  `const rollPercent = $_` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" },
  `let rollPercent = $_` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" },
  `var rollPercent = $_` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" },
  `function rollPercent($...) { $... }` where { $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$" }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot.ts
function clamp01(value: number) {
  return value;
}

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/chance.ts
function clampChance(value: number) {
  return value;
}

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/range.ts
function normalizeRange(value: number, min: number, max: number) {
  return value;
}

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/roll.ts
function rollPercent(value: number) {
  return value > 0;
}

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/const-helper.ts
const clamp01 = (value: number) => value;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/arrow.ts
const clampChance = (value: number) => Math.max(0, Math.min(1, value));

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/function-expression.ts
let normalizeRange = function (value: number, min: number, max: number) {
  return value;
};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/var-helper.ts
var rollPercent = (value: number) => value > 0.5;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/score-biomes/strategies/default.ts
const clamp01 = (value: number) => value;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/contract.ts
function normalizeRange(value: number) {
  return value;
}

// @filename: mods/other-mod/src/recipes/standard/stages/ecology/steps/plot.ts
function rollPercent(value: number) {
  return value > 0;
}
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot.ts
import { clamp01 } from "@swooper/mapgen-core";

export const value = clamp01(1);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/lookalike.ts
function clamp010(value: number) {
  return value;
}

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/roll-lookalike.ts
const rollPercentage = (value: number) => value > 0;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/property.ts
const helpers = {
  clamp01: (value: number) => value,
};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/method.ts
const helpers = {
  clampChance(value: number) {
    return value;
  },
};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/class-method.ts
class RuntimeHelpers {
  normalizeRange(value: number) {
    return value;
  }
}

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/destructure.ts
const { rollPercent } = helpers;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/config.ts
function clamp01(value: number) {
  return value;
}

// @filename: mods/mod-swooper-maps/test/ecology/helpers.test.ts
const clampChance = (value: number) => value;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/score-biomes/contract.ts
function normalizeRange(value: number) {
  return value;
}

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/score-biomes/index.ts
const rollPercent = (value: number) => value > 0;

// @filename: mods/mod-swooper-maps/src/maps/standard/stages/ecology/steps/helpers.ts
function clamp01(value: number) {
  return value;
}

// @filename: packages/mapgen-core/src/runtime/helpers.ts
function clampChance(value: number) {
  return value;
}

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/helpers.tsx
const normalizeRange = (value: number) => value;
```
