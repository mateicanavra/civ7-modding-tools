---
level: error
---
# Preserve Studio Event-Driven Runtime Boundaries

The Studio event stream and daemon current-state registry own browser operation
truth. Only `useStudioEvents` may reconcile the daemon's current operation
state. Live-game events may trigger bounded request/response reads, but
`useLiveRuntime` must not own a timer cadence. Browser persistence stays behind
the three admitted storage owners. The server watcher consumes an injected read
effect and must not construct its own transport, runtime, or JavaScript timer.

This rule owns negative relapse boundaries only. Product tests own event
adoption, staleness, cleanup, replay, and exact-once behavior; the pattern does
not require particular positive calls or implementation spellings.

```grit
language js(typescript)

or {
  or {
    `fetchRunInGameStatus`,
    `fetchSaveDeployStatus`,
    `$owner.runInGame.status`,
    `$owner.mapConfigs.status`,
    `$owner.studio.serverInfo`
  } where {
    $filename <: r".*apps/mapgen-studio/src/(?:app|features|stores|ui)/.*\.tsx?$"
  },
  `$owner.studio.operations.current` where {
    $filename <: r".*apps/mapgen-studio/src/(?:app|features|stores|ui)/.*\.tsx?$",
    ! $filename <: r".*apps/mapgen-studio/src/app/hooks/useStudioEvents\.ts$"
  },
  or {
    `setTimeout($args)`,
    `$owner.setTimeout($args)`,
    `setInterval($args)`,
    `$owner.setInterval($args)`,
    `$owner.civ7.live.status`,
    `$owner.liveControlPort.readiness.current`,
    `refetchInterval: $value`
  } where {
    $filename <: r".*apps/mapgen-studio/src/app/hooks/useLiveRuntime\.ts$"
  },
  `import $imports from "@civ7/direct-control"` where {
    $filename <: r".*packages/studio-server/src/liveGame/watcher\.ts$"
  },
  or {
    `Civ7TunerSession`,
    `Civ7TunerSessionLive`,
    `ManagedRuntime.make($args)`,
    `Runtime.runPromise($args)`,
    `Effect.runtime($args)`,
    `setTimeout($args)`,
    `$owner.setTimeout($args)`,
    `setInterval($args)`,
    `$owner.setInterval($args)`
  } where {
    $filename <: r".*packages/studio-server/src/liveGame/watcher\.ts$"
  },
  or {
    `localStorage`,
    `sessionStorage`,
    `persist($args)`,
    `createJSONStorage($args)`
  } where {
    $filename <: r".*apps/mapgen-studio/src/(?:app|features|stores|ui)/.*\.tsx?$",
    ! $filename <: r".*apps/mapgen-studio/src/(?:features/studioState/persistence|stores/authoringStore|ui/hooks/useTheme)\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: apps/mapgen-studio/src/app/hooks/useRunInGame.ts
setTimeout(() => orpcClient.studio.operations.current({}), 3_000);

// @filename: apps/mapgen-studio/src/app/hooks/useLiveRuntime.ts
const cadence = window.setInterval(readLiveRuntimeSnapshot, 3_000);

// @filename: packages/studio-server/src/liveGame/watcher.ts
import { Civ7DirectControlSession } from "@civ7/direct-control";
const runtime = ManagedRuntime.make(layer);

// @filename: apps/mapgen-studio/src/features/runInGame/recovery.ts
localStorage.setItem("run-in-game", requestId);
```

## Ignores fixture

```typescript
// @filename: apps/mapgen-studio/src/app/hooks/useStudioEvents.ts
const retryDelay = setTimeout(reopenEventStream, delayMs);
const current = await orpcClient.studio.operations.current({});

// @filename: apps/mapgen-studio/src/app/hooks/useSaveDeploy.ts
const timeout = setTimeout(rejectPendingWaiter, timeoutMs);

// @filename: apps/mapgen-studio/src/app/hooks/useLiveRuntime.ts
function applyLiveGameState(state) {
  void readLiveRuntimeSnapshot(buildLiveRuntimeSnapshotRequest({ status: state }));
}

// @filename: packages/studio-server/src/liveGame/watcher.ts
const readLiveStatus = args.readLiveStatus;
yield* readLiveStatus;

// @filename: apps/mapgen-studio/src/ui/hooks/useTheme.ts
localStorage.setItem("theme-preference", preference);
```
