---
level: error
---
# Prohibit Studio RPC EventHub Lifecycle Leaks

The Studio RPC daemon may mount the RPC handler, but EventHub construction,
injection, and shutdown stay inside the studio-server runtime layer. Host
context and handler seams must not accept or provide an EventHub instance.

```grit
language js(typescript)

or {
  `createStudioEventHub($...)` where {
    $filename <: r".*apps/mapgen-studio/src/server/daemon/daemon\.ts$"
  },
  `eventHub.shutdown()` where {
    $filename <: r".*apps/mapgen-studio/src/server/daemon/daemon\.ts$"
  },
  `createStudioRpcHandler({ eventHub: $eventHub })` where {
    $filename <: r".*apps/mapgen-studio/src/server/daemon/daemon\.ts$"
  },
  `createStudioRpcHandler({ $..., eventHub: $eventHub, $... })` where {
    $filename <: r".*apps/mapgen-studio/src/server/daemon/daemon\.ts$"
  },
  `eventHub` where {
    $filename <: r".*apps/mapgen-studio/src/server/studio/context\.ts$"
  },
  `eventHub` where {
    $filename <: r".*packages/studio-server/src/context\.ts$"
  },
  `$context.eventHub` where {
    $filename <: r".*packages/studio-server/src/handler\.ts$"
  },
  `Layer.succeed(StudioEventHub, $eventHub)` where {
    $filename <: r".*packages/studio-server/src/runtime\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: apps/mapgen-studio/src/server/daemon/daemon.ts
const eventHub = createStudioEventHub();

// @filename: apps/mapgen-studio/src/server/daemon/daemon.ts
eventHub.shutdown();

// @filename: apps/mapgen-studio/src/server/daemon/daemon.ts
createStudioRpcHandler({ eventHub });

// @filename: apps/mapgen-studio/src/server/studio/context.ts
export interface StudioContext { eventHub: EventHub }

// @filename: packages/studio-server/src/context.ts
export interface StudioServerContext { eventHub: StudioEventHubApi }

// @filename: packages/studio-server/src/handler.ts
const hub = context.eventHub;

// @filename: packages/studio-server/src/runtime.ts
const eventHubLayer = Layer.succeed(StudioEventHub, providedHub);
```

## Ignores fixture

```typescript
// @filename: apps/mapgen-studio/src/server/daemon/daemon.ts
createStudioRpcHandler(context);

// @filename: apps/mapgen-studio/src/server/studio/engines.ts
const eventHub = createStudioEventHub();

// @filename: packages/studio-server/src/runtime.ts
const eventHubLayer = StudioEventHubLive;
```
