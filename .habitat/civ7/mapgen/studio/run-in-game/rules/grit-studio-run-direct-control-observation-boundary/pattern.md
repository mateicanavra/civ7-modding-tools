---
level: error
---
# Grit Studio Run Lifecycle Observation Boundary

Runtime observation is a private Run in Game workflow boundary. The workflow
starts Civ7 through the package-owned lifecycle, collects fresh scripting-log
proof, then asks the host observation port to correlate deployment evidence,
canonical lifecycle setup evidence, and loaded-game state. The app
implementation reads loaded-game state through a narrow in-process reader over
the exact Studio router and shared runtime. The concrete `/rpc` transport prefix
remains behavior-tested external endpoint proof. Runtime
bytes, actual Civ7 state, and map contents are behavior/live proof, not
source-topology assertions.

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
    ! $body <: contains `started: RunInGameStarted`
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
    ! $body <: contains `observeRunInGameRuntimeThroughStudioLiveReader({ $args })`
  },
  `observeRunInGameRuntimeThroughStudioLiveReader({ $args })` where {
    $filename <: r".*apps/mapgen-studio/src/server/studio/engines\.ts$",
    ! $args <: contains `prepared`
  },
  `observeRunInGameRuntimeThroughStudioLiveReader({ $args })` where {
    $filename <: r".*apps/mapgen-studio/src/server/studio/engines\.ts$",
    ! $args <: contains `deployment`
  },
  `observeRunInGameRuntimeThroughStudioLiveReader({ $args })` where {
    $filename <: r".*apps/mapgen-studio/src/server/studio/engines\.ts$",
    ! $args <: contains `started`
  },
  `observeRunInGameRuntimeThroughStudioLiveReader({ $args })` where {
    $filename <: r".*apps/mapgen-studio/src/server/studio/engines\.ts$",
    ! $args <: contains `log`
  },
  `observeRunInGameRuntimeThroughStudioLiveReader({ $args })` where {
    $filename <: r".*apps/mapgen-studio/src/server/studio/engines\.ts$",
    ! $args <: contains `liveReader: $value`
  },
  program(statements=$body) where {
    $filename <: r".*apps/mapgen-studio/src/server/runInGame/runtimeObservation\.ts$",
    $body <: contains `new RPCLink($args)`
  },
  program(statements=$body) where {
    $filename <: r".*apps/mapgen-studio/src/server/runInGame/runtimeObservation\.ts$",
    $body <: contains `createORPCClient($args)`
  },
  program(statements=$body) where {
    $filename <: r".*apps/mapgen-studio/src/server/runInGame/runtimeObservation\.ts$",
    ! $body <: contains `$reader.status($args)`
  },
  program(statements=$body) where {
    $filename <: r".*apps/mapgen-studio/src/server/runInGame/runtimeObservation\.ts$",
    ! $body <: contains `$reader.snapshot($args)`
  },
  program(statements=$body) where {
    $filename <: r".*apps/mapgen-studio/src/server/daemon/daemon\.ts$",
    ! $body <: contains `liveRuntimeReader = studioRpc.live`
  },
  `assertSetupRowReadbackMatches({ $args })` where {
    $filename <: r".*apps/mapgen-studio/src/server/runInGame/runtimeObservation\.ts$",
    ! $args <: contains `mapRowFiles: args.started.evidence.setup.mapRowFiles`
  },
  `setupRow: { $fields }` where {
    $filename <: r".*apps/mapgen-studio/src/server/runInGame/runtimeObservation\.ts$",
    ! $fields <: contains `mapRowFiles: args.started.evidence.setup.mapRowFiles`
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
export async function observeRunInGameRuntimeThroughStudioLiveReader(args) {
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

await ports.observeRunInGameRuntime({ prepared, deployment, started, log });

// @filename: apps/mapgen-studio/src/server/runInGame/runtimeObservation.ts
await observeRunInGameRuntimeThroughStudioLiveReader({
  prepared,
  deployment,
  started,
  log,
  liveReader,
});
export async function observeRunInGameRuntimeThroughStudioLiveReader(args) {
  assertSetupRowReadbackMatches({
    mapRowFiles: args.started.evidence.setup.mapRowFiles,
  });
  await args.liveReader.status({}, { signal: args.signal });
  await args.liveReader.snapshot({ width: 84, height: 54, maxPlots: 512 }, { signal: args.signal });
  return {
    deploymentEvidence,
    scriptingLog,
    setupRow: {
      mapRowFiles: args.started.evidence.setup.mapRowFiles,
    },
    loadedGame,
  };
}

// @filename: apps/mapgen-studio/src/server/daemon/daemon.ts
const studioRpc = createStudioRpcHandler(context, { liveGameWatch: {} });
liveRuntimeReader = studioRpc.live;
```
