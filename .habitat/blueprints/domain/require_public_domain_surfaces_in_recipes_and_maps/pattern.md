---
level: error
---
# Require Public Domain Surfaces In Recipes And Maps

Recipe and map source must use public domain surfaces, not deep domain internals.

Allowed domain sub-surfaces are the domain root, `ops`, `artifacts`, named
`model/schemas` and `model/policy` modules, and one named `model/data/<collection>` surface. These are intentional public
composition surfaces: recipes may consume domain operations, artifact contracts, reusable domain
schema primitives, reusable domain policy, and named domain data corpora, but must not reach into
operation-local files, retired config facades, shared buckets, rules, broad data buckets, or private
implementation modules.

```grit
language js(typescript)

or {
  or {
    import_statement(source=$source),
    `export { $exports } from $source`,
    `export type { $exports } from $source`,
    `export * from $source`,
    `import($source)`
  } where {
    $source <: r"^[\"']?@mapgen/domain/[^/]+/.+[\"']?$",
    ! $source <: r"^[\"']?@mapgen/domain/[^/]+/(?:ops|artifacts(?:/index\.js)?|model/schemas(?:/index\.js|/[a-z0-9.-]+\.js)?|model/policy(?:/index\.js|/[a-z0-9.-]+\.js)?|model/data/[a-z0-9-]+(?:/index\.js)?)[\"']?$"
  },
  or {
    import_statement(source=$source),
    `export { $exports } from $source`,
    `export type { $exports } from $source`,
    `export * from $source`,
    `import($source)`
  } where {
    $source <: r"^[\"']?(?:\.\./)+domain/[^\"']+[\"']?$"
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/example-mod/src/recipes/example/stages/demo.ts
import rule from "@mapgen/domain/geology/shared/private";

export const value = rule;

// @filename: mods/example-mod/src/recipes/example/stages/demo.ts
import privateOps from "@mapgen/domain/geology/ops/private";

export const opsValue = privateOps;

// @filename: mods/another-mod/src/maps/alternate/stages/demo.ts
import { byId } from "@mapgen/domain/geology/ops-by-id";

export const lookup = byId;

// @filename: mods/example-mod/src/recipes/example/stages/demo.ts
import privatePolicy from "@mapgen/domain/geology/model/private";

export const privatePolicyValue = privatePolicy;

// @filename: mods/another-mod/src/maps/alternate/stages/demo.ts
export { privateRule } from "@mapgen/domain/biosphere/rules/private";

// @filename: mods/example-mod/src/recipes/example/stages/demo.ts
import broadData from "@mapgen/domain/materials/model/data";

export const broadDataValue = broadData;

// @filename: mods/example-mod/src/recipes/example/stages/biosphere/demo.ts
import { isAnyRiverClass } from "../../../../domain/rivers/index.js";

export const relativeValue = isAnyRiverClass;

// @filename: mods/another-mod/src/maps/alternate/stages/biosphere/steps/climate-refine/step.ts
import { isMajorRiverClass } from "../../../../../domain/rivers/index.js";

export const major = isMajorRiverClass;
```

## Ignores Fixture

```typescript
// @filename: mods/example-mod/src/recipes/example/stages/demo.ts
import geology from "@mapgen/domain/geology";

export const rootValue = geology;

// @filename: mods/example-mod/src/recipes/example/stages/demo.ts
import ops from "@mapgen/domain/geology/ops";

export const opsValue = ops;

// @filename: mods/another-mod/src/maps/alternate/stages/demo.ts
import artifacts from "@mapgen/domain/geology/artifacts";

export const artifactValue = artifacts;

// @filename: mods/example-mod/src/recipes/example/stages/demo.ts
import policy from "@mapgen/domain/geology/model/policy/plate-activity.js";

export const policyValue = policy;

// @filename: mods/another-mod/src/maps/alternate/stages/demo.ts
import schemas from "@mapgen/domain/biosphere/model/schemas";

export const schemaValue = schemas;

// @filename: mods/example-mod/src/recipes/example/stages/demo.ts
import data from "@mapgen/domain/materials/model/data/reference-expectations/index.js";

export const dataValue = data;

// @filename: mods/example-mod/src/recipes/example/stages/biosphere/demo.ts
const source = "../../../../domain/rivers/index.js";

export const sourceOnly = source;
```
