---
level: error
---
# Require Artifact File Shape

Artifact owner files expose one stable contract API. Core binds every complete
validator to the exact artifact schema; owners may contribute only local
cardinality, relational, or domain checks through that constructor.

```grit
language js(typescript)

predicate lacks_required_artifact_surface($body) {
  or {
    ! $body <: contains `import { $..., defineArtifact, $... } from "@swooper/mapgen-core/authoring/contracts"`,
    ! $body <: contains `import { $..., defineArtifactValidator, $... } from "@swooper/mapgen-core/authoring/contracts"`,
    ! $body <: contains `export const Schema = $schema`,
    ! $body <: contains `export const artifact = defineArtifact({ $..., id: $id, $..., schema: Schema, $... })`,
    ! $body <: contains or {
      `export const validate = defineArtifactValidator(artifact)`,
      `export const validate = defineArtifactValidator(artifact, $local)`
    }
  }
}

or {
  program(statements=$body) where {
    lacks_required_artifact_surface($body)
  },
  `export const artifact = defineArtifact({ $..., id: $id, $... })` where {
    ! $id <: r"^[\"']artifact:[^.]+\..+[\"']$"
  },
  `export const artifact = defineArtifact({ $..., id: $id, $... })` where {
    $filename <: r".*mods/[^/]+/src/domain/([^/]+)/artifacts/[^/]+\.artifact\.ts$"($domain_id),
    $id <: r"^[\"']artifact:([^.]+)\..+[\"']$"($artifact_domain),
    ! $artifact_domain <: $domain_id
  },
  import_statement(source=$source) where {
    ! $source <: r"^[\"']?(?:@swooper/mapgen-core/authoring/contracts|\.\./model/(?:schemas|policy|data)/[^\"']+\.js)[\"']?$"
  },
  program(statements=$body) where {
    $body <: contains or {
      `import($source)`,
      `import { $... } from "typebox/value"`,
      `import * as $value from "typebox/value"`,
      `Value.Errors($args)`,
      `validateArtifactSchema($args)`,
      export_statement(declaration=$declaration) as $export where {
        $declaration <: or {
          lexical_declaration(),
          variable_declaration(),
          function_declaration(),
          class_declaration(),
          enum_declaration()
        },
        ! $export <: or {
          `export const Schema = $schema`,
          `export const artifact = defineArtifact({ $..., schema: Schema, $... })`,
          `export const validate = defineArtifactValidator(artifact)`,
          `export const validate = defineArtifactValidator(artifact, $local)`
        }
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
      },
      `export { artifact as $name }` where {
        $name <: r".+Artifact$"
      }
    }
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/example-mod/src/domain/geology/artifacts/missing-schema.artifact.ts
import {
  defineArtifact,
  defineArtifactValidator,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";

const LocalSchema = Type.Object({});
export const artifact = defineArtifact({
  name: "missingSchema",
  id: "artifact:demo.missingSchema",
  schema: LocalSchema,
});
export const validate = defineArtifactValidator(artifact);

// @filename: mods/example-mod/src/domain/geology/artifacts/missing-artifact.artifact.ts
import { Type } from "@swooper/mapgen-core/authoring/contracts";

export const Schema = Type.Object({});

// @filename: mods/example-mod/src/domain/geology/artifacts/missing-validate.artifact.ts
import {
  defineArtifact,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";

export const Schema = Type.Object({});
export const artifact = defineArtifact({
  name: "missingValidate",
  id: "artifact:demo.missingValidate",
  schema: Schema,
});

// @filename: mods/example-mod/src/domain/geology/artifacts/exported-artifact-authority.artifact.ts
import {
  defineArtifact,
  defineArtifactValidator,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";

export const Schema = Type.Object({});
export const artifact = defineArtifact({
  name: "additionalArtifactAuthority",
  id: "artifact:demo.additionalArtifactAuthority",
  schema: Schema,
});
export const shadowArtifact = defineArtifact({
  name: "shadowArtifactAuthority",
  id: "artifact:demo.shadowArtifactAuthority",
  schema: Schema,
});
export const validate = defineArtifactValidator(artifact);

// @filename: mods/example-mod/src/domain/geology/artifacts/exported-validator-authority.artifact.ts
import {
  defineArtifact,
  defineArtifactValidator,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";

export const Schema = Type.Object({});
export const artifact = defineArtifact({
  name: "additionalValidatorAuthority",
  id: "artifact:demo.additionalValidatorAuthority",
  schema: Schema,
});
export const validate = defineArtifactValidator(artifact);
export const shadowValidate = defineArtifactValidator(artifact);

// @filename: mods/example-mod/src/domain/geology/artifacts/direct-typebox.artifact.ts
import {
  defineArtifact,
  defineArtifactValidator,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";
import { Value } from "typebox/value";

export const Schema = Type.Object({});
export const artifact = defineArtifact({
  name: "directTypebox",
  id: "artifact:demo.directTypebox",
  schema: Schema,
});
const validateLocal = (value: unknown) => Array.from(Value.Errors(Schema, value));
export const validate = defineArtifactValidator(artifact, validateLocal);

// @filename: mods/example-mod/src/domain/geology/artifacts/local-issue-type.artifact.ts
import {
  defineArtifact,
  defineArtifactValidator,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";

export const Schema = Type.Object({});
export const artifact = defineArtifact({
  name: "localIssueType",
  id: "artifact:demo.localIssueType",
  schema: Schema,
});
type ValidationIssue = Readonly<{ message: string }>;
const validateLocal = (): ValidationIssue[] => [];
export const validate = defineArtifactValidator(artifact, validateLocal);

// @filename: mods/example-mod/src/domain/geology/artifacts/semantic-alias.artifact.ts
import {
  defineArtifact,
  defineArtifactValidator,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";

export const Schema = Type.Object({});
export const artifact = defineArtifact({
  name: "semanticAlias",
  id: "artifact:demo.semanticAlias",
  schema: Schema,
});
export const validate = defineArtifactValidator(artifact);
export const semanticAliasArtifact = artifact;

// @filename: mods/example-mod/src/domain/geology/artifacts/runtime-behavior.artifact.ts
import {
  defineArtifact,
  defineArtifactValidator,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";

export const Schema = Type.Object({});
export const artifact = defineArtifact({
  name: "runtimeBehavior",
  id: "artifact:demo.runtimeBehavior",
  schema: Schema,
});
export const validate = defineArtifactValidator(artifact);
export const runMutation = () => undefined;
export async function loadArtifactState() {}
export function* iterateArtifactState() {}
export { artifact as artifactAlias };
export default class ArtifactDefaultAuthority {}

// @filename: mods/example-mod/src/domain/geology/artifacts/runtime-class.artifact.ts
import {
  defineArtifact,
  defineArtifactValidator,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";

export const Schema = Type.Object({});
export const artifact = defineArtifact({
  name: "runtimeClass",
  id: "artifact:demo.runtimeClass",
  schema: Schema,
});
export const validate = defineArtifactValidator(artifact);
export class ArtifactRuntime {}

// @filename: mods/example-mod/src/domain/geology/artifacts/runtime-reexport.artifact.ts
import {
  defineArtifact,
  defineArtifactValidator,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";

export const Schema = Type.Object({});
export const artifact = defineArtifact({
  name: "runtimeReexport",
  id: "artifact:demo.runtimeReexport",
  schema: Schema,
});
export const validate = defineArtifactValidator(artifact);
export { runArtifact } from "../runtime.js";

// @filename: mods/example-mod/src/domain/geology/artifacts/private-operation-contract.artifact.ts
import Contract from "../ops/classify-surface/contract.js";
import {
  defineArtifact,
  defineArtifactValidator,
} from "@swooper/mapgen-core/authoring/contracts";

export const Schema = Contract.output;
export const artifact = defineArtifact({
  name: "privateOperationContract",
  id: "artifact:demo.privateOperationContract",
  schema: Schema,
});
export const validate = defineArtifactValidator(artifact);

// @filename: mods/example-mod/src/domain/geology/artifacts/external-runtime.artifact.ts
import { readFile } from "node:fs/promises";
import {
  defineArtifact,
  defineArtifactValidator,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";

export const Schema = Type.Object({});
export const artifact = defineArtifact({
  name: "externalRuntime",
  id: "artifact:geology.externalRuntime",
  schema: Schema,
});
const readRuntime = readFile;
export const validate = defineArtifactValidator(artifact);

// @filename: mods/example-mod/src/domain/geology/artifacts/cross-domain-private.artifact.ts
import { PRIVATE_POLICY } from "@mapgen/domain/hydrology/model/policy/private.js";
import {
  defineArtifact,
  defineArtifactValidator,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";

export const Schema = Type.Object({ policy: Type.Literal(PRIVATE_POLICY) });
export const artifact = defineArtifact({
  name: "crossDomainPrivate",
  id: "artifact:geology.crossDomainPrivate",
  schema: Schema,
});
export const validate = defineArtifactValidator(artifact);

// @filename: mods/example-mod/src/domain/geology/artifacts/wrong-domain.artifact.ts
import {
  defineArtifact,
  defineArtifactValidator,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";

export const Schema = Type.Object({});
export const artifact = defineArtifact({
  name: "wrongDomain",
  id: "artifact:atmosphere.wrongDomain",
  schema: Schema,
});
export const validate = defineArtifactValidator(artifact);

```

## Ignores Fixture

```typescript

// @filename: mods/example-mod/src/domain/geology/artifacts/plate-motion.artifact.ts
import type { ArtifactValidationIssue } from "@swooper/mapgen-core/authoring/contracts";
import {
  defineArtifact,
  defineArtifactValidator,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";

export const Schema = Type.Object({ value: Type.Number() });
export type Artifact = unknown;
export const artifact = defineArtifact({
  name: "plateMotion",
  id: "artifact:geology.plateMotion",
  schema: Schema,
});
function validateLocal(value: unknown): readonly ArtifactValidationIssue[] {
  return value === null ? [{ message: "Plate motion must be present." }] : [];
}
export const validate = defineArtifactValidator(artifact, validateLocal);

// @filename: mods/example-mod/src/domain/geology/artifacts/message-bearing-payload.artifact.ts
import {
  defineArtifact,
  defineArtifactValidator,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";

type ArtifactMetadata = { message: string };
export const Schema = Type.Object({ message: Type.String() });
export type Artifact = ArtifactMetadata;
export const artifact = defineArtifact({
  name: "messageBearingPayload",
  id: "artifact:geology.messageBearingPayload",
  schema: Schema,
});
export const validate = defineArtifactValidator(artifact);

```
