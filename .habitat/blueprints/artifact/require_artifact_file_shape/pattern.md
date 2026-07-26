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

predicate is_canonical_artifact_contract_import($import) {
  or {
    $import <: `import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts"`,
    $import <: `import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts"`,
    $import <: `import { defineArtifact, type Static, Type } from "@swooper/mapgen-core/authoring/contracts"`,
    $import <: `import { defineArtifact, type Static, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts"`
  }
}

predicate has_canonical_artifact_contract_import($body) {
  $body <: contains import_statement() as $import where {
    is_canonical_artifact_contract_import($import)
  }
}

predicate lacks_required_artifact_surface($body) {
  or {
    ! has_canonical_artifact_contract_import($body),
    ! $body <: contains `export const artifact = defineArtifact({ $..., schema: $schema, $... })`
  }
}

predicate is_type_schema_expression($value) {
  $value <: `Type.$constructor($args)`
}

predicate is_inline_artifact_refinement($value) {
  $value <: arrow_function()
}

predicate disallowed_artifact_dependency($source) {
  ! $source <: r"^[\"']?(?:@swooper/mapgen-core/lib/[a-z0-9]+(?:-[a-z0-9]+)*(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*|@civ7/(?:types|map-policy)|(?:\.\./model|(?:\.\./){3}model)/(?:atoms|policy)/(?:index|[a-z0-9]+(?:[.-][a-z0-9]+)*)\.js)[\"']?$"
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
  import_statement(source=$source) as $import where {
    $source <: r"^[\"']?@swooper/mapgen-core/authoring/contracts[\"']?$",
    ! is_canonical_artifact_contract_import($import)
  },
  import_statement(source=$source) where {
    ! $source <: r"^[\"']?@swooper/mapgen-core/authoring/contracts[\"']?$",
    disallowed_artifact_dependency($source)
  },
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
  program(statements=$body) where {
    $body <: contains or {
      `import($source)`,
      `export namespace $name { $body }`,
      `export default $value`,
      `export { $exports } from $source`,
      `export type { $exports } from $source`,
      `export * from $source`,
      `export { $exports }`
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

export const artifact = defineArtifact({
  name: "alternateRuntimeExport",
  id: "artifact:geology.alternateRuntimeExport",
  schema: Type.Object({}),
});
export const runMutation = () => undefined;

// @filename: mods/example-mod/src/domain/geology/modules/strata/artifacts/detached-refinement.artifact.ts
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";

const validateStrata = (value: { layerCount: number }) => value.layerCount > 0;
export const artifact = defineArtifact({
  name: "detachedRefinement",
  id: "artifact:geology.detachedRefinement",
  schema: Type.Object({ layerCount: Type.Integer({ minimum: 1 }) }),
  refine: validateStrata,
});

// @filename: mods/example-mod/src/domain/geology/modules/strata/artifacts/imported-payload.artifact.ts
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import { StrataSchema } from "../model/atoms/strata.schema.js";

export const artifact = defineArtifact({
  name: "importedPayload",
  id: "artifact:geology.importedPayload",
  schema: StrataSchema,
});

// @filename: mods/example-mod/src/domain/geology/modules/strata/artifacts/forbidden-framework.artifact.ts
import { createArtifactRuntime } from "@swooper/mapgen-core/authoring";
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";

export const artifact = defineArtifact({
  name: "forbiddenFramework",
  id: "artifact:geology.forbiddenFramework",
  schema: Type.Object({}),
  refine: (_value, { issues }) => {
    if (createArtifactRuntime) issues.add("Artifact owners do not construct framework runtimes.");
  },
});

// @filename: mods/example-mod/src/domain/geology/modules/strata/artifacts/private-operation-contract.artifact.ts
import Contract from "../ops/classify-surface/contract.js";
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";

export const artifact = defineArtifact({
  name: "privateOperationContract",
  id: "artifact:geology.privateOperationContract",
  schema: Type.Object({ contract: Type.Unknown({ default: Contract }) }),
});
```

## Ignores Fixture

```typescript
// @filename: mods/example-mod/src/domain/geology/modules/strata/artifacts/strata.artifact.ts
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";

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
  refine: (value, { issues }) => {
    if (value.layerCount <= 0) issues.add("layerCount must be positive");
  },
});

// @filename: mods/example-mod/src/domain/geology/modules/strata/artifacts/plate-network.artifact.ts
import {
  defineArtifact,
  type Static,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";
import { clampFinite } from "@swooper/mapgen-core/lib/math";
import { MAP_POLICY } from "@civ7/map-policy";
import { PlateSchema } from "../model/atoms/plate.schema.js";
import { STRATA_POLICY } from "../../../model/policy/strata-policy.js";

/** Publishes a plate network whose complete payload remains owned here. */
export const artifact = defineArtifact({
  name: "plateNetwork",
  id: "artifact:geology.plateNetwork",
  schema: Type.Object({
    plates: Type.Array(PlateSchema),
    activity: TypedArraySchemas.f32({ cardinality: "map-grid" }),
    activePlateCount: Type.Integer({
      minimum: clampFinite(STRATA_POLICY.minimumActivePlates, 0, MAP_POLICY.maxPlateCount),
    }),
  }),
});

type PlateNetwork = Static<typeof artifact.schema>;
const _plateNetworkTypeWitness: PlateNetwork | undefined = undefined;
```
