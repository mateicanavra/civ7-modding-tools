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
  $filename <: r".*mods/[^/]+/src/(?:recipes/[^/]+/stages/(?:[^/]+/)+steps/[^/]+/.*|domain/.*/ops/.*/strategies/.*)\.ts$",
  not { $filename <: r".*/config\.ts$" },
  not { $filename <: r".*\.(?:test|spec)\.ts$" },
  not { $filename <: r".*/(?:__tests__|tests?)/.*\.ts$" }
}
```

## Matches fixture

```typescript
// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/step.ts
function clamp01(value: number) {
  return value;
}

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/chance.ts
function clampChance(value: number) {
  return value;
}

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/helpers/runtime.ts
function clampChance(value: number) {
  return value;
}

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/range.ts
function normalizeRange(value: number, min: number, max: number) {
  return value;
}

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/roll.ts
function rollPercent(value: number) {
  return value > 0;
}

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/const-helper.ts
const clamp01 = (value: number) => value;

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/arrow.ts
const clampChance = (value: number) => Math.max(0, Math.min(1, value));

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/function-expression.ts
let normalizeRange = function (value: number, min: number, max: number) {
  return value;
};

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/var-helper.ts
var rollPercent = (value: number) => value > 0.5;

// @filename: mods/example-mod/src/domain/ecology/modules/biomes/ops/score-biomes/strategies/balanced/index.ts
const clamp01 = (value: number) => value;

// @filename: mods/alternate-mod/src/recipes/alternate-recipe/stages/world/projection/steps/project-world/step.ts
function rollPercent(value: number) {
  return value > 0;
}
```

## Ignores fixture

```typescript
// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/step.ts
import { clamp01 } from "@swooper/mapgen-core";

export const value = clamp01(1);

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/lookalike.ts
function clamp010(value: number) {
  return value;
}

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/roll-lookalike.ts
const rollPercentage = (value: number) => value > 0;

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/property.ts
const helpers = {
  clamp01: (value: number) => value,
};

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/method.ts
const helpers = {
  clampChance(value: number) {
    return value;
  },
};

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/class-method.ts
class RuntimeHelpers {
  normalizeRange(value: number) {
    return value;
  }
}

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/destructure.ts
const { rollPercent } = helpers;

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/config.ts
function clamp01(value: number) {
  return value;
}

// @filename: mods/example-mod/test/ecology/helpers.test.ts
const clampChance = (value: number) => value;

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/config.ts
function normalizeRange(value: number) {
  return value;
}

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/step.test.ts
const clamp01 = (value: number) => value;

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/step.spec.ts
const clampChance = (value: number) => value;

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/__tests__/runtime.ts
const normalizeRange = (value: number) => value;

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/test/runtime.ts
const rollPercent = (value: number) => value > 0;

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/tests/runtime.ts
const clamp01 = (value: number) => value;

// @filename: mods/example-mod/src/domain/ecology/modules/biomes/ops/score-biomes/contract.ts
function normalizeRange(value: number) {
  return value;
}

// @filename: mods/example-mod/src/domain/ecology/modules/biomes/ops/score-biomes/index.ts
const rollPercent = (value: number) => value > 0;

// @filename: mods/example-mod/src/maps/sample/stages/ecology/biomes/steps/project-biomes/helpers.ts
function clamp01(value: number) {
  return value;
}

// @filename: packages/mapgen-core/src/runtime/helpers.ts
function clampChance(value: number) {
  return value;
}

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/helpers.tsx
const normalizeRange = (value: number) => value;
```
