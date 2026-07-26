---
level: error
---
# Require Artifact File Shape

An artifact owner exports one canonical `artifact`. Its complete payload schema
is a direct inline `Type.*(...)` expression inside `defineArtifact`; imported
model atoms may compose smaller fields inside that root but never stand in for
the complete container. Any optional refinement is an inline arrow function on
the same definition. The artifact authority therefore visibly owns identity,
structure, and complete semantic admission without detached local authorities.

```grit
language js(typescript)

predicate lacks_required_artifact_surface($body) {
  or {
    ! $body <: contains `import { $..., defineArtifact, $... } from "@swooper/mapgen-core/authoring/contracts"`,
    ! $body <: contains `export const artifact = defineArtifact({ $..., schema: $schema, $... })`
  }
}

predicate is_type_schema_expression($value) {
  $value <: `Type.$constructor($args)`
}

predicate is_inline_artifact_refinement($value) {
  $value <: arrow_function()
}

predicate disallowed_public_artifact_dependency($source) {
  ! $source <: r"^[\"']?(?:@swooper/mapgen-core/(?:authoring/contracts|lib(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*)|@civ7/(?:types|map-policy)|@mapgen/domain/[a-z0-9]+(?:-[a-z0-9]+)*)[\"']?$"
}

predicate disallowed_domain_module_artifact_dependency($source) {
  ! $source <: r"^[\"']?(?:@swooper/mapgen-core/(?:authoring/contracts|lib(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*)|@civ7/(?:types|map-policy)|@mapgen/domain/[a-z0-9]+(?:-[a-z0-9]+)*|(?:\.\./model|(?:\.\./){3}model)/(?:atoms/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*\.schema)|policy/[a-z0-9]+(?:-[a-z0-9]+)*)\.js)[\"']?$"
}

or {
  program(statements=$body) where {
    lacks_required_artifact_surface($body)
  },
  program(statements=$body) where {
    $body <: contains `export const artifact = defineArtifact({ $..., schema: $schema, $... })`,
    ! is_type_schema_expression($schema)
  },
  program(statements=$body) where {
    $body <: contains `export const artifact = defineArtifact({ $..., refine: $refine, $... })`,
    ! is_inline_artifact_refinement($refine)
  },
  import_statement(source=$source) where {
    $filename <: r".*mods/[^/]+/src/domain/[^/]+/modules/[^/]+/artifacts/[^/]+\.artifact\.ts$",
    disallowed_domain_module_artifact_dependency($source)
  },
  import_statement(source=$source) where {
    ! $filename <: r".*mods/[^/]+/src/domain/[^/]+/modules/[^/]+/artifacts/[^/]+\.artifact\.ts$",
    disallowed_public_artifact_dependency($source)
  },
  program(statements=$body) where {
    $body <: contains or {
      `import($source)`,
      `import { $... } from "typebox/value"`,
      `import * as $value from "typebox/value"`,
      `Value.Errors($args)`,
      `validateArtifactSchema($args)`,
      `defineArtifactValidator($args)`,
      export_statement(declaration=$declaration) as $export where {
        $declaration <: or {
          lexical_declaration(),
          variable_declaration(),
          function_declaration(),
          class_declaration(),
          enum_declaration()
        },
        ! $export <: `export const artifact = defineArtifact({ $..., schema: $schema, $... })`
      },
      `export namespace $name { $body }`,
      `export default $value`,
      `export { $exports } from $source`,
      `export type { $exports } from $source`,
      `export * from $source`,
      `export { $exports }`,
      `type $name = $definition` where {
        $name <: r"^(?:ArtifactValidationIssue|ValidationIssue)$"
      },
      `interface $name { $body }` where {
        $name <: r"^(?:ArtifactValidationIssue|ValidationIssue)$"
      }
    }
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/example-mod/src/domain/geology/modules/strata/artifacts/missing-schema.artifact.ts
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";

const LocalSchema = Type.Object({});
export const artifact = defineArtifact({
  name: "missingSchema",
  id: "artifact:geology.missingSchema",
});

// @filename: mods/example-mod/src/domain/geology/modules/strata/artifacts/alternate-runtime-export.artifact.ts
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";

const Schema = Type.Object({});
export const artifact = defineArtifact({
  name: "alternateRuntimeExport",
  id: "artifact:geology.alternateRuntimeExport",
  schema: Schema,
});
export const runMutation = () => undefined;

// @filename: mods/example-mod/src/domain/geology/modules/strata/artifacts/direct-typebox.artifact.ts
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import { Value } from "typebox/value";

const Schema = Type.Object({});
export const artifact = defineArtifact({
  name: "directTypebox",
  id: "artifact:geology.directTypebox",
  schema: Schema,
  refine: (value) => Array.from(Value.Errors(Schema, value)),
});

// @filename: mods/example-mod/src/domain/geology/modules/strata/artifacts/imported-payload.artifact.ts
import { defineArtifact } from "@swooper/mapgen-core/authoring/contracts";
import { StrataSchema } from "../model/atoms/strata.schema.js";

export const artifact = defineArtifact({
  name: "importedPayload",
  id: "artifact:geology.importedPayload",
  schema: StrataSchema,
});

// @filename: mods/example-mod/src/domain/geology/modules/strata/artifacts/private-operation-contract.artifact.ts
import Contract from "../ops/classify-surface/contract.js";
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";

const Schema = Type.Object({});
export const artifact = defineArtifact({
  name: "privateOperationContract",
  id: "artifact:geology.privateOperationContract",
  schema: Schema,
});
```

## Ignores Fixture

```typescript
// @filename: mods/example-mod/src/domain/geology/modules/strata/artifacts/strata.artifact.ts
import {
  type ArtifactValidationIssue,
  defineArtifact,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";

type Strata = Readonly<{ layerCount: number }>;

/** Publishes admitted geological strata for downstream domain operations. */
export const artifact = defineArtifact({
  name: "strata",
  id: "artifact:geology.strata",
  schema: Type.Object(
    {
      layerCount: Type.Number({ description: "Number of admitted geological layers." }),
    },
    { additionalProperties: false, description: "Published geological strata." }
  ),
  refine: (value): readonly ArtifactValidationIssue[] => {
    const layerCount = (value as Strata).layerCount;
    return layerCount > 0 ? [] : [{ message: "layerCount must be positive" }];
  },
});

// @filename: mods/example-mod/src/domain/geology/modules/strata/artifacts/plate-network.artifact.ts
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import { PlateSchema } from "../model/atoms/plate.schema.js";

/** Publishes a plate network whose complete payload remains owned here. */
export const artifact = defineArtifact({
  name: "plateNetwork",
  id: "artifact:geology.plateNetwork",
  schema: Type.Object({
    plates: Type.Array(PlateSchema),
    activePlateCount: Type.Integer({ minimum: 0 }),
  }),
});
```
