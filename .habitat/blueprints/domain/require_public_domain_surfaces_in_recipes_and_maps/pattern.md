---
level: error
---
# Require Public Domain Surfaces In Recipes And Maps

Recipe and map source must use public domain surfaces, not deep domain internals.

Allowed domain sub-surfaces are the domain root, `ops`, `artifacts`, `model/schemas`,
`model/policy`, and explicitly admitted `model/data` collections. These are intentional public
composition surfaces: recipes may consume domain operations, artifact contracts, reusable domain
schema primitives, reusable domain policy, and named domain data corpora, but must not reach into
operation-local files, retired config facades, shared buckets, rules, broad data buckets, or private
implementation modules.

```grit
language js(typescript)

or {
  import_statement(source=$source) where {
    $filename <: r".*mods/mod-swooper-maps/src/(?:recipes|maps)/.*\.tsx?$",
    $source <: r"^[\"']?@mapgen/domain/[^/]+/.+[\"']?$",
    ! $source <: r"^[\"']?(?:@mapgen/domain/[^/]+/(?:ops|ops/index\.js|artifacts|artifacts/index\.js|model/(?:schemas|policy)(?:/[^\"']+)?)|@mapgen/domain/resources/model/data/earthlike-expectations(?:/[^\"']+)?)[\"']?$"
  },
  `export { $exports } from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/(?:recipes|maps)/.*\.tsx?$",
    $source <: r"^[\"']?@mapgen/domain/[^/]+/.+[\"']?$",
    ! $source <: r"^[\"']?(?:@mapgen/domain/[^/]+/(?:ops|ops/index\.js|artifacts|artifacts/index\.js|model/(?:schemas|policy)(?:/[^\"']+)?)|@mapgen/domain/resources/model/data/earthlike-expectations(?:/[^\"']+)?)[\"']?$"
  },
  `export * from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/(?:recipes|maps)/.*\.tsx?$",
    $source <: r"^[\"']?@mapgen/domain/[^/]+/.+[\"']?$",
    ! $source <: r"^[\"']?(?:@mapgen/domain/[^/]+/(?:ops|ops/index\.js|artifacts|artifacts/index\.js|model/(?:schemas|policy)(?:/[^\"']+)?)|@mapgen/domain/resources/model/data/earthlike-expectations(?:/[^\"']+)?)[\"']?$"
  },
  import_statement(source=$source) where {
    $filename <: r".*mods/mod-swooper-maps/src/(?:recipes|maps)/.*\.tsx?$",
    $source <: r"^[\"']?(?:\.\./)+domain/[^\"']+[\"']?$"
  },
  `export { $exports } from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/(?:recipes|maps)/.*\.tsx?$",
    $source <: r"^[\"']?(?:\.\./)+domain/[^\"']+[\"']?$"
  },
  `export * from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/(?:recipes|maps)/.*\.tsx?$",
    $source <: r"^[\"']?(?:\.\./)+domain/[^\"']+[\"']?$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import rule from "@mapgen/domain/foundation/shared/private";

export const value = rule;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import privateOps from "@mapgen/domain/foundation/ops/private";

export const opsValue = privateOps;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import { byId } from "@mapgen/domain/foundation/ops-by-id";

export const lookup = byId;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import privatePolicy from "@mapgen/domain/foundation/model/private";

export const privatePolicyValue = privatePolicy;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
export { privateRule } from "@mapgen/domain/ecology/rules/private";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import broadData from "@mapgen/domain/resources/model/data/shared/index.js";

export const broadDataValue = broadData;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import wrongDomainData from "@mapgen/domain/placement/model/data/earthlike-expectations/index.js";

export const wrongDomainDataValue = wrongDomainData;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/demo.ts
import { isAnyRiverClass } from "../../../../domain/hydrology/index.js";

export const relativeValue = isAnyRiverClass;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/climate-refine/step.ts
import { isMajorRiverClass } from "../../../../../domain/hydrology/index.js";

export const major = isMajorRiverClass;
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import foundation from "@mapgen/domain/foundation";

export const rootValue = foundation;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import ops from "@mapgen/domain/foundation/ops";

export const opsValue = ops;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import artifacts from "@mapgen/domain/foundation/artifacts";

export const artifactValue = artifacts;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import opsIndex from "@mapgen/domain/foundation/ops/index.js";

export const opsIndexValue = opsIndex;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import policy from "@mapgen/domain/foundation/model/policy/plate-activity.js";

export const policyValue = policy;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import schemas from "@mapgen/domain/ecology/model/schemas";

export const schemaValue = schemas;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts
import data from "@mapgen/domain/resources/model/data/earthlike-expectations/index.js";

export const dataValue = data;

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/private.ts
import privateOp from "@mapgen/domain/foundation/ops/private";

export const domainValue = privateOp;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/demo.ts
const source = "../../../../domain/hydrology/index.js";

export const sourceOnly = source;
```
