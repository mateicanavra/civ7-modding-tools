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
    ! $body <: contains `diagnosticsId: Type.String({ minLength: 1 })`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    ! $body <: contains `.output(contractSchema(diagnosticsLookupResultSchema))`
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
  `Type.Object($fields, { $..., additionalProperties: true, $... })` where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    within `export const publicRunStatusTypeSchema = Type.Union($variants)`
  },
  `Type.Record($key, $value)` where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    within `export const publicRunStatusTypeSchema = Type.Union($variants)`
  },
  `Type.Unknown()` where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    within `export const publicRunStatusTypeSchema = Type.Union($variants)`
  },
  `Type.Any()` where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    within `export const publicRunStatusTypeSchema = Type.Union($variants)`
  },
  `runDiagnosticsRecordSchema` where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    within `export const publicRunStatusTypeSchema = Type.Union($variants)`
  },
  `Type.Object({ $..., details: $details, $... }, $options)` where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    within `export const publicRunStatusTypeSchema = Type.Union($variants)`
  },
  `Type.Object({ $..., error: $error, $... }, $options)` where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    within `export const publicRunStatusTypeSchema = Type.Union($variants)`
  },
  `Type.Object({ $..., result: $result, $... }, $options)` where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    within `export const publicRunStatusTypeSchema = Type.Union($variants)`
  },
  `Type.Object({ $..., diagnostics: $diagnostics, $... }, $options)` where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    within `export const publicRunStatusTypeSchema = Type.Union($variants)`
  },
  `Type.Object({ $..., sections: $sections, $... }, $options)` where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    within `export const publicRunStatusTypeSchema = Type.Union($variants)`
  },
  `Type.Object({ $..., sourceSnapshot: $sourceSnapshot, $... }, $options)` where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    within `export const publicRunStatusTypeSchema = Type.Union($variants)`
  },
  `Type.Object({ $..., materialization: $materialization, $... }, $options)` where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    within `export const publicRunStatusTypeSchema = Type.Union($variants)`
  },
  `Type.Object({ $..., exactAuthorshipProof: $proof, $... }, $options)` where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    within `export const publicRunStatusTypeSchema = Type.Union($variants)`
  },
  `sections: $sections` where {
    $filename <: r".*packages/studio-server/src/operationRuntime/projection\.ts$",
    within `export function projectRunInGame($args) { $body }`
  },
  `operation: $operation` where {
    $filename <: r".*packages/studio-server/src/operationRuntime/projection\.ts$",
    within `export function projectRunInGame($args) { $body }`
  },
  `details: $details` where {
    $filename <: r".*packages/studio-server/src/operationRuntime/projection\.ts$",
    within `export function projectRunInGame($args) { $body }`
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
