---
level: error
---
# Require Artifact File Shape

An artifact owner exports one canonical `artifact`. Its private schema and
optional private refinement are composed by `defineArtifact`, which owns the
complete structural and semantic admission function.

```grit
language js(typescript)

predicate lacks_required_artifact_surface($body) {
  or {
    ! $body <: contains `import { $..., defineArtifact, $... } from "@swooper/mapgen-core/authoring/contracts"`,
    ! $body <: contains `const Schema = $schema`,
    ! $body <: contains `export const artifact = defineArtifact({ $..., schema: Schema, $... })`
  }
}

or {
  program(statements=$body) where {
    lacks_required_artifact_surface($body)
  },
  import_statement(source=$source) where {
    ! $source <: r"^[\"']?(?:@swooper/mapgen-core/(?:authoring/contracts|lib(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*)|@civ7/(?:types|map-policy)|@mapgen/domain/[a-z0-9]+(?:-[a-z0-9]+)*|(?:\.\./)+(?:atoms/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*\.schema)|policy/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*))\.js|(?:\.\./)+model/(?:schemas/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*(?:\.schema)?)|policy/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*))\.js)[\"']?$"
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
        ! $export <: `export const artifact = defineArtifact({ $..., schema: Schema, $... })`
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
// @filename: mods/example-mod/src/domain/geology/artifacts/missing-schema.artifact.ts
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";

const LocalSchema = Type.Object({});
export const artifact = defineArtifact({
  name: "missingSchema",
  id: "artifact:geology.missingSchema",
  schema: LocalSchema,
});

// @filename: mods/example-mod/src/domain/geology/artifacts/alternate-runtime-export.artifact.ts
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";

const Schema = Type.Object({});
export const artifact = defineArtifact({
  name: "alternateRuntimeExport",
  id: "artifact:geology.alternateRuntimeExport",
  schema: Schema,
});
export const runMutation = () => undefined;

// @filename: mods/example-mod/src/domain/geology/artifacts/direct-typebox.artifact.ts
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import { Value } from "typebox/value";

const Schema = Type.Object({});
export const artifact = defineArtifact({
  name: "directTypebox",
  id: "artifact:geology.directTypebox",
  schema: Schema,
  refine: (value) => Array.from(Value.Errors(Schema, value)),
});

// @filename: mods/example-mod/src/domain/geology/artifacts/private-operation-contract.artifact.ts
import Contract from "../ops/classify-surface/config.js";
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
// @filename: mods/example-mod/src/domain/geology/artifacts/strata.artifact.ts
import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  defineArtifact,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";

const Schema = Type.Object(
  {
    layerCount: Type.Number({ description: "Number of admitted geological layers." }),
  },
  { additionalProperties: false, description: "Published geological strata." }
);

/** Publishes admitted geological strata for downstream domain operations. */
export const artifact = defineArtifact({
  name: "strata",
  id: "artifact:geology.strata",
  schema: Schema,
  refine: validateLocal,
});

function validateLocal(
  value: unknown,
  _context?: ArtifactValidationContext
): readonly ArtifactValidationIssue[] {
  const layerCount = (value as { layerCount: number }).layerCount;
  return layerCount > 0 ? [] : [{ message: "layerCount must be positive" }];
}
```
