---
level: error
---
# Grit Studio Run Direct Control Observation Boundary

Packet 12 makes runtime observation a private Run in Game workflow boundary.
The workflow collects a fresh scripting-log proof, then asks the host
observation port to correlate deployment evidence, setup row readback, scripting
log proof, and loaded-game state. The app implementation reads loaded-game state
through the Studio RPC live client; the concrete `/rpc` transport prefix remains
behavior-tested endpoint proof. Runtime bytes, actual Civ7 state, and map
contents are behavior/live proof, not source-topology assertions.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/ports/RuntimeObservation\.ts$",
    ! $body <: contains `observeRunInGameRuntime`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/ports/RuntimeObservation\.ts$",
    ! $body <: contains `prepared: RunInGamePreparedRequest`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/ports/RuntimeObservation\.ts$",
    ! $body <: contains `deployment: RunInGameDeployment`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/ports/RuntimeObservation\.ts$",
    ! $body <: contains `setup: RunInGameSetupPrepared`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/ports/RuntimeObservation\.ts$",
    ! $body <: contains `log: RunInGameLogEvidence`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/ports/RuntimeObservation\.ts$",
    ! $body <: contains `Promise<RunInGameRuntimeObservation>`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/ports/workflowTypes\.ts$",
    ! $body <: contains `RunInGameRuntimeObservation`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/ports/workflowTypes\.ts$",
    ! $body <: contains `deploymentEvidence: RunInGameDeploymentEvidence`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/ports/workflowTypes\.ts$",
    ! $body <: contains `scriptingLog: ScriptingLogObservation`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/ports/workflowTypes\.ts$",
    ! $body <: contains `setupRow: SetupRowReadback`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/ports/workflowTypes\.ts$",
    ! $body <: contains `loadedGame: LoadedGameReadback`
  },
  `export type ScriptingLogObservation = Readonly<{ $body }>` where {
    $filename <: r".*packages/studio-server/src/ports/workflowTypes\.ts$",
    ! $body <: contains `correlation: RunCorrelation`
  },
  `export type SetupRowReadback = Readonly<{ $body }>` where {
    $filename <: r".*packages/studio-server/src/ports/workflowTypes\.ts$",
    ! $body <: contains `correlation: RunCorrelation`
  },
  `export type LoadedGameReadback = Readonly<{ $body }>` where {
    $filename <: r".*packages/studio-server/src/ports/workflowTypes\.ts$",
    ! $body <: contains `correlation: RunCorrelation`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/workflows/RunInGameWorkflow\.ts$",
    ! $body <: contains `$owner.observeRunInGameRuntime({ $args })`
  },
  `$owner.observeRunInGameRuntime({ $args })` where {
    $filename <: r".*packages/studio-server/src/workflows/RunInGameWorkflow\.ts$",
    ! $args <: contains `prepared`
  },
  `$owner.observeRunInGameRuntime({ $args })` where {
    $filename <: r".*packages/studio-server/src/workflows/RunInGameWorkflow\.ts$",
    ! $args <: contains `deployment`
  },
  `$owner.observeRunInGameRuntime({ $args })` where {
    $filename <: r".*packages/studio-server/src/workflows/RunInGameWorkflow\.ts$",
    ! $args <: contains `setup`
  },
  `$owner.observeRunInGameRuntime({ $args })` where {
    $filename <: r".*packages/studio-server/src/workflows/RunInGameWorkflow\.ts$",
    ! $args <: contains `started`
  },
  `$owner.observeRunInGameRuntime({ $args })` where {
    $filename <: r".*packages/studio-server/src/workflows/RunInGameWorkflow\.ts$",
    ! $args <: contains `log`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/workflows/RunInGameWorkflow\.ts$",
    ! $body <: contains `runtimeObservation: $value`
  },
  program(statements=$body) where {
    $filename <: r".*apps/mapgen-studio/src/server/studio/engines\.ts$",
    ! $body <: contains `observeRunInGameRuntimeThroughStudioRpc({ $args })`
  },
  `observeRunInGameRuntimeThroughStudioRpc({ $args })` where {
    $filename <: r".*apps/mapgen-studio/src/server/studio/engines\.ts$",
    ! $args <: contains `prepared`
  },
  `observeRunInGameRuntimeThroughStudioRpc({ $args })` where {
    $filename <: r".*apps/mapgen-studio/src/server/studio/engines\.ts$",
    ! $args <: contains `deployment`
  },
  `observeRunInGameRuntimeThroughStudioRpc({ $args })` where {
    $filename <: r".*apps/mapgen-studio/src/server/studio/engines\.ts$",
    ! $args <: contains `setup`
  },
  `observeRunInGameRuntimeThroughStudioRpc({ $args })` where {
    $filename <: r".*apps/mapgen-studio/src/server/studio/engines\.ts$",
    ! $args <: contains `log`
  },
  `observeRunInGameRuntimeThroughStudioRpc({ $args })` where {
    $filename <: r".*apps/mapgen-studio/src/server/studio/engines\.ts$",
    ! $args <: contains `selfRpcUrl: $value`
  },
  program(statements=$body) where {
    $filename <: r".*apps/mapgen-studio/src/server/runInGame/runtimeObservation\.ts$",
    ! $body <: contains `new RPCLink($args)`
  },
  program(statements=$body) where {
    $filename <: r".*apps/mapgen-studio/src/server/runInGame/runtimeObservation\.ts$",
    ! $body <: contains `$client.civ7.live.status($args)`
  },
  program(statements=$body) where {
    $filename <: r".*apps/mapgen-studio/src/server/runInGame/runtimeObservation\.ts$",
    ! $body <: contains `$client.civ7.live.snapshot($args)`
  },
  `import $imports from "@civ7/direct-control"` where {
    $filename <: r".*apps/mapgen-studio/src/server/runInGame/runtimeObservation\.ts$"
  },
  `import $imports from "@civ7/direct-control"` where {
    $filename <: r".*packages/studio-server/src/workflows/RunInGameWorkflow\.ts$"
  },
  `new RPCLink($args)` where {
    $filename <: r".*packages/studio-server/src/workflows/RunInGameWorkflow\.ts$"
  }
}
```

## Matches Fixture

```typescript
// @filename: packages/studio-server/src/ports/RuntimeObservation.ts
export type RuntimeObservation = Readonly<{
  observeRunInGameRuntime(args: { requestId: string }): Promise<unknown>;
}>;

