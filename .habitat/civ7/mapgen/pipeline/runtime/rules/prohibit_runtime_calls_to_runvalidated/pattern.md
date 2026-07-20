---
level: error
---
# Prohibit Runtime Calls To runValidated

Runtime layers must not call `runValidated`.

```grit
language js(typescript)

or {
  `runValidated($...)` where {
    $filename <: r".*mods/[^/]+/src/recipes/.*/stages/[^/]+/steps/[^/]+/.*\.ts$",
    not { $filename <: r".*/config\.ts$" },
    not { $filename <: r".*\.(?:test|spec)\.ts$" },
    not { $filename <: r".*/(?:__tests__|tests?)/.*\.ts$" }
  },
  `$target.runValidated($...)` where {
    $filename <: r".*mods/[^/]+/src/recipes/.*/stages/[^/]+/steps/[^/]+/.*\.ts$",
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
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/step.ts
runValidated(operation);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/vegetation/step.ts
ecology.ops.planTreeVegetation.runValidated(input, config.trees);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/vegetation/helpers/runtime.ts
ecology.ops.planTreeVegetation.runValidated(input, config.trees);

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/score-biomes/strategies/default.ts
scoreBiomes.runValidated(input, config);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/callback/step.ts
const output = items.map((item) => runValidated(item));

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/async/step.ts
export async function run() {
  return await ecology.ops.scoreBiomes.runValidated(input, config);
}

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/optional-chain/step.ts
ecology.ops.scoreBiomes?.runValidated(input, config);

// @filename: mods/other-mod/src/recipes/standard/stages/ecology/steps/plot/step.ts
otherRuntime.runValidated(input, config);
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/step.ts
runOperation(operation);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/helper-name/step.ts
runValidatedLater(operation);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/import-only/step.ts
import { runValidated } from "@swooper/mapgen-core/authoring/validation";

export const validator = runValidated;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/property-reference/step.ts
const runtime = ecology.ops.scoreBiomes.runValidated;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/dynamic-property/step.ts
ecology.ops.scoreBiomes["runValidated"](input, config);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/config.ts
runValidated(operation);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/config.ts
runValidated(operation);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/step.test.ts
runValidated(operation);

// @filename: mods/mod-swooper-maps/test/ecology/plot.test.ts
runValidated(operation);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/step.tsx
runValidated(operation);

// @filename: mods/mod-swooper-maps/src/maps/continents.ts
runValidated(operation);

// @filename: packages/mapgen-core/src/authoring/op/create-op.ts
op.runValidated(input, config);

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/score-biomes/index.ts
scoreBiomes.runValidated(input, config);
```
