---
level: error
---
# Grit Studio Run Launch Source Boundary

Packet 5 makes `runInGame.start` a closed launch-source envelope. Public callers
choose either a durable catalog source or the disposable editor source; the
operation runtime resolves that source into the private launch envelope, digests,
source snapshot proof, and prepared request. Behavior such as digest stability,
catalog file reads, and no stale artifact reuse belongs to Packet 5 tests and
live endpoint evidence; this rule only guards the structural ownership boundary.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    ! $body <: contains `export const catalogLaunchSource = Type.Object($shape, { additionalProperties: false })`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    ! $body <: contains `export const editorLaunchSource = Type.Object($shape, { additionalProperties: false })`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    ! $body <: contains `export const launchSource = Type.Union([catalogLaunchSource, editorLaunchSource])`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    ! $body <: contains `source: launchSource`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    ! $body <: contains `recipeSettings: runInGameRecipeSettings`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    ! $body <: contains `worldSettings: runInGameWorldSettings`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/launchSource\.ts$",
    ! $body <: contains `export function resolveRunInGameLaunchSource($args) { $body }`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/launchSource\.ts$",
    ! $body <: contains `function resolveCatalogLaunchSource($args) { $body }`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/launchSource\.ts$",
    ! $body <: contains `function resolveEditorLaunchSource($args) { $body }`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/launchSource\.ts$",
    ! $body <: contains `readRunInGameCatalogSource`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/launchSource\.ts$",
    ! $body <: contains `const launchEnvelopeDigest = hashRunInGameProofValue(launchEnvelope)`
  },
  program(statements=$body) where {
    $filename <: r".*apps/mapgen-studio/src/app/hooks/useRunInGame\.ts$",
    ! $body <: contains `const launchSource = $source`
  },
  program(statements=$body) where {
    $filename <: r".*apps/mapgen-studio/src/app/hooks/useRunInGame\.ts$",
    ! $body <: contains `source: launchSource`
  }
}
```

## Matches Fixture

```typescript
// @filename: packages/studio-contract/src/runInGame.ts
export const start = oc.input(
  Type.Object({
    recipeId: Type.String(),
    seed: Type.Number(),
    config: Type.Unknown(),
  })
);

// @filename: packages/studio-server/src/operationRuntime/launchSource.ts
export function prepareRunInGameRequest() {}

// @filename: apps/mapgen-studio/src/app/hooks/useRunInGame.ts
await runCurrentConfigInGame({ config: pipelineConfig });
```

## Ignores Fixture

```typescript
// @filename: packages/studio-contract/src/runInGame.ts
export const catalogLaunchSource = Type.Object(
  { kind: Type.Literal("catalog"), catalogSourceId: Type.String() },
  { additionalProperties: false }
);
export const editorLaunchSource = Type.Object(
  { kind: Type.Literal("editor"), payload: Type.Unknown() },
  { additionalProperties: false }
);
export const launchSource = Type.Union([catalogLaunchSource, editorLaunchSource]);
export const start = oc.input(
  Type.Object({
    source: launchSource,
    recipeSettings: runInGameRecipeSettings,
    worldSettings: runInGameWorldSettings,
  })
);

// @filename: packages/studio-server/src/operationRuntime/launchSource.ts
export function resolveRunInGameLaunchSource(args) {
  return args.source.kind === "catalog"
    ? resolveCatalogLaunchSource(args)
    : resolveEditorLaunchSource(args);
}
function resolveCatalogLaunchSource(args) {
  return args.ports.readRunInGameCatalogSource(args);
}
function resolveEditorLaunchSource(args) {
  const launchEnvelopeDigest = hashRunInGameProofValue(launchEnvelope);
  return launchEnvelopeDigest;
}

// @filename: apps/mapgen-studio/src/app/hooks/useRunInGame.ts
const launchSource = { kind: "editor" };
await runCurrentConfigInGame({ source: launchSource });
```
