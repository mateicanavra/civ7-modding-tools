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
    ! $body <: contains `export const Schema = $schema`,
    ! $body <: contains `export const artifact = defineArtifact({ $..., schema: Schema, $... })`,
    ! $body <: contains or {
      `export const validate = defineArtifactValidator(artifact)`,
      `export const validate = defineArtifactValidator(artifact, $local)`
    }
  }
}

program() as $program where {
  $filename <: r".*mods/[^/]+/src/(?:[^/]+/)*artifacts/[^/]+\.artifact\.ts$",
  or {
    lacks_required_artifact_surface($program),
    $program <: contains or {
      import_statement(source=$source) where {
        ! $source <: r"^[\"']?(?:@swooper/mapgen-core/(?:authoring/contracts|lib(?:/[^\"']*)?)|@civ7/(?:types|map-policy)(?:/[^\"']*)?|@mapgen/domain/[^/\"']+(?:/model/(?:schemas|policy|data)(?:/[^\"']*)?)?|\.\./model/(?:schemas|policy|data)/[^\"']+\.js)[\"']?$"
      },
      `import($source)`,
      `import { $... } from "typebox/value"`,
      `import * as $value from "typebox/value"`,
      `Value.Errors($args)`,
      `validateArtifactSchema($args)`,
      `export const $name = $value` where {
        ! $name <: r"^(?:Schema|artifact|validate)$"
      },
      `export let $name = $value`,
      `export var $name = $value`,
      `export function $name($params) { $body }`,
      `export class $name { $body }`,
      `export enum $name { $body }`,
      `export default $value`,
      `export { $exports } from $source`,
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
// @filename: mods/example-mod/src/features/artifacts/missing-schema.artifact.ts
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

// @filename: mods/example-mod/src/features/artifacts/missing-artifact.artifact.ts
import { Type } from "@swooper/mapgen-core/authoring/contracts";

export const Schema = Type.Object({});

// @filename: mods/example-mod/src/features/artifacts/missing-validate.artifact.ts
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

// @filename: mods/example-mod/src/features/artifacts/exported-artifact-authority.artifact.ts
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

// @filename: mods/example-mod/src/features/artifacts/exported-validator-authority.artifact.ts
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

// @filename: mods/example-mod/src/features/artifacts/direct-typebox.artifact.ts
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

// @filename: mods/example-mod/src/features/artifacts/local-issue-type.artifact.ts
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

// @filename: mods/example-mod/src/features/artifacts/semantic-alias.artifact.ts
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

// @filename: mods/example-mod/src/features/artifacts/runtime-behavior.artifact.ts
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

// @filename: mods/example-mod/src/features/artifacts/runtime-class.artifact.ts
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

// @filename: mods/example-mod/src/features/artifacts/runtime-reexport.artifact.ts
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

// @filename: mods/example-mod/src/features/artifacts/runtime-import.artifact.ts
import { readFileSync } from "node:fs";
import {
  defineArtifact,
  defineArtifactValidator,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";

export const Schema = Type.Object({ source: Type.Literal(readFileSync.name) });
export const artifact = defineArtifact({
  name: "runtimeImport",
  id: "artifact:demo.runtimeImport",
  schema: Schema,
});
export const validate = defineArtifactValidator(artifact);

```

## Ignores Fixture

```typescript

// @filename: mods/example-mod/src/features/artifacts/plate-motion.artifact.ts
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
  id: "artifact:foundation.plateMotion",
  schema: Schema,
});
function validateLocal(value: unknown): readonly ArtifactValidationIssue[] {
  return value === null ? [{ message: "Plate motion must be present." }] : [];
}
export const validate = defineArtifactValidator(artifact, validateLocal);

// @filename: mods/example-mod/src/features/artifacts/message-bearing-payload.artifact.ts
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
  id: "artifact:demo.messageBearingPayload",
  schema: Schema,
});
export const validate = defineArtifactValidator(artifact);

// @filename: mods/example-mod/src/features/artifacts.ts
import { artifact as startAssignmentArtifact } from "./artifacts/start-assignment.artifact.js";

export const placementArtifacts = {
  startAssignment: startAssignmentArtifact,
};

// @filename: mods/example-mod/src/features/projection/config.ts
export function validateProjectionArtifact(value: unknown) {
  return value;
}

```
