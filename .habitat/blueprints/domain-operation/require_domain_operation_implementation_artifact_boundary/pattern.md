---
level: error
---
# Require Domain Operation Implementation Artifact Boundary

Operation entrypoints, semantic strategy implementations, and rules consume
private algorithm `Params` / `Result` shapes composed from smaller semantic atom
types when those parts are genuinely shared. Complete artifact payloads remain
local to artifact owners, while complete input/output envelopes remain local to
operation contracts. Implementation helpers do not import artifact authority,
reconstruct types from artifact schemas, or turn a whole artifact container
into a model atom merely to regain its type.

```grit
language js(typescript)

predicate is_artifact_dependency($source) {
  $source <: r"^[\"']?(?:@mapgen/domain/[^\"']+/artifacts(?:/[^\"']+)?|(?:\./|\.\./)+[^\"']*artifacts(?:/[^\"']+)?|(?:\./|\.\./)+[^\"']*\.artifact\.js)[\"']?$"
}

or {
  import_statement(source=$source) where {
    is_artifact_dependency($source)
  },
  `export { $exports } from $source` where {
    is_artifact_dependency($source)
  },
  `export type { $exports } from $source` where {
    is_artifact_dependency($source)
  },
  `export * from $source` where {
    is_artifact_dependency($source)
  },
  `import($source)` where {
    is_artifact_dependency($source)
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/example-mod/src/domain/geology/modules/tectonics/ops/measure-drift/index.ts
import { artifacts } from "../../../artifacts/index.js";

export const schema = artifacts.drift.schema;

// @filename: mods/example-mod/src/domain/geology/modules/tectonics/ops/measure-drift/rules/project.ts
type Drift = Static<
  typeof import("../../../artifacts/index.js").artifacts.drift.schema
>;

// @filename: mods/example-mod/src/domain/climate/modules/thermal/ops/measure-rain/strategies/water-budget/index.ts
type Rain = Static<typeof import("../../../../artifacts/rain.artifact.js").artifact.schema>;

export default Rain;
```

## Ignores Fixture

```typescript
// @filename: mods/example-mod/src/domain/geology/modules/tectonics/ops/measure-drift/index.ts
import Contract from "./contract.js";
import { plateDrivenStrategy } from "./strategies/index.js";

export default createOp(Contract, { "plate-driven": plateDrivenStrategy });

// @filename: mods/example-mod/src/domain/geology/modules/tectonics/ops/measure-drift/rules/project.ts
import type { PlateEvent } from "../../../model/atoms/plate-event.schema.js";

type ProjectDriftParams = Readonly<{ events: readonly PlateEvent[]; scale: number }>;

export function projectDrift(input: ProjectDriftParams): Float32Array {
  return new Float32Array(input.events.length);
}
```
