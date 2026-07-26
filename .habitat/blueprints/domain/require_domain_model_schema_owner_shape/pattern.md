---
level: error
---
# Require Domain Model Schema Owner Shape

Domain model schema files are composable schema parts. Relative dependencies
remain inside the sibling schema surface; workspace package roles are enforced
by the package graph. Schema files do not own artifact setup, artifact
admission, operation or recipe authoring, structural validation projection, or
stage configuration.

```grit
language js(typescript)

or {
  import_statement(source=$source) where {
    ! $source <: r"^[\"']?(?:@swooper/mapgen-core/authoring/schema|type-fest|\./[^\"']+)[\"']?$"
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
  `export function $name($params) { $body }` where {
    $name <: r"^validate.*"
  },
  or {
    `export const $name = $value`,
    `export let $name = $value`,
    `export var $name = $value`
  } where {
    $name <: r"^validate.*"
  },
  `export const $name = Type.Object($args)` where {
    $name <: r".*(?:Input|Output|Contract|Config)Schema$"
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
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";

export const CrustSchema = Type.Object({});
export const artifact = defineArtifact({
  name: "crust",
  id: "artifact:geology.crust",
  schema: CrustSchema,
});

// @filename: mods/example-mod/src/domain/geology/model/schemas/crust.schema.ts
import { Type } from "@swooper/mapgen-core/authoring/schema";

export const CrustSchema = Type.Object({});
export function validateCrust(value: unknown): boolean {
  return value !== null;
}

// @filename: mods/example-mod/src/domain/geology/model/schemas/compute-crust.schema.ts
import { Type } from "@swooper/mapgen-core/authoring/schema";

export const ComputeCrustInputSchema = Type.Object({});

// @filename: mods/example-mod/src/domain/geology/model/schemas/direct-typebox.schema.ts
import { Type as SchemaBuilder } from "typebox";

export const DirectSchema = SchemaBuilder.Object({});

// @filename: mods/example-mod/src/domain/geology/model/schemas/artifact-contract.schema.ts
import { Type as SchemaBuilder } from "@swooper/mapgen-core/authoring/contracts";

export const ArtifactContractSchema = SchemaBuilder.Object({});
```

## Ignores Fixture

```typescript
import { type Static, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/schema";

export const CrustSchema = Type.Object({
  maturity: TypedArraySchemas.Float32Array({ cardinality: ["grid"] }),
});
export type Crust = Static<typeof CrustSchema>;

/** Admits one semantic scalar after schema-level structural admission. */
export function admitPositiveRatio(value: number): number {
  if (value <= 0) throw new Error("Ratio must be positive.");
  return value;
}
```
