---
level: error
---
# Require Domain Policy Owner Shape

Domain model policy files own reusable semantic laws, tables, defaults, and
pure resolver functions. Root policy depends only on sibling policy and root
atoms. Direct-module policy may additionally reuse policy or atoms from its
exact ancestor domain model; root policy never reaches down into modules.
Workspace package roles are enforced by the package graph. Policy files do not
acquire atom, artifact, operation, recipe, or stage authority.

```grit
language js(typescript)

predicate disallowed_root_policy_dependency($source) {
  ! $source <: r"^[\"']?(?:@civ7/map-policy|@swooper/mapgen-core(?:/lib(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*)?|type-fest|\./[^\"']+|\.\./atoms/[^\"']+)[\"']?$"
}

predicate disallowed_module_policy_dependency($source) {
  ! $source <: r"^[\"']?(?:@civ7/map-policy|@swooper/mapgen-core(?:/lib(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*)?|type-fest|\./[^\"']+|\.\./atoms/[^\"']+|(?:\.\./){4}model/(?:atoms/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*\.schema)|policy/[a-z0-9]+(?:-[a-z0-9]+)*)\.js)[\"']?$"
}

or {
  import_statement(source=$source) where {
    $filename <: r".*plugins/mod/map/[^/]+/src/domain/[^/]+/model/policy/[^/]+\.ts$",
    disallowed_root_policy_dependency($source)
  },
  import_statement(source=$source) where {
    $filename <: r".*plugins/mod/map/[^/]+/src/domain/[^/]+/modules/[^/]+/model/policy/[^/]+\.ts$",
    disallowed_module_policy_dependency($source)
  },
  or {
    `export { $exports } from $source`,
    `export type { $exports } from $source`,
    `export * from $source`
  } where {
    ! $source <: r"^[\"']?\./[^\"']+[\"']?$"
  },
  `import($source)`,
  or {
    `defineDomain($args)`,
    `createDomain($args)`,
    `defineOp($args)`,
    `createOp($args)`,
    `defineStep($args)`,
    `createStep($args)`,
    `createStage($args)`,
    `createRecipe($args)`,
    `defineArtifact($args)`,
    `defineArtifactValidator($args)`,
    `appendArtifactTypedArrayIssues($args)`,
    `artifactCellCount($args)`,
    `validateArtifactSchema($args)`,
    `Value.Errors($args)`
  },
  or {
    `type ArtifactValidationIssue = $definition`,
    `type ValidationIssue = $definition`,
    `interface ArtifactValidationIssue { $members }`,
    `interface ValidationIssue { $members }`
  },
  program(statements=$body) where {
    $body <: contains or {
      `knobsSchema: $value`,
      `public: $value`,
      `compile: $value`
    }
  }
}
```

## Matches Fixture

```typescript
import { Type } from "@swooper/mapgen-core/authoring/schema";

export const PlateActivitySchema = Type.Object({});

// @filename: plugins/mod/map/example-mod/src/domain/geology/model/policy/aliased-object.ts
import { Type as SchemaBuilder } from "@swooper/mapgen-core/authoring/schema";

export const PlateActivitySchema = SchemaBuilder.Object({});

// @filename: plugins/mod/map/example-mod/src/domain/geology/model/policy/aliased-typed-arrays.ts
import { TypedArraySchemas as Buffers } from "@swooper/mapgen-core/authoring/schema";

export const PlateActivityGridSchema = Buffers.Float32Array({ cardinality: ["grid"] });

// @filename: plugins/mod/map/example-mod/src/domain/geology/model/policy/schema-value.ts
import { ResourceFamilySchema } from "../atoms/resource-family.schema.js";

export const DEFAULT_RESOURCE_FAMILY = ResourceFamilySchema;

// @filename: plugins/mod/map/example-mod/src/domain/geology/model/policy/private-domain.ts
import domain from "@mapgen/domain/resources";

export const RESOURCE_DOMAIN = domain;
```

## Ignores Fixture

```typescript
import { clampFinite } from "@swooper/mapgen-core/lib/math";
import type { ResourceFamily } from "../atoms/index.js";

export type PlatePolicy = Readonly<{ family: ResourceFamily; activity: number }>;

/** Resolves a reusable domain activity ratio without owning authoring config. */
export function resolvePlateActivity(value: number): number {
  return clampFinite(value, 0, 1);
}
```
