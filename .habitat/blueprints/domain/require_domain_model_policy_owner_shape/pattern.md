---
level: error
---
# Require Domain Model Policy Owner Shape

Domain model policy files own reusable semantic constants, tables, defaults,
and pure resolver functions. Relative dependencies remain inside sibling policy
or model schema surfaces; workspace package roles are enforced by the package
graph. Policy files do not acquire artifact, operation, recipe, or stage
authority.

```grit
language js(typescript)

or {
  import_statement(source=$source) where {
    $source <: r"^[\"']?\.",
    ! $source <: r"^[\"']?(?:\./[^\"']+|\.\./schemas/[^\"']+)[\"']?$"
  },
  import_statement(source=$source) where {
    $source <: r"^[\"']?(?:@swooper/mapgen-core/authoring(?:/.*)?|typebox(?:/.*)?)[\"']?$"
  },
  import_statement(source=$source) as $import where {
    $source <: r"^[\"']?\.\./schemas/[^\"']+[\"']?$",
    ! $import <: includes "import type"
  },
  or {
    `export { $exports } from $source`,
    `export type { $exports } from $source`,
    `export * from $source`
  } where {
    $source <: r"^[\"']?\.\./schemas/[^\"']+[\"']?$"
  },
  or {
    `export { $exports } from $source`,
    `export type { $exports } from $source`,
    `export * from $source`
  } where {
    ! $source <: r"^[\"']?(?:\./[^\"']+|\.\./schemas/[^\"']+)[\"']?$"
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

// @filename: mods/example-mod/src/domain/geology/model/policy/aliased-object.ts
import { Type as SchemaBuilder } from "@swooper/mapgen-core/authoring/schema";

export const PlateActivitySchema = SchemaBuilder.Object({});

// @filename: mods/example-mod/src/domain/geology/model/policy/aliased-typed-arrays.ts
import { TypedArraySchemas as Buffers } from "@swooper/mapgen-core/authoring/schema";

export const PlateActivityGridSchema = Buffers.Float32Array({ cardinality: ["grid"] });

// @filename: mods/example-mod/src/domain/geology/model/policy/schema-value.ts
import { ResourceFamilySchema } from "../schemas/resource-family.schema.js";

export const DEFAULT_RESOURCE_FAMILY = ResourceFamilySchema;
```

## Ignores Fixture

```typescript
import { clampFinite } from "@swooper/mapgen-core/lib/math";
import type { ResourceFamily } from "../schemas/index.js";

export type PlatePolicy = Readonly<{ family: ResourceFamily; activity: number }>;

/** Resolves a reusable domain activity ratio without owning authoring config. */
export function resolvePlateActivity(value: number): number {
  return clampFinite(value, 0, 1);
}
```
