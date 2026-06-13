# MapGen Studio event hub

## Why

WS-3 turns Studio runtime truth from browser polling into daemon-pushed events.
S3.0 proved the transport bridge: `effect-orpc` can serve `eventIterator`
outputs, Effect `PubSub` subscriptions can clean up on iterator close,
`ClientRetryPlugin` can reconnect event iterators, and Vite `/rpc` proxying
passes event streams without buffering.

S3.1 now introduces the production category abstraction: one `studio.events.watch`
event channel carrying the sealed daemon event union. This slice creates the
hub and subscription surface without deleting operation polls or live-game
polling yet. S3.2/S3.3 own the publisher conversions and poll deletions.

## Target Authority Refs

- `docs/projects/studio-runtime-simplification/PLAN.md` — WS-3 S3.1 requires
  EventHub, sealed event union, `studio.events.watch`, hello on connect, client
  subscription, and reconnect re-adoption.
- `openspec/changes/mapgen-studio-stream-spike/` — selected bridge:
  `effect-orpc` `.effect()` + `eventIterator`, TypeBox/Standard Schema event
  contract, `experimental_liveOptions`, and `ClientRetryPlugin`.
- `openspec/changes/mapgen-studio-operations-current/` — reconnect re-adopts
  daemon operation truth from `studio.operations.current`.
- `openspec/changes/mapgen-studio-runtime-one-mount/` — the watch procedure
  must live on the one `/rpc` surface.

## What Changes

- Add a TypeBox/Standard Schema sealed event union:
  `hello | operation | live-game`.
- Add a production EventHub service object backed by Effect `PubSub` and
  exposed through `StudioServerContext` so the package watch procedure and
  future app-side publishers use the same daemon-owned bus.
- Add `studio.events.watch` to the package contract/router as an eventIterator
  procedure. It emits `hello` immediately with daemon identity and then yields
  hub events until the client disconnects.
- Wire `ClientRetryPlugin` into the Studio client link.
- Add one client subscription hook that consumes
  `orpc.studio.events.watch.experimental_liveOptions(...)`; on `hello`, it
  updates restart identity and invokes `studio.operations.current` adoption.
- Keep operation status polls, daemon watchdog, and live-game polling intact
  with their existing deletion targets S3.2/S3.3.
- Promote/delete the S3.0 proof-only package fixture once production watch
  tests cover the same guarantees.

## Non-Goals

- No operation event publishing yet. S3.2 wires registry updates into EventHub.
- No live-game watcher yet. S3.3 owns daemon-side live-game polling/publishing.
- No deletion of operation polls, watchdog, serverInfo polling, or live-game
  polling in this slice.
- No alternate transport or second event route.
- No Zod expansion for new event contracts.

## Impact

- `packages/studio-server/src/contract/*`
- `packages/studio-server/src/router/index.ts`
- `packages/studio-server/src/runtime.ts`
- `packages/studio-server/src/context.ts`
- new package EventHub service module
- `apps/mapgen-studio/src/server/{daemon,studio}/**` context construction
- `apps/mapgen-studio/src/lib/orpc.ts`
- `apps/mapgen-studio/src/app/**` event subscription/adoption hook
- focused package/app tests

## Verification Gates

- `bun run openspec -- validate mapgen-studio-event-hub --strict`
- Package tests proving subscribe -> hello, iterator close -> subscription
  cleanup, and one `/rpc` handler exposes the watch procedure.
- App tests proving the subscription hook uses `experimental_liveOptions` and
  reconnect/hello triggers `operations.current` adoption.
- Existing S1/S2 route/state tests remain green.
- Package gate: `bun x turbo run check --filter=@civ7/studio-server`.
