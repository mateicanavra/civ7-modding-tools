---
level: error
---
# Prohibit Runtime Orchestration Helpers In Domain Ops

Domain op runtime entrypoints must not orchestrate through `ops.bind` or
`runValidated`.

```grit
language js(typescript)

or {
  `ops.bind($...)`,
  `runValidated($...)`
}
```

## Matches fixture

```typescript
// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/geology/ops/estimate-crust/index.ts
ops.bind(computeMesh, input);

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/geology/ops/estimate-crust/index.ts
runValidated(operation);

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/drainage/ops/route-channels/index.ts
const value = items.map((item) => runValidated(item));

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
export async function run() {
  return await ops.bind(scoreBiomes, input);
}

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/geology/ops/estimate-crust/index.ts
ops?.bind(computeMesh, input);
```

## Ignores fixture

```typescript
// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/geology/ops/estimate-crust/index.ts
otherOps.bind(computeMesh, input);

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/geology/ops/estimate-crust/index.ts
ops.bindLater(computeMesh, input);

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/geology/ops/estimate-crust/index.ts
const bind = ops.bind;

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/geology/ops/estimate-crust/index.ts
op.runValidated(input, config);

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/geology/ops/estimate-crust/index.ts
const validator = runValidated;

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/geology/ops/estimate-crust/index.ts
runValidatedLater(operation);

// @filename: plugins/mod/map/swooper-physics/src/domain/world/modules/geology/ops/estimate-crust/index.ts
const source = "ops.bind(runValidated)";
```
