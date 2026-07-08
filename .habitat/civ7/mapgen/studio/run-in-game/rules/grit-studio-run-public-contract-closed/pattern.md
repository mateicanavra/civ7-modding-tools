---
level: error
---
# Grit Studio Run Public Contract Closed

Packet 1 keeps `PublicRunStatus` as a closed public DTO and routes private
diagnostics through explicit lookup. Public status must not grow open payload
fields, raw result/error slots, attribution/proof sections, or private
diagnostics sections.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    ! $body <: contains `export const publicRunStatusTypeSchema = Type.Union($variants)`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    ! $body <: contains `export const operationStatusTypeSchema = publicRunStatusTypeSchema`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    ! $body <: contains `const requestIdInputSchema = contractSchema($schema, { cleanUnknownProperties: false })`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    ! $body <: contains `diagnosticsId: Type.String({ minLength: 1 })`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    ! $body <: contains `diagnosticsLookupResultSchema`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/StudioOperationRuntime\.ts$",
    ! $body <: contains `runInGameDiagnostics: (input) =>
        lookupRunDiagnostics(input.diagnosticsId, { workspaceRoot: runInGameWorkspaceRoot })`
  },
  `export const publicRunStatusTypeSchema = Type.Object($fields, $options)` where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$"
  },
  `export const publicRunStatusTypeSchema = Type.Intersect($schemas)` where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$"
  },
  `Type.Unknown()` as $match where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    $match <: within `export const publicRunStatusTypeSchema = Type.Union($variants)`
  },
  `Type.Any()` as $match where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    $match <: within `export const publicRunStatusTypeSchema = Type.Union($variants)`
  },
  `Type.Record($key, $value)` as $match where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    $match <: within `export const publicRunStatusTypeSchema = Type.Union($variants)`
  },
  `details: $value` as $match where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    $match <: within `export const publicRunStatusTypeSchema = Type.Union($variants)`
  },
  `error: $value` as $match where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    $match <: within `export const publicRunStatusTypeSchema = Type.Union($variants)`
  },
  `result: $value` as $match where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    $match <: within `export const publicRunStatusTypeSchema = Type.Union($variants)`
  },
  `diagnostics: $value` as $match where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    $match <: within `export const publicRunStatusTypeSchema = Type.Union($variants)`
  },
  `sections: $value` as $match where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    $match <: within `export const publicRunStatusTypeSchema = Type.Union($variants)`
  },
  `sourceSnapshot: $value` as $match where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    $match <: within `export const publicRunStatusTypeSchema = Type.Union($variants)`
  },
  `materialization: $value` as $match where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    $match <: within `export const publicRunStatusTypeSchema = Type.Union($variants)`
  },
  `exactAuthorshipProof: $value` as $match where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    $match <: within `export const publicRunStatusTypeSchema = Type.Union($variants)`
  },
  `attribution: $value` as $match where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    $match <: within `export const publicRunStatusTypeSchema = Type.Union($variants)`
  },
  `launchEnvelope: $value` as $match where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    $match <: within `export const publicRunStatusTypeSchema = Type.Union($variants)`
  },
  `resolvedLaunchSource: $value` as $match where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    $match <: within `export const publicRunStatusTypeSchema = Type.Union($variants)`
  },
  `generationManifest: $value` as $match where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    $match <: within `export const publicRunStatusTypeSchema = Type.Union($variants)`
  },
  `runCorrelation: $value` as $match where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    $match <: within `export const publicRunStatusTypeSchema = Type.Union($variants)`
  },
  `runArtifactId: $value` as $match where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    $match <: within `export const publicRunStatusTypeSchema = Type.Union($variants)`
  },
  `details: $value` as $match where {
    $filename <: r".*packages/studio-server/src/operationRuntime/projection\.ts$",
    $match <: within `export function projectRunInGame($args) { $body }`
  },
  `error: $value` as $match where {
    $filename <: r".*packages/studio-server/src/operationRuntime/projection\.ts$",
    $match <: within `export function projectRunInGame($args) { $body }`
  },
  `result: $value` as $match where {
    $filename <: r".*packages/studio-server/src/operationRuntime/projection\.ts$",
    $match <: within `export function projectRunInGame($args) { $body }`
  },
  `diagnostics: $value` as $match where {
    $filename <: r".*packages/studio-server/src/operationRuntime/projection\.ts$",
    $match <: within `export function projectRunInGame($args) { $body }`
  },
  `sections: $value` as $match where {
    $filename <: r".*packages/studio-server/src/operationRuntime/projection\.ts$",
    $match <: within `export function projectRunInGame($args) { $body }`
  },
  `sourceSnapshot: $value` as $match where {
    $filename <: r".*packages/studio-server/src/operationRuntime/projection\.ts$",
    $match <: within `export function projectRunInGame($args) { $body }`
  },
  `materialization: $value` as $match where {
    $filename <: r".*packages/studio-server/src/operationRuntime/projection\.ts$",
    $match <: within `export function projectRunInGame($args) { $body }`
  },
  `exactAuthorshipProof: $value` as $match where {
    $filename <: r".*packages/studio-server/src/operationRuntime/projection\.ts$",
    $match <: within `export function projectRunInGame($args) { $body }`
  },
  `attribution: $value` as $match where {
    $filename <: r".*packages/studio-server/src/operationRuntime/projection\.ts$",
    $match <: within `export function projectRunInGame($args) { $body }`
  },
  `launchEnvelope: $value` as $match where {
    $filename <: r".*packages/studio-server/src/operationRuntime/projection\.ts$",
    $match <: within `export function projectRunInGame($args) { $body }`
  },
  `resolvedLaunchSource: $value` as $match where {
    $filename <: r".*packages/studio-server/src/operationRuntime/projection\.ts$",
    $match <: within `export function projectRunInGame($args) { $body }`
  },
  `generationManifest: $value` as $match where {
    $filename <: r".*packages/studio-server/src/operationRuntime/projection\.ts$",
    $match <: within `export function projectRunInGame($args) { $body }`
  },
  `runCorrelation: $value` as $match where {
    $filename <: r".*packages/studio-server/src/operationRuntime/projection\.ts$",
    $match <: within `export function projectRunInGame($args) { $body }`
  },
  `runArtifactId: $value` as $match where {
    $filename <: r".*packages/studio-server/src/operationRuntime/projection\.ts$",
    $match <: within `export function projectRunInGame($args) { $body }`
  },
  `...operation` as $match where {
    $filename <: r".*packages/studio-server/src/operationRuntime/projection\.ts$",
    $match <: within `export function projectRunInGame(operation) { $body }`
  },
  `return operation` as $match where {
    $filename <: r".*packages/studio-server/src/operationRuntime/projection\.ts$",
    $match <: within `export function projectRunInGame(operation) { $body }`
  }
}
```

## Matches Fixture

```typescript
// @filename: packages/studio-contract/src/runInGame.ts
export const publicRunStatusTypeSchema = Type.Object({ status: Type.String() });

