---
level: error
---
# Prohibit Runtime Calls To runValidated

Runtime layers must not call `runValidated`.

```grit
language js(typescript)

or {
  `runValidated($...)` where {
    $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$"
  },
  `$target.runValidated($...)` where {
    $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot.ts
runValidated(operation);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/vegetation.ts
ecology.ops.planTreeVegetation.runValidated(input, config.trees);

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/score-biomes/strategies/default.ts
scoreBiomes.runValidated(input, config);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/callback.ts
const output = items.map((item) => runValidated(item));

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/async.ts
export async function run() {
  return await ecology.ops.scoreBiomes.runValidated(input, config);
}

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/optional-chain.ts
ecology.ops.scoreBiomes?.runValidated(input, config);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/contract.ts
plotEffects.runValidated(input, config);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot.test.ts
runValidated(operation);

// @filename: mods/other-mod/src/recipes/standard/stages/ecology/steps/plot.ts
otherRuntime.runValidated(input, config);
```

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot.ts
runValidated(operation);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/vegetation.ts
ecology.ops.planTreeVegetation.runValidated(input, config.trees);

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/score-biomes/strategies/default.ts
scoreBiomes.runValidated(input, config);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/callback.ts
const output = items.map((item) => runValidated(item));

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/async.ts
export async function run() {
  return await ecology.ops.scoreBiomes.runValidated(input, config);
}

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/optional-chain.ts
ecology.ops.scoreBiomes?.runValidated(input, config);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/contract.ts
plotEffects.runValidated(input, config);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot.test.ts
runValidated(operation);

// @filename: mods/other-mod/src/recipes/standard/stages/ecology/steps/plot.ts
otherRuntime.runValidated(input, config);
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot.ts
runOperation(operation);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/helper-name.ts
runValidatedLater(operation);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/import-only.ts
import { runValidated } from "@swooper/mapgen-core/authoring/validation";

export const validator = runValidated;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/property-reference.ts
const runtime = ecology.ops.scoreBiomes.runValidated;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/dynamic-property.ts
ecology.ops.scoreBiomes["runValidated"](input, config);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/config.ts
runValidated(operation);

// @filename: mods/mod-swooper-maps/test/ecology/plot.test.ts
runValidated(operation);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot.tsx
runValidated(operation);

// @filename: mods/mod-swooper-maps/src/maps/continents.ts
runValidated(operation);

// @filename: packages/mapgen-core/src/authoring/op/create-op.ts
op.runValidated(input, config);

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/score-biomes/index.ts
scoreBiomes.runValidated(input, config);
```
