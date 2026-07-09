---
level: error
---
# Grit Studio Run Copy Deploy Boundary

Packet 11 makes Run in Game deployment a copy from the generated mod root to the
stable Studio-run mod id. This rule protects the source boundary only: runtime
filesystem topology and deployed bytes are verified by behavior and live
endpoint evidence, not by Grit.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/ports/workflowTypes\.ts$",
    ! $body <: contains `RunDeployment`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/ports/workflowTypes\.ts$",
    ! $body <: contains `DeployedModSnapshot`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/ports/workflowTypes\.ts$",
    ! $body <: contains `runDeployment: RunDeployment`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/ports/workflowTypes\.ts$",
    ! $body <: contains `deployedSnapshot: DeployedModSnapshot`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/model\.ts$",
    ! $body <: contains `deploymentEvidence?: RunInGameDeploymentEvidence`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $body <: contains `deployedModId?: string`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $body <: contains `attachRuntimeOwnershipLeaseDeployment`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/registry\.ts$",
    ! $body <: contains `deploymentEvidence`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/workflows/RunInGameWorkflow\.ts$",
    ! $body <: contains `deploymentEvidence`
  },
  program(statements=$body) where {
    $filename <: r".*apps/mapgen-studio/src/server/studio/engines\.ts$",
    ! $body <: contains `const SWOOPER_STUDIO_RUN_MOD_ID = "mod-swooper-studio-run"`
  },
  `async function deployGeneratedSwooperRunMod($args) { $body }` where {
    $filename <: r".*apps/mapgen-studio/src/server/studio/engines\.ts$",
    ! $body <: contains `inputDir: options.generatedModRoot`
  },
  `async function deployGeneratedSwooperRunMod($args) { $body }` where {
    $filename <: r".*apps/mapgen-studio/src/server/studio/engines\.ts$",
    ! $body <: contains `modId: SWOOPER_STUDIO_RUN_MOD_ID`
  },
  `deployRunInGame: async ($args) => { $body }` where {
    $filename <: r".*apps/mapgen-studio/src/server/studio/engines\.ts$",
    ! $body <: contains `const deploy = await deployGeneratedSwooperRunMod($deployArgs)`
  },
  `deployRunInGame: async ($args) => { $body }` where {
    $filename <: r".*apps/mapgen-studio/src/server/studio/engines\.ts$",
    ! $body <: contains `const deployedSnapshot = await snapshotDeployedMod($snapshotArgs)`
  },
  `deployRunInGame: async ($args) => { $body }` where {
    $filename <: r".*apps/mapgen-studio/src/server/studio/engines\.ts$",
    ! $body <: contains `runDeployment`
  },
  `deployRunInGame: async ($args) => { $body }` where {
    $filename <: r".*apps/mapgen-studio/src/server/studio/engines\.ts$",
    ! $body <: contains `deployedSnapshot`
  },
  `deployRunInGame: async ($args) => { $body }` where {
    $filename <: r".*apps/mapgen-studio/src/server/studio/engines\.ts$",
    ! $body <: contains `deployFailed($...)`
  },
  `deployRunInGame: async ($args) => { $body }` where {
    $filename <: r".*apps/mapgen-studio/src/server/studio/engines\.ts$",
    $body <: contains `deploySwooperMaps($...)`
  },
  `deployRunInGame: async ($args) => { $body }` where {
    $filename <: r".*apps/mapgen-studio/src/server/studio/engines\.ts$",
    $body <: contains `buildSwooperMapsStudioDeployPlan($...)`
  },
  `deployRunInGame: async ($args) => { $body }` where {
    $filename <: r".*apps/mapgen-studio/src/server/studio/engines\.ts$",
    $body <: contains `execFileAsync("bun", $...)`
  },
  `async function deployGeneratedSwooperRunMod($args) { $body }` where {
    $filename <: r".*apps/mapgen-studio/src/server/studio/engines\.ts$",
    $body <: contains `deploySwooperMaps($...)`
  },
  `async function deployGeneratedSwooperRunMod($args) { $body }` where {
    $filename <: r".*apps/mapgen-studio/src/server/studio/engines\.ts$",
    $body <: contains `buildSwooperMapsStudioDeployPlan($...)`
  },
  `async function deployGeneratedSwooperRunMod($args) { $body }` where {
    $filename <: r".*apps/mapgen-studio/src/server/studio/engines\.ts$",
    $body <: contains `execFileAsync("bun", $...)`
  },
  `attachRuntimeOwnershipLeaseDeployment($args).pipe(Effect.catchAll(() => Effect.void))` where {
    $filename <: r".*packages/studio-server/src/operationRuntime/StudioOperationRuntime\.ts$"
  },
  `attachRuntimeOwnershipLeaseDeployment($args).pipe(Effect.catchAll($handler))` where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$"
  }
}
```

## Matches Fixture

```typescript
// @filename: apps/mapgen-studio/src/server/studio/engines.ts
const ports = {
  deployRunInGame: async () => {
    return deploySwooperMaps(repoRoot, { id: "latest-juicy", path: "config.json" });
  },
};

// @filename: packages/studio-server/src/ports/workflowTypes.ts
export type RunInGameDeployment = Readonly<{
  materialization?: RunInGameMaterializationStatus;
}>;
```

## Ignores Fixture

```typescript
// @filename: apps/mapgen-studio/src/server/studio/engines.ts
const SWOOPER_STUDIO_RUN_MOD_ID = "mod-swooper-studio-run";
async function deployGeneratedSwooperRunMod(options: { generatedModRoot: string }) {
  return deployMod({
    inputDir: options.generatedModRoot,
    modId: SWOOPER_STUDIO_RUN_MOD_ID,
  });
}

// @filename: packages/studio-server/src/ports/workflowTypes.ts
export type RunDeployment = Readonly<{ deployedModId: string }>;
export type DeployedModSnapshot = Readonly<{ digest: string }>;
export type RunInGameDeployment = Readonly<{
  materialization?: RunInGameMaterializationStatus;
  runDeployment: RunDeployment;
  deployedSnapshot: DeployedModSnapshot;
}>;
```
