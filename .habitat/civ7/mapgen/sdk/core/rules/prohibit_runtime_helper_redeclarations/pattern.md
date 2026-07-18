---
level: error
---
# Prohibit Runtime Helper Redeclarations

Runtime layers use shared helpers from `@swooper/mapgen-core`.

```grit
language js(typescript)

or {
  `const clamp01 = $_`,
  `let clamp01 = $_`,
  `var clamp01 = $_`,
  `function clamp01($...) { $... }`,
  `function clamp01($...): number { $... }`,
  `const clampChance = $_`,
  `let clampChance = $_`,
  `var clampChance = $_`,
  `function clampChance($...) { $... }`,
  `function clampChance($...): number { $... }`,
  `const normalizeRange = $_`,
  `let normalizeRange = $_`,
  `var normalizeRange = $_`,
  `function normalizeRange($...) { $... }`,
  `function normalizeRange($...): number { $... }`,
  `const rollPercent = $_`,
  `let rollPercent = $_`,
  `var rollPercent = $_`,
  `function rollPercent($...) { $... }`,
  `function rollPercent($...): boolean { $... }`
} where {
  $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/[^/]+/steps/[^/]+/.*|domain/.*/ops/.*/strategies/.*)\.ts$",
  not { $filename <: r".*/config\.ts$" },
  not { $filename <: r".*\.(?:test|spec)\.ts$" },
  not { $filename <: r".*/(?:__tests__|tests?)/.*\.ts$" }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/step.ts
function clamp01(value: number) {
  return value;
}

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/chance.ts
function clampChance(value: number) {
  return value;
}

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/helpers/runtime.ts
function clampChance(value: number) {
  return value;
}

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/range.ts
function normalizeRange(value: number, min: number, max: number) {
  return value;
}

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/roll.ts
function rollPercent(value: number) {
  return value > 0;
}

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/const-helper.ts
const clamp01 = (value: number) => value;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/arrow.ts
const clampChance = (value: number) => Math.max(0, Math.min(1, value));

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/function-expression.ts
let normalizeRange = function (value: number, min: number, max: number) {
  return value;
};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/var-helper.ts
var rollPercent = (value: number) => value > 0.5;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/score-biomes/strategies/default.ts
const clamp01 = (value: number) => value;

// @filename: mods/other-mod/src/recipes/standard/stages/ecology/steps/plot/step.ts
function rollPercent(value: number) {
  return value > 0;
}
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/step.ts
import { clamp01 } from "@swooper/mapgen-core";

export const value = clamp01(1);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/lookalike.ts
function clamp010(value: number) {
  return value;
}

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/roll-lookalike.ts
const rollPercentage = (value: number) => value > 0;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/property.ts
const helpers = {
  clamp01: (value: number) => value,
};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/method.ts
const helpers = {
  clampChance(value: number) {
    return value;
  },
};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/class-method.ts
class RuntimeHelpers {
  normalizeRange(value: number) {
    return value;
  }
}

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/destructure.ts
const { rollPercent } = helpers;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/config.ts
function clamp01(value: number) {
  return value;
}

// @filename: mods/mod-swooper-maps/test/ecology/helpers.test.ts
const clampChance = (value: number) => value;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/config.ts
function normalizeRange(value: number) {
  return value;
}

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/step.test.ts
const clamp01 = (value: number) => value;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/step.spec.ts
const clampChance = (value: number) => value;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/__tests__/runtime.ts
const normalizeRange = (value: number) => value;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/test/runtime.ts
const rollPercent = (value: number) => value > 0;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/tests/runtime.ts
const clamp01 = (value: number) => value;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/score-biomes/contract.ts
function normalizeRange(value: number) {
  return value;
}

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/score-biomes/index.ts
const rollPercent = (value: number) => value > 0;

// @filename: mods/mod-swooper-maps/src/maps/standard/stages/ecology/steps/plot/helpers.ts
function clamp01(value: number) {
  return value;
}

// @filename: packages/mapgen-core/src/runtime/helpers.ts
function clampChance(value: number) {
  return value;
}

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/helpers.tsx
const normalizeRange = (value: number) => value;
```
