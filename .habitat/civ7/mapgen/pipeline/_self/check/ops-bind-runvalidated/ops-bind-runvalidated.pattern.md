---
level: error
---
# Ops Bind Run Validated

Domain op runtime entrypoints must not orchestrate through `ops.bind` or
`runValidated`.

```grit
language js(typescript)

or {
  `ops.bind($...)` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/[^/]+/index\.ts$"
  },
  `runValidated($...)` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/[^/]+/index\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
ops.bind(computeMesh, input);

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
runValidated(operation);

// @filename: mods/mod-swooper-maps/src/domain/hydrology/ops/plan-rivers/index.ts
const value = items.map((item) => runValidated(item));

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/score-biomes/index.ts
export async function run() {
  return await ops.bind(scoreBiomes, input);
}

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
ops?.bind(computeMesh, input);
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
otherOps.bind(computeMesh, input);

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
ops.bindLater(computeMesh, input);

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
const bind = ops.bind;

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
op.runValidated(input, config);

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
const validator = runValidated;

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
runValidatedLater(operation);

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/strategies/default.ts
ops.bind(computeMesh, input);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/compute-crust.ts
runValidated(operation);

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.tsx
ops.bind(computeMesh, input);

// @filename: mods/other-mod/src/domain/foundation/ops/compute-crust/index.ts
ops.bind(computeMesh, input);

// @filename: mods/mod-swooper-maps/test/foundation/op-orchestration.test.ts
runValidated(operation);

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts
const source = "ops.bind(runValidated)";
```
