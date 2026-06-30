---
level: error
---
# Prohibit Studio RPC EventHub Lifecycle Leaks

The Studio RPC daemon may mount the RPC handler, but EventHub creation,
injection, and shutdown stay out of the daemon and public server context.

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
```

## Ignores fixture

```typescript
// @filename: apps/mapgen-studio/src/server/daemon/daemon.ts
createStudioRpcHandler(context);

// @filename: apps/mapgen-studio/src/server/studio/engines.ts
const eventHub = createStudioEventHub();
```
