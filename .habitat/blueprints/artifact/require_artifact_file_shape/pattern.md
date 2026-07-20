---
level: error
---
# Require Artifact File Shape

Artifact owner files expose a stable contract API. The file-specific artifact
name belongs in the `defineArtifact(...)` payload and in registry imports, not
in exported validation/assertion/helper names.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/.*/artifacts/[^/]+\.artifact\.ts$",
    ! $body <: contains `export const Schema = $schema`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/.*/artifacts/[^/]+\.artifact\.ts$",
    ! $body <: contains `export const artifact = defineArtifact($definition)`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/.*/artifacts/[^/]+\.artifact\.ts$",
    ! $body <: contains `export function validate($params) { $validatorBody }`,
    ! $body <: contains `export function validate($params): $returnType { $validatorBody }`,
    ! $body <: contains `export const validate = $validator`
  },
  `export function $name($params) { $body }` where {
    $filename <: r".*mods/mod-swooper-maps/src/.*/artifacts/[^/]+\.artifact\.ts$",
    $name <: r"^(?:validate|assert)[A-Z].*"
  },
  `export const $name = $validator` where {
    $filename <: r".*mods/mod-swooper-maps/src/.*/artifacts/[^/]+\.artifact\.ts$",
    $name <: r"^(?:validate|assert)[A-Z].*"
  },
  `export const $name = artifact` where {
    $filename <: r".*mods/mod-swooper-maps/src/.*/artifacts/[^/]+\.artifact\.ts$",
    $name <: r".+Artifact$"
  },
  `export { artifact as $name }` where {
    $filename <: r".*mods/mod-swooper-maps/src/.*/artifacts/[^/]+\.artifact\.ts$",
    $name <: r".+Artifact$"
  },
  `export const $name = defineArtifact($definition)` where {
    $filename <: r".*mods/mod-swooper-maps/src/.*/artifacts/[^/]+\.artifact\.ts$",
    ! $name <: r"^artifact$"
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/.*/artifacts/contract/.*\.(?:artifact|contract)\.ts$"
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/foundation/artifacts/missing-schema.artifact.ts
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";

export const artifact = defineArtifact({
  name: "missingSchema",
  id: "artifact:demo.missingSchema",
  schema: Type.Object({}),
});
export function validate(value: unknown) {
  return [];
}

// @filename: mods/mod-swooper-maps/src/domain/foundation/artifacts/missing-artifact.artifact.ts
import { Type } from "@swooper/mapgen-core/authoring/contracts";

export const Schema = Type.Object({});
export function validate(value: unknown) {
  return [];
}

// @filename: mods/mod-swooper-maps/src/domain/foundation/artifacts/missing-validate.artifact.ts
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";

export const Schema = Type.Object({});
export const artifact = defineArtifact({
  name: "missingValidate",
  id: "artifact:demo.missingValidate",
  schema: Schema,
});

// @filename: mods/mod-swooper-maps/src/domain/foundation/artifacts/semantic-validator.artifact.ts
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";

export const Schema = Type.Object({});
export const artifact = defineArtifact({
  name: "semanticValidator",
  id: "artifact:demo.semanticValidator",
  schema: Schema,
});
export function validateSemanticValidatorArtifact(value: unknown) {
  return [];
}

// @filename: mods/mod-swooper-maps/src/domain/foundation/artifacts/semantic-validator-const.artifact.ts
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";

export const Schema = Type.Object({});
export const artifact = defineArtifact({
  name: "semanticValidatorConst",
  id: "artifact:demo.semanticValidatorConst",
  schema: Schema,
});
export const validateSemanticValidatorArtifact = (value: unknown) => [];

// @filename: mods/mod-swooper-maps/src/domain/foundation/artifacts/semantic-alias.artifact.ts
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";

export const Schema = Type.Object({});
export const artifact = defineArtifact({
  name: "semanticAlias",
  id: "artifact:demo.semanticAlias",
  schema: Schema,
});
export const semanticAliasArtifact = artifact;

// @filename: mods/mod-swooper-maps/src/domain/foundation/artifacts/exported-semantic-alias.artifact.ts
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";

export const Schema = Type.Object({});
export const artifact = defineArtifact({
  name: "exportedSemanticAlias",
  id: "artifact:demo.exportedSemanticAlias",
  schema: Schema,
});
export { artifact as exportedSemanticAliasArtifact };

// @filename: mods/mod-swooper-maps/src/domain/foundation/artifacts/semantic-artifact.artifact.ts
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";

export const Schema = Type.Object({});
export const semanticArtifact = defineArtifact({
  name: "semanticArtifact",
  id: "artifact:demo.semanticArtifact",
  schema: Schema,
});

// @filename: mods/mod-swooper-maps/src/domain/foundation/artifacts/contract/legacy.contract.ts
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";

export const Schema = Type.Object({});
export const artifact = defineArtifact({
  name: "legacy",
  id: "artifact:demo.legacy",
  schema: Schema,
});
```

## Ignores Fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/foundation/artifacts/plate-motion.artifact.ts
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";

export const Schema = Type.Object({});
export type Artifact = unknown;
export const artifact = defineArtifact({
  name: "plateMotion",
  id: "artifact:foundation.plateMotion",
  schema: Schema,
});
export function validate(value: unknown) {
  return [];
}
export function assert(value: unknown) {
  return value;
}

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/placement/artifacts/start-assignment.artifact.ts
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";

export const StartAssignmentArtifactSchema = Type.Object({});
export const Schema = StartAssignmentArtifactSchema;
export const artifact = defineArtifact({
  name: "startAssignment",
  id: "artifact:placement.startAssignment",
  schema: Schema,
});
export function validate(value: unknown) {
  return [];
}

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/placement/artifacts.ts
import { artifact as startAssignmentArtifact } from "./artifacts/start-assignment.artifact.js";

export const placementArtifacts = {
  startAssignment: startAssignmentArtifact,
};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation-projection/steps/projection/config.ts
export function validateProjectionArtifact(value: unknown) {
  return value;
}
```