// @filename: apps/mapgen-studio/src/server/runInGame/runtimeObservation.ts
import { getCiv7PlayableStatus } from "@civ7/direct-control";
export async function observeRunInGameRuntimeThroughStudioRpc(args) {
  return getCiv7PlayableStatus();
}
```

## Ignores Fixture

```typescript
// @filename: packages/studio-server/src/ports/RuntimeObservation.ts
export type RuntimeObservation = Readonly<{
  observeRunInGameRuntime(
    args: Readonly<{
      prepared: RunInGamePreparedRequest;
      deployment: RunInGameDeployment;
      setup: RunInGameSetupPrepared;
      started: RunInGameStarted;
      log: RunInGameLogEvidence;
    }>
  ): Promise<RunInGameRuntimeObservation>;
}>;

export type ScriptingLogObservation = Readonly<{ correlation: RunCorrelation }>;
export type SetupRowReadback = Readonly<{ correlation: RunCorrelation }>;
export type LoadedGameReadback = Readonly<{ correlation: RunCorrelation }>;
export type RunInGameRuntimeObservation = Readonly<{
  deploymentEvidence: RunInGameDeploymentEvidence;
  scriptingLog: ScriptingLogObservation;
  setupRow: SetupRowReadback;
  loadedGame: LoadedGameReadback;
}>;

await ports.observeRunInGameRuntime({ prepared, deployment, setup, started, log });

// @filename: apps/mapgen-studio/src/server/runInGame/runtimeObservation.ts
await observeRunInGameRuntimeThroughStudioRpc({
  prepared,
  deployment,
  setup,
  log,
  selfRpcUrl: baseUrl,
});
export async function observeRunInGameRuntimeThroughStudioRpc(args) {
  const liveClient = createORPCClient(
    new RPCLink({ url: `${baseUrl.replace(/\/$/, "")}/rpc` })
  );
  await liveClient.civ7.live.status({}, { signal: args.signal });
  await liveClient.civ7.live.snapshot({ width: 84, height: 54, maxPlots: 512 }, { signal: args.signal });
  return { deploymentEvidence, scriptingLog, setupRow, loadedGame };
}
```
