# MapGen Studio operations push

## Why

S3.1 created the production event channel and daemon-owned EventHub, but Run in
Game and Save&Deploy status still reach the browser through client polling.
S3.2 moves the first real event category onto the spine: daemon operation
registries publish every operation transition to `studio.events.watch`, and the
client updates operation state from pushed events instead of polling status
endpoints.

This is also the deletion slice for the S3.1 temporary operation polling and
daemon-instance watchdog. The event stream `hello` already owns daemon identity
re-adoption, and operation events now own status freshness.

## Target Authority Refs

- `docs/projects/studio-runtime-simplification/PLAN.md` — WS-3 S3.2 requires
  registry `update()` publishing, deletion of operation polls and watchdog, and
  a publish-on-transition falsification pin.
- `openspec/changes/mapgen-studio-event-hub/` — S3.1 provides the sealed event
  union, daemon-owned EventHub, `studio.events.watch`, and client live query.
- `openspec/changes/mapgen-studio-operations-current/` — reconnect/hello still
  re-adopts daemon truth from `studio.operations.current`.

## What Changes

- Inject the S3.1 EventHub into the app-side Studio engines before registry
  construction.
- Publish `operation` events from the Run in Game and Save&Deploy operation
  stores on create/update/complete/fail transitions.
- Consume `operation` events in the existing Studio event hook and update the
  same operation state used by GameConsole/RecipePanel/AppFooter.
- Delete the client operation status polling hook and its status-refresh/404
  synthetic mapping in `StudioShell`.
- Delete the hidden Save&Deploy completion loop in the map config save API so
  Save&Deploy completion is not still driven by private background status
  polling after the visible hook is gone.
- Delete the daemon-instance `serverInfo` watchdog hook; `hello` owns daemon
  identity adoption/reconnect truth.
- Keep live-game polling untouched for S3.3.

## Non-Goals

- No live-game watcher or live-game poll deletion. S3.3 owns that.
- No alternate event transport or SSE route.
- No browser localStorage recovery reintroduction.
- No removal of the `runInGame.status` / `mapConfigs.status` oRPC procedures
  unless explicitly proven unused by remaining UI/test paths; S3.2 deletes the
  client polling behavior, not necessarily public status contracts.

## Impact

- `apps/mapgen-studio/src/server/studio/engines.ts`
- `apps/mapgen-studio/src/server/{runInGame,mapConfigs}/operationState.ts`
- `apps/mapgen-studio/src/server/daemon/daemon.ts`
- `apps/mapgen-studio/src/app/hooks/useStudioEvents.ts`
- `apps/mapgen-studio/src/app/StudioShell.tsx`
- `apps/mapgen-studio/src/features/mapConfigSave/api.ts`
- deletion of operation polling/watchdog hook files and tests that only pin
  deleted polling behavior
- focused operation push tests

## Verification Gates

- `bun run openspec -- validate mapgen-studio-operations-push --strict`
- Focused store/engine tests proving create/update/complete/fail publish
  operation events and fail if publishing is disconnected.
- Focused app tests proving operation events update Run in Game and
  Save&Deploy state.
- Negative search/proof: no `useOperationStatusPolls` or
  `useDaemonInstanceWatchdog` import/call remains.
- Negative search/proof: no hidden Save&Deploy background loop remains calling
  status until terminal.
- Package/app gates selected by blast radius.
