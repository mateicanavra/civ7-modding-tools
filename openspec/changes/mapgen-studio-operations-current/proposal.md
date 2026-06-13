# MapGen Studio operations current

## Why

The runtime simplification program's state spine is daemon-owned operation
truth. Today the browser tab still owns recovery for Run in Game and
Save&Deploy through persisted request ids and snapshots in four localStorage
keys. On mount it replays those request ids into status calls and synthesizes
uncertain client state when the daemon no longer knows the operation.

That is the wrong owner. The daemon already owns the operation registries, TTL
pruning, operation mutex, and server identity. S2.1 exposes that truth directly
as `studio.operations.current` so the client adopts active/recent daemon
operations on boot and the four-key browser recovery bridge can be deleted.

## Target Authority Refs

- `docs/projects/studio-runtime-simplification/PLAN.md` — WS-2 S2.1 requires
  daemon-owned operation recovery, deletes the localStorage bridge, and keeps
  the watchdog until S3.2.
- `openspec/changes/mapgen-studio-runtime-one-mount/` — the one `/rpc`
  surface that receives the new procedure.
- `openspec/changes/mapgen-studio-error-spine/` — status misses carry typed
  `*_STATUS_NOT_FOUND` errors with daemon identity.
- `apps/mapgen-studio/src/server/studio/engines.ts` — current in-memory
  operation stores and mutex truth.
- `apps/mapgen-studio/src/stores/runStore.ts`,
  `apps/mapgen-studio/src/app/StudioShell.tsx` — current client recovery
  bridge and mount-time re-adoption logic.

## What Changes

- Add `studio.operations.current` to the unified Studio contract and router.
  It returns daemon identity plus the active and recent Run in Game and
  Save&Deploy operation statuses currently retained by the daemon registries.
- Extend the engine stores with current snapshot enumeration that runs through
  the same TTL pruning semantics as status lookups.
- Replace client mount-time localStorage request-id restore with a
  `studio.operations.current` boot adoption query.
- Delete the four-key operation recovery bridge:
  `runInGameRequestId`, `runInGameSnapshot`, `lastRunInGameSource`, and
  `saveDeployRequestId` persistence for operation recovery; delete
  `features/runInGame/sourceSnapshotStorage.ts`.
- Preserve durable snapshot/fingerprint relation helpers and tests that
  classify a completed operation as current/stale/unknown against authored
  state.
- Keep operation status polling and the daemon-instance watchdog in this slice.
  They have named deletion slices: S3.2 for operation polls/watchdog and S3.3
  for live-game polling.

## Non-Goals

- No operation durability across daemon restarts. A fresh daemon truthfully
  reports no operations.
- No SSE/EventHub, event subscription, or push conversion; WS-3 owns that.
- No deletion of unrelated localStorage owners such as authoring, view, theme,
  or preset state.
- No schema-tech drift: new S2.1 contract schemas use TypeBox/Standard Schema.

## Impact

- `packages/studio-server/src/contract/*`
- `packages/studio-server/src/router/index.ts`
- `packages/studio-server/src/context.ts`
- `apps/mapgen-studio/src/server/*/operationState.ts`
- `apps/mapgen-studio/src/server/studio/{engines,context}.ts`
- `apps/mapgen-studio/src/stores/runStore.ts`
- `apps/mapgen-studio/src/app/StudioShell.tsx`
- Run in Game / Save&Deploy operation tests and localStorage bridge tests

## Verification Gates

- `bun run openspec -- validate mapgen-studio-operations-current --strict`
- Focused store/router tests for `operations.current` active/recent/TTL
  behavior and fresh-daemon truthfulness.
- Focused client/store tests proving no operation recovery localStorage bridge
  remains while snapshot relation pins stay green.
- App gate: `bun x turbo run check --filter=mapgen-studio`
- Package gate: `bun x turbo run check test --filter=@civ7/studio-server`
- Live proof disposition: this slice changes boot recovery ownership, not
  operation execution. Existing S1.1a Play/Save&Deploy execution proof remains
  the execution guard unless implementation touches deploy/launch paths.
