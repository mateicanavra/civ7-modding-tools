# MapGen Studio Event Hub

## Why

D8 turns the D7 stream transport decision into the daemon-owned Studio event
spine. The system needs one production event hub that can carry runtime truth
from the daemon to the Studio app without reopening browser-owned polling
authority or creating an alternate transport.

The component introduced by this packet is deliberately narrow but not
temporary: `StudioEventHub` owns the daemon event bus, `studio.events.watch`
owns subscription semantics on the existing `/rpc` surface, and the client event
hook owns reconnect adoption through `studio.operations.current`. Operation
polling and live-game browser timers remain only as named downstream deletion
targets: D9 deletes operation polling/watchdog authority after operation events
are published, and D10 deletes live-game browser cadence after daemon live-game
events are published.

## Authority

- `docs/projects/studio-runtime-simplification/RUNTIME-EFFECT-REFACTOR-FRAME.md`
- `docs/projects/studio-runtime-simplification/OPENSPEC-PACKET-TRAIN.md`
- `openspec/changes/mapgen-studio-stream-spike/`
- `openspec/changes/mapgen-studio-operations-current/`
- `openspec/changes/mapgen-studio-runtime-one-mount/`
- Current evidence:
  - `packages/studio-server/src/services/StudioEventHub.ts`
  - `packages/studio-server/src/contract/studio.ts`
  - `packages/studio-server/src/router/index.ts`
  - `packages/studio-server/src/runtime.ts`
  - `apps/mapgen-studio/src/app/hooks/useStudioEvents.ts`
  - `apps/mapgen-studio/src/app/operationAdoption.ts`
  - `packages/studio-server/test/handler.test.ts`
  - `apps/mapgen-studio/test/studioEvents/operationAdoption.test.ts`
  - `apps/mapgen-studio/test/server/oneMount.test.ts`

## What Changes

- Repair the existing `mapgen-studio-event-hub` change from historical
  implementation-closure notes into the D8 normative packet.
- Define the daemon-owned `StudioEventHub` package service backed by Effect
  `PubSub`, with observable cleanup proof.
- Define the sealed TypeBox event union:
  `hello | operation | live-game`.
- Expose `studio.events.watch` as the only Studio event watch procedure through
  D7's selected bridge: `effect-orpc` `.effect()` returning
  `eventIterator(...)` on the existing `/rpc` mount.
- Require each subscription to emit an immediate `hello` event containing
  daemon identity and observation time before consuming hub events.
- Require subscription cleanup to release the underlying Effect subscription
  when the iterator closes, when the client aborts/disconnects, when the watch
  fiber/runtime is interrupted, when the hub shuts down, and across repeated
  subscribe/close cycles.
- Add one client event hook using `experimental_liveOptions` and an explicit
  nonzero retry owner on the actual `studio.events.watch` path.
- On `hello`, re-adopt daemon operation truth by calling
  `studio.operations.current` and applying the D6 operation adoption helper.
- Promote or delete D7 spike-only stream fixtures once D8 production watch tests
  cover equivalent delivery, cleanup, one-route, client-helper, and retry
  guarantees.

## Non-Goals

- No operation event publisher conversion in this packet. D9 owns publishing
  Run in Game and Save/Deploy transitions through `StudioEventHub`.
- No operation polling, hidden completion loop, or daemon watchdog deletion in
  this packet. D9 owns those deletions after operation push parity is proven.
- No daemon live-game watcher conversion in this packet. D10 owns live-game
  event publication and browser timer deletion.
- No alternate event transport, second RPC mount, SSE route, browser storage
  recovery path, or parallel bridge.
- No Zod expansion for event contracts.
- No durable event log or replay cursor. Reconnect truth is
  `studio.operations.current` plus the latest pushed events, not event-stream
  history.

## Future Implementation Write Set

- `packages/studio-server/src/services/StudioEventHub.ts`
- `packages/studio-server/src/contract/studio.ts`
- `packages/studio-server/src/contract/index.ts`
- `packages/studio-server/src/router/index.ts`
- `packages/studio-server/src/runtime.ts`
- `packages/studio-server/src/context.ts`
- `packages/studio-server/src/index.ts`
- `packages/studio-server/test/**`
- `apps/mapgen-studio/src/lib/orpc.ts`
- `apps/mapgen-studio/src/app/hooks/useStudioEvents.ts`
- `apps/mapgen-studio/src/app/operationAdoption.ts`
- `apps/mapgen-studio/src/app/StudioShell.tsx`
- `apps/mapgen-studio/src/server/daemon/daemon.ts`
- `apps/mapgen-studio/src/server/studio/context.ts`
- `apps/mapgen-studio/test/studioEvents/**`
- `apps/mapgen-studio/test/server/oneMount.test.ts`

Protected paths:

- D9 operation publisher and polling-deletion work except explicit hook points
  required for `operation` event DTO shape.
- D10 live-game watcher and timer-deletion work except explicit hook points
  required for `live-game` event DTO shape.
- Browser localStorage operation recovery, request-id replay, and unrelated
  authoring/preset/theme storage owners.
- Alternate HTTP/SSE servers, second RPC mounts, or app-local event servers.
- Generated outputs and built bundles.

## Verification Gates

### Packet Acceptance Gates

- `bun run openspec -- validate mapgen-studio-event-hub --strict`
- `bun run openspec:validate`
- `git diff --check`
- `git status --short --branch`
- `gt status`
- `gt log --no-interactive`
- Prework, testing/vendor-alignment, hardening/black-ice, and downstream
  realignment reviews have no unresolved P1/P2 findings.

### Future Implementation Closure Gates

- Package/app gates:
  - `bun run --cwd packages/studio-server test -- test/handler.test.ts`
  - `bun run --cwd packages/studio-server check`
  - `bun run --cwd apps/mapgen-studio test -- test/studioEvents/operationAdoption.test.ts test/server/oneMount.test.ts`
  - `bun run --cwd apps/mapgen-studio check`
- `studio.events.watch` emits `hello` first with `serverInstanceId`,
  `serverStartedAt`, and `observedAt`.
- TypeBox remains the event schema origin and reaches oRPC through the owned
  Standard Schema adapter.
- Watch implementation uses `.effect()` plus `eventIterator(...)`; no
  production `.handler()` bridge remains for Studio events.
- Subscription cleanup proof separately covers iterator `return()`,
  client abort/disconnect, runtime/fiber interruption, hub shutdown, and
  repeated subscribe/close cycles.
- One `/rpc` watch route is preserved; no alternate event route exists.
- The actual watch path uses `experimental_liveOptions` with explicit nonzero
  retry policy.
- `hello` reconnect adoption calls `studio.operations.current` and applies the
  D6 adoption helper without page reload.
- D7 spike-only fixtures are promoted into production watch tests or deleted
  with evidence.