// @filename: packages/studio-contract/src/runInGame.ts
export const publicRunStatusTypeSchema = Type.Union([
  Type.Object({ status: Type.Literal("failed"), details: Type.Unknown() }, { additionalProperties: false }),
]);

// @filename: packages/studio-server/src/operationRuntime/projection.ts
export function projectRunInGame(operation) {
  return { requestId: operation.requestId, sections: operation.sections };
}

// @filename: packages/studio-server/src/operationRuntime/projection.ts
export function projectRunInGame(operation) {
  return { ...operation, phase: "failed" };
}

// @filename: packages/studio-server/src/operationRuntime/StudioOperationRuntime.ts
const api = {};
```

## Ignores Fixture

```typescript
// @filename: packages/studio-contract/src/runInGame.ts
export const publicRunStatusTypeSchema = Type.Union([
  Type.Object({ status: Type.Literal("running"), phase: Type.Literal("deploying") }, { additionalProperties: false }),
]);
export const operationStatusTypeSchema = publicRunStatusTypeSchema;
export const diagnostics = oc
  .input(contractSchema(Type.Object({ diagnosticsId: Type.String({ minLength: 1 }) })))
  .output(contractSchema(diagnosticsLookupResultSchema));

// @filename: packages/studio-server/src/operationRuntime/projection.ts
export function projectRunInGame(operation) {
  return { requestId: operation.requestId, status: "running", phase: "deploying" };
}

// @filename: packages/studio-server/src/operationRuntime/StudioOperationRuntime.ts
const api = {
  runInGameDiagnostics: (input) =>
    lookupRunDiagnostics(input.diagnosticsId, { workspaceRoot: runInGameWorkspaceRoot }),
};
```
