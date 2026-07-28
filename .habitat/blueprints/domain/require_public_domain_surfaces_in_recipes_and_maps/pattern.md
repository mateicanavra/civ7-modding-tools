---
level: error
---
# Require Public Domain Surfaces In Recipes And Maps

Recipe and map source must use public domain surfaces, not deep domain internals.

Allowed domain sub-surfaces are the runtime router, root or module model atoms
and policy, and a semantic module's typed artifact catalog. These are
intentional public composition surfaces: recipes consume the aggregate domain
contract from the root, immutable products from their module owner, and named
authoring policy from the nearest model. They do not reach into operation-local
files, module routers, rules, or private implementations.

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
    $source <: r"^[\"']?@mapgen/domain/[a-z0-9]+(?:-[a-z0-9]+)*/.+[\"']?$",
    ! $source <: r"^[\"']?@mapgen/domain/[a-z0-9]+(?:-[a-z0-9]+)*/(?:router(?:\.js)?|model/(?:atoms(?:/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*\.schema)\.js)?|policy/[a-z0-9]+(?:-[a-z0-9]+)*\.js)|modules/[a-z0-9]+(?:-[a-z0-9]+)*/(?:artifacts(?:/index\.js)?|model/(?:atoms(?:/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*\.schema)\.js)?|policy/[a-z0-9]+(?:-[a-z0-9]+)*\.js)))[\"']?$"
  },
  or {
    import_statement(source=$source),
    `export { $exports } from $source`,
    `export type { $exports } from $source`,
    `export * from $source`,
    `import($source)`
  } where {
    $source <: r"^[\"']?(?:\.\./)+domain/[a-z0-9]+(?:-[a-z0-9]+)*/.+[\"']?$",
    ! $source <: r"^[\"']?(?:\.\./)+domain/[a-z0-9]+(?:-[a-z0-9]+)*/(?:(?:index|router)(?:\.js)?|model/(?:atoms(?:/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*\.schema)\.js)?|policy/[a-z0-9]+(?:-[a-z0-9]+)*\.js)|modules/[a-z0-9]+(?:-[a-z0-9]+)*/(?:artifacts(?:/index\.js)?|model/(?:atoms(?:/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*\.schema)\.js)?|policy/[a-z0-9]+(?:-[a-z0-9]+)*\.js)))[\"']?$"
  }
}
```

## Matches Fixture

```typescript
// @filename: plugins/mod/map/example-mod/src/recipes/example/stages/demo.ts
import moduleRouter from "@mapgen/domain/geology/modules/tectonics/router";

export const value = moduleRouter;

// @filename: plugins/mod/map/example-mod/src/recipes/example/stages/demo.ts
import privateOps from "@mapgen/domain/geology/modules/tectonics/ops/private";

export const opsValue = privateOps;

// @filename: plugins/mod/map/another-mod/src/maps/alternate/stages/demo.ts
import { byId } from "@mapgen/domain/geology/modules/tectonics/ops/index.js";

export const lookup = byId;

// @filename: plugins/mod/map/example-mod/src/recipes/example/stages/demo.ts
import privateRule from "@mapgen/domain/geology/modules/tectonics/model/rules/is-active.js";

export const privateRuleValue = privateRule;

// @filename: plugins/mod/map/another-mod/src/maps/alternate/stages/demo.ts
export { privateRule } from "@mapgen/domain/biosphere/rules/private";

// @filename: plugins/mod/map/example-mod/src/recipes/example/stages/biosphere/demo.ts
import privateArtifact from "../../../../domain/geology/modules/tectonics/artifacts/plate-network.artifact.js";

export const relativeValue = privateArtifact;

// @filename: plugins/mod/map/another-mod/src/maps/alternate/stages/biosphere/steps/climate-refine/step.ts
import privateRule from "../../../../../domain/geology/modules/tectonics/ops/compute-plates/rules/private.js";

export const relativeRule = privateRule;

// @filename: plugins/mod/map/example-mod/src/recipes/example/stages/demo.ts
import ops from "@mapgen/domain/geology/modules/tectonics/ops";

export const opsValue = ops;

// @filename: plugins/mod/map/another-mod/src/maps/alternate/stages/demo.ts
import privateArtifact from "@mapgen/domain/geology/modules/tectonics/artifacts/plate-network.artifact.js";

export const artifactValue = privateArtifact;

// @filename: plugins/mod/map/example-mod/src/recipes/example/stages/demo.ts
import branchPolicy from "@mapgen/domain/geology/modules/tectonics/policy/plate-activity.js";

export const branchPolicyValue = branchPolicy;

// @filename: plugins/mod/map/another-mod/src/maps/alternate/stages/demo.ts
import schemas from "@mapgen/domain/biosphere/model/schemas";

export const schemaValue = schemas;
```

## Ignores Fixture

```typescript
// @filename: plugins/mod/map/example-mod/src/recipes/example/stages/demo.ts
import geology from "@mapgen/domain/geology";

export const rootValue = geology;

// @filename: plugins/mod/map/example-mod/src/recipes/example/stages/demo.ts
import policy from "@mapgen/domain/geology/model/policy/plate-activity.js";

export const policyValue = policy;

// @filename: plugins/mod/map/example-mod/src/recipes/example/stages/biosphere/demo.ts
const source = "../../../../domain/rivers/index.js";

export const sourceOnly = source;

// @filename: plugins/mod/map/example-mod/src/recipes/example/stages/demo.ts
import geology from "@mapgen/domain/geology";
import geologyRouter from "@mapgen/domain/geology/router";
import { CrustSchema } from "@mapgen/domain/geology/model/atoms/crust.schema.js";
import { CRUST_POLICY } from "@mapgen/domain/geology/model/policy/crust.js";
import { artifacts } from "@mapgen/domain/geology/modules/tectonics/artifacts";
import { PLATE_POLICY } from "@mapgen/domain/geology/modules/tectonics/model/policy/plates.js";
import relativeGeology from "../../../../domain/geology/index.js";
import relativeRouter from "../../../../domain/geology/router.js";
import { artifacts as relativeArtifacts } from "../../../../domain/geology/modules/tectonics/artifacts/index.js";
import { CRUST_POLICY as RELATIVE_CRUST_POLICY } from "../../../../domain/geology/model/policy/crust.js";

export const publicValues = [
  geology,
  geologyRouter,
  CrustSchema,
  CRUST_POLICY,
  artifacts,
  PLATE_POLICY,
  relativeGeology,
  relativeRouter,
  relativeArtifacts,
  RELATIVE_CRUST_POLICY,
];
```
