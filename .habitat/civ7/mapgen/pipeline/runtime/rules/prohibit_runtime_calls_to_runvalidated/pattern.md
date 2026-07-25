---
level: error
---
# Prohibit Runtime Calls To runValidated

Runtime layers must not call `runValidated`.

```grit
language js(typescript)

or {
  `runValidated($...)` where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/(?:[^/]+/)+steps/[^/]+/.*\.ts$",
    not { $filename <: r".*/config\.ts$" },
    not { $filename <: r".*\.(?:test|spec)\.ts$" },
    not { $filename <: r".*/(?:__tests__|tests?)/.*\.ts$" }
  },
  `$target.runValidated($...)` where {
    $filename <: r".*mods/[^/]+/src/recipes/[^/]+/stages/(?:[^/]+/)+steps/[^/]+/.*\.ts$",
    not { $filename <: r".*/config\.ts$" },
    not { $filename <: r".*\.(?:test|spec)\.ts$" },
    not { $filename <: r".*/(?:__tests__|tests?)/.*\.ts$" }
  },
  `runValidated($...)` where {
    $filename <: r".*mods/[^/]+/src/domain/.*/ops/.*/strategies/.*\.ts$"
  },
  `$target.runValidated($...)` where {
    $filename <: r".*mods/[^/]+/src/domain/.*/ops/.*/strategies/.*\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/step.ts
runValidated(operation);

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/features/steps/plan-vegetation/step.ts
ecology.ops.planTreeVegetation.runValidated(input, config.trees);

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/features/steps/plan-vegetation/helpers/runtime.ts
ecology.ops.planTreeVegetation.runValidated(input, config.trees);

// @filename: mods/example-mod/src/domain/ecology/modules/biomes/ops/score-biomes/strategies/balanced/index.ts
scoreBiomes.runValidated(input, config);

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/callback/step.ts
const output = items.map((item) => runValidated(item));

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/async/step.ts
export async function run() {
  return await ecology.ops.scoreBiomes.runValidated(input, config);
}

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/optional-chain/step.ts
ecology.ops.scoreBiomes?.runValidated(input, config);

// @filename: mods/alternate-mod/src/recipes/alternate-recipe/stages/world/projection/steps/project-world/step.ts
otherRuntime.runValidated(input, config);
```

## Ignores fixture

```typescript
// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/step.ts
runOperation(operation);

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/helper-name/step.ts
runValidatedLater(operation);

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/import-only/step.ts
import { runValidated } from "@swooper/mapgen-core/authoring/validation";

export const validator = runValidated;

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/property-reference/step.ts
const runtime = ecology.ops.scoreBiomes.runValidated;

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/dynamic-property/step.ts
ecology.ops.scoreBiomes["runValidated"](input, config);

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/config.ts
runValidated(operation);

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/config.ts
runValidated(operation);

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/step.test.ts
runValidated(operation);

// @filename: mods/example-mod/test/ecology/project-biomes.test.ts
runValidated(operation);

// @filename: mods/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/step.tsx
runValidated(operation);

// @filename: mods/example-mod/src/maps/continents.ts
runValidated(operation);

// @filename: packages/mapgen-core/src/authoring/op/create-op.ts
op.runValidated(input, config);

// @filename: mods/example-mod/src/domain/ecology/modules/biomes/ops/score-biomes/index.ts
scoreBiomes.runValidated(input, config);
```
