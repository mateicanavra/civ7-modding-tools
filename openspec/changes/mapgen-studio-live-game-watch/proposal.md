# MapGen Studio live game watch

## Why

S3.2 moved operation freshness onto `studio.events.watch`, but live Civ7 state
still uses a browser-owned `setTimeout` loop. That leaves the client as a
runtime scheduler and keeps FireTuner status reads split across browser
visibility/backoff behavior instead of the daemon's shared session.

S3.3 makes live-game freshness a daemon responsibility. The server polls Civ7
over the unified runtime's shared `Civ7TunerSession`, publishes `live-game`
deltas through the existing EventHub, and the client renders those events. The
snapshot read remains request/response; only the status cadence moves.

## Target Authority Refs

- `docs/projects/studio-runtime-simplification/PLAN.md` — WS-3 S3.3 requires a
  daemon-side watcher loop, `live-game` events keyed by turn/hash, deletion of
  the client status `setTimeout` loop, and a quiet/loud watcher pin.
- `openspec/changes/mapgen-studio-event-hub/` — S3.1 provides the sealed
  `hello | operation | live-game` event category, EventHub, and one
  `studio.events.watch` transport.
- `openspec/changes/mapgen-studio-operations-push/` — S3.2 proves client state
  can consume pushed daemon events without reintroducing operation polling.
- Direct user decision: new event contracts use TypeBox/Standard Schema here;
  do not add new Zod schemas for this event surface.

## What Changes

- Define the `live-game` event payload as a TypeBox state object under the
  existing `StudioEvent` union.
- Add a package-side live-game state builder/keying helper so the daemon
  watcher and client model share the turn/hash/snapshot-id semantics pinned by
  existing live runtime tests.
- Add a daemon live-game watcher inside the unified studio-server runtime
  lifecycle. It polls Civ7 status over the shared `Civ7TunerSession` and
  publishes only when the live-game key changes.
- Enable that watcher from the MapGen Studio daemon; dispose it with the
  unified RPC handler/runtime.
- Extend the Studio event hook to apply `live-game` events.
- Delete the client live status `setTimeout` loop and the
  `nextLiveRuntimePollDelayMs` model/test pin.
- Preserve snapshot and setup reads as request/response calls triggered by
  pushed live-game events, not by a browser cadence loop.

## Non-Goals

- No second event route, SSE endpoint, or live-game-specific transport.
- No operation polling, `serverInfo` identity polling, or localStorage recovery
  reintroduction.
- No migration of the snapshot endpoint onto the event stream.
- No broad migration of all legacy success schemas away from Zod; S4.1 owns
  the final schema-technology closeout. New S3.3 event schemas are TypeBox.

## Impact

- `packages/studio-server/src/contract/studio.ts`
- `packages/studio-server/src/liveGame/**`
- `packages/studio-server/src/handler.ts`
- `packages/studio-server/src/router/index.ts`
- `packages/studio-server/src/index.ts`
- `apps/mapgen-studio/src/server/daemon/daemon.ts`
- `apps/mapgen-studio/src/app/hooks/useStudioEvents.ts`
- `apps/mapgen-studio/src/app/StudioShell.tsx`
- `apps/mapgen-studio/src/features/liveRuntime/model.ts`
- focused package/app tests and deletion of client poll-delay pins

## Verification Gates

- `bun run openspec -- validate mapgen-studio-live-game-watch --strict`
- Focused package test: watcher publishes first/change events and stays quiet
  when the live-game key is unchanged.
- Focused app/model tests: turn/hash keying and snapshot commit gates remain
  green; poll-delay pin is deleted.
- Focused client event test: `live-game` events update live runtime state
  without operation-event regressions.
- Negative search/proof: no `nextLiveRuntimePollDelayMs` or client live status
  `setTimeout` loop remains.
- Package/app gates selected by blast radius.
