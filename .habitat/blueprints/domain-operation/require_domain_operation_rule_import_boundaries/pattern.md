---
level: error
---
# Require Domain Operation Rule Import Boundaries

Operation rules contain private algorithm mechanics. They may compose sibling
rules, shared MapGen primitives, and atoms or policy from their exact semantic
module and domain ancestors. A direct module may additionally consume named
atoms from a sibling module, but rules do not reach into operation-local type
bags, contracts, artifacts, other operations, recipes, adapters, or runtime
orchestration.

```grit
language js(typescript)

predicate disallowed_operation_rule_dependency($source) {
  ! $source <: r"^[\"']?(?:@civ7/map-policy|@swooper/mapgen-core(?:/authoring(?:/contracts)?|/lib(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*)?|type-fest|\./(?:index|[a-z0-9]+(?:-[a-z0-9]+)*)\.js|(?:\.\./){3}model/(?:atoms/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*\.schema)|policy/[a-z0-9]+(?:-[a-z0-9]+)*)\.js|(?:\.\./){5}model/(?:atoms/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*\.schema)|policy/[a-z0-9]+(?:-[a-z0-9]+)*)\.js|(?:\.\./){4}[a-z0-9]+(?:-[a-z0-9]+)*/model/atoms/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*\.schema)\.js)[\"']?$"
}

or {
  import_statement(source=$source),
  `export { $exports } from $source`,
  `export type { $exports } from $source`,
  `export * from $source`,
  `import($source)`
} where {
  $filename <: r".*/src/domain/[^/]+/modules/[^/]+/ops/[^/]+/rules/[^/]+\.ts$",
  disallowed_operation_rule_dependency($source)
}
```

## Matches Fixture

```typescript
// @filename: plugins/mod/map/example-mod/src/domain/world/modules/terrain/ops/shape-relief/rules/project.ts
import Contract from "../contract.js";

export const contract = Contract;

// @filename: plugins/mod/map/example-mod/src/domain/world/modules/terrain/ops/shape-relief/rules/project.ts
import { artifacts } from "../../../artifacts/index.js";

export const schema = artifacts.relief.schema;

// @filename: plugins/mod/map/example-mod/src/domain/world/modules/terrain/ops/shape-relief/rules/project.ts
import { recipe } from "../../../../../../recipes/standard/recipe.js";

export const hiddenOrchestration = recipe;

// @filename: plugins/mod/map/example-mod/src/domain/world/modules/terrain/ops/shape-relief/rules/project.ts
import type { ReliefWorkQueue } from "../types.js";

export const queue = {} as ReliefWorkQueue;
```

## Ignores Fixture

```typescript
// @filename: plugins/mod/map/example-mod/src/domain/world/modules/terrain/ops/shape-relief/rules/project.ts
import { clamp01 } from "@swooper/mapgen-core/lib/math";
import { classifyRelief } from "./classify-relief.js";
import type { ReliefField } from "../../../model/atoms/relief-field.schema.js";
import { RELIEF_POLICY } from "../../../model/policy/relief-policy.js";
import type { MeshField } from "../../../../mesh/model/atoms/mesh-field.schema.js";
import { WORLD_POLICY } from "../../../../../model/policy/world-policy.js";

type ReliefWorkQueue = Readonly<{ pending: readonly number[] }>;

export function projectRelief(queue: ReliefWorkQueue, relief: ReliefField, mesh: MeshField) {
  return classifyRelief(clamp01(queue.pending.length + RELIEF_POLICY + WORLD_POLICY + mesh.size));
}
```
