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
    $source <: r"^[\"']?(?:\.\./)+domain/[^\"']+[\"']?$"
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/example-mod/src/recipes/example/stages/demo.ts
import moduleRouter from "@mapgen/domain/geology/modules/tectonics/router";

export const value = moduleRouter;

// @filename: mods/example-mod/src/recipes/example/stages/demo.ts
import privateOps from "@mapgen/domain/geology/modules/tectonics/ops/private";

export const opsValue = privateOps;

// @filename: mods/another-mod/src/maps/alternate/stages/demo.ts
import { byId } from "@mapgen/domain/geology/modules/tectonics/ops/index.js";

export const lookup = byId;

// @filename: mods/example-mod/src/recipes/example/stages/demo.ts
import privateRule from "@mapgen/domain/geology/modules/tectonics/model/rules/is-active.js";

export const privateRuleValue = privateRule;

// @filename: mods/another-mod/src/maps/alternate/stages/demo.ts
export { privateRule } from "@mapgen/domain/biosphere/rules/private";

// @filename: mods/example-mod/src/recipes/example/stages/biosphere/demo.ts
import { artifacts } from "../../../../domain/geology/modules/tectonics/artifacts/index.js";

export const relativeValue = artifacts;

// @filename: mods/another-mod/src/maps/alternate/stages/biosphere/steps/climate-refine/step.ts
import domainRouter from "../../../../../domain/geology/router.js";

export const relativeRouter = domainRouter;

// @filename: mods/example-mod/src/recipes/example/stages/demo.ts
import ops from "@mapgen/domain/geology/modules/tectonics/ops";

export const opsValue = ops;

// @filename: mods/another-mod/src/maps/alternate/stages/demo.ts
import privateArtifact from "@mapgen/domain/geology/modules/tectonics/artifacts/plate-network.artifact.js";

export const artifactValue = privateArtifact;

// @filename: mods/example-mod/src/recipes/example/stages/demo.ts
import branchPolicy from "@mapgen/domain/geology/modules/tectonics/policy/plate-activity.js";

export const branchPolicyValue = branchPolicy;

// @filename: mods/another-mod/src/maps/alternate/stages/demo.ts
import schemas from "@mapgen/domain/biosphere/model/schemas";

export const schemaValue = schemas;
```

## Ignores Fixture

```typescript
// @filename: mods/example-mod/src/recipes/example/stages/demo.ts
import geology from "@mapgen/domain/geology";

export const rootValue = geology;

// @filename: mods/example-mod/src/recipes/example/stages/demo.ts
import policy from "@mapgen/domain/geology/model/policy/plate-activity.js";

export const policyValue = policy;

// @filename: mods/example-mod/src/recipes/example/stages/biosphere/demo.ts
const source = "../../../../domain/rivers/index.js";

export const sourceOnly = source;

// @filename: mods/example-mod/src/recipes/example/stages/demo.ts
import geology from "@mapgen/domain/geology";
import geologyRouter from "@mapgen/domain/geology/router";
import { CrustSchema } from "@mapgen/domain/geology/model/atoms/crust.schema.js";
import { CRUST_POLICY } from "@mapgen/domain/geology/model/policy/crust.js";
import { artifacts } from "@mapgen/domain/geology/modules/tectonics/artifacts";
import { PLATE_POLICY } from "@mapgen/domain/geology/modules/tectonics/model/policy/plates.js";

export const publicValues = [
  geology,
  geologyRouter,
  CrustSchema,
  CRUST_POLICY,
  artifacts,
  PLATE_POLICY,
];
```
