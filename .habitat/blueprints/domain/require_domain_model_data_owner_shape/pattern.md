---
level: error
---
# Require Domain Model Data Owner Shape

Domain model data files own named reference corpora and their pure derivations.
Relative dependencies remain inside the sibling corpus or the domain's model
schema and policy surfaces; workspace package roles are enforced by the package
graph. Data files do not acquire artifact, operation, recipe, or stage
authority.

```grit
language js(typescript)

or {
  import_statement(source=$source) where {
    $source <: r"^[\"']?\.",
    ! $source <: r"^[\"']?(?:\./[^\"']+|\.\./\.\./(?:schemas|policy)/[^\"']+)[\"']?$"
  },
  import_statement(source=$source) where {
    $source <: r"^[\"']?(?:@swooper/mapgen-core/authoring(?:/.*)?|typebox(?:/.*)?)[\"']?$"
  },
  import_statement(source=$source) as $import where {
    $source <: r"^[\"']?\.\./\.\./schemas/[^\"']+[\"']?$",
    ! $import <: includes "import type"
  },
  or {
    `export { $exports } from $source`,
    `export type { $exports } from $source`,
    `export * from $source`
  } where {
    $source <: r"^[\"']?\.\./\.\./schemas/[^\"']+[\"']?$"
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
import { defineArtifact } from "@swooper/mapgen-core/authoring/contracts";

export const corpusArtifact = defineArtifact({
  name: "corpus",
  id: "artifact:materials.corpus",
  schema: {},
});

// @filename: mods/example-mod/src/domain/materials/model/data/reference/schema-value.ts
import { ResourceFamilySchema } from "../../schemas/resource-family.schema.js";

export const RESOURCE_SCHEMA = ResourceFamilySchema;

// @filename: mods/example-mod/src/domain/materials/model/data/reference/aliased-validator.ts
import { Value as StructuralValidation } from "typebox/value";

export const validateRows = (value: unknown) => StructuralValidation.Check({}, value);
```

## Ignores Fixture

```typescript
import { OFFICIAL_RESOURCE_CORPUS } from "@example/static-policy";
import type { ResourceFamily } from "../../schemas/resource-family.schema.js";
import { resolveResourcePolicy } from "../../policy/resource-policy.js";
import type { CorpusRow } from "./types.js";

/** Derives named corpus rows while keeping artifact admission elsewhere. */
export const rows: readonly CorpusRow[] = OFFICIAL_RESOURCE_CORPUS.map((entry) => ({
  family: resolveResourcePolicy(entry) as ResourceFamily,
  type: entry.resourceType,
}));
```
