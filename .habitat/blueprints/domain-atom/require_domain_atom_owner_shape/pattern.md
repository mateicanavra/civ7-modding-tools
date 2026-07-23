---
level: error
---
# Require Domain Atom Owner Shape

Domain model atoms are small schema primitives, cohesive subentities, derived
types, and stable identities that give a domain concept shared language. They
are composition parts, not complete containers: a whole artifact payload or
operation input/output envelope must remain local to its artifact or contract
owner rather than being moved wholesale into an atom. Root atoms depend only
on sibling atoms and schema substrates. Direct-module atoms may additionally
reuse atoms from their exact ancestor domain model; root atoms never reach down
into modules. Workspace package roles are enforced by the package graph. Atom
files do not own artifact setup, artifact admission, operation or recipe
authoring, structural validation projection, or stage configuration.

```grit
language js(typescript)

predicate disallowed_root_atom_dependency($source) {
  ! $source <: r"^[\"']?(?:@swooper/mapgen-core/authoring/schema|type-fest|\./[^\"']+)[\"']?$"
}

predicate disallowed_module_atom_dependency($source) {
  ! $source <: r"^[\"']?(?:@swooper/mapgen-core/authoring/schema|type-fest|\./[^\"']+|(?:\.\./){4}model/atoms/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*\.schema)\.js)[\"']?$"
}

or {
  import_statement(source=$source) where {
    $filename <: r".*mods/[^/]+/src/domain/[^/]+/model/atoms/[^/]+\.ts$",
    disallowed_root_atom_dependency($source)
  },
  import_statement(source=$source) where {
    $filename <: r".*mods/[^/]+/src/domain/[^/]+/modules/[^/]+/model/atoms/[^/]+\.ts$",
    disallowed_module_atom_dependency($source)
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
// @filename: mods/example-mod/src/domain/geology/model/atoms/crust.schema.ts
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";

export const CrustSchema = Type.Object({});
export const artifact = defineArtifact({
  name: "crust",
  id: "artifact:geology.crust",
  schema: CrustSchema,
});

// @filename: mods/example-mod/src/domain/geology/model/atoms/crust.schema.ts
import { Type } from "@swooper/mapgen-core/authoring/schema";

export const CrustSchema = Type.Object({});
export function validateCrust(value: unknown): boolean {
  return value !== null;
}

// @filename: mods/example-mod/src/domain/geology/model/atoms/compute-crust.schema.ts
import { Type } from "@swooper/mapgen-core/authoring/schema";

export const ComputeCrustInputSchema = Type.Object({});

// @filename: mods/example-mod/src/domain/geology/model/atoms/direct-typebox.schema.ts
import { Type as SchemaBuilder } from "typebox";

export const DirectSchema = SchemaBuilder.Object({});

// @filename: mods/example-mod/src/domain/geology/model/atoms/artifact-contract.schema.ts
import { Type as SchemaBuilder } from "@swooper/mapgen-core/authoring/contracts";

export const ArtifactContractSchema = SchemaBuilder.Object({});
```

## Ignores Fixture

```typescript
import { type Static, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/schema";

/** One plate subentity composed by multiple owner-local contracts and artifacts. */
export const PlateSchema = Type.Object({
  id: Type.Integer({ minimum: 0 }),
  centerX: Type.Number(),
  centerY: Type.Number(),
  velocity: TypedArraySchemas.f32({ cardinality: 2 }),
});
export type Plate = Static<typeof PlateSchema>;
```
