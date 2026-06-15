## 1. Packet Entrance

- [x] 1.1 Confirm D0-D7 are accepted in `OPENSPEC-PACKET-TRAIN.md`.
- [x] 1.2 Classify the existing `mapgen-studio-event-hub` change as historical
      implementation-closure notes requiring D8 frame-standard repair.
- [x] 1.3 Complete D8 prework, testing/vendor-alignment, downstream, and
      hardening/black-ice scout lanes.
- [x] 1.4 Run D8 event-hub ownership, testing/vendor-alignment,
      hardening/black-ice, and downstream realignment review lanes.
- [x] 1.5 Record packet entrance proof: branch/status, selected baseline,
      dirty-file quarantine, dependency/build entrance, and Graphite stack
      state.

## 2. Packet Scope

- [x] 2.1 Specify daemon-owned `StudioEventHub` as the one production event bus.
- [x] 2.2 Specify TypeBox event union `hello | operation | live-game` through
      the owned Standard Schema adapter.
- [x] 2.3 Specify `studio.events.watch` as the only watch procedure on the
      existing `/rpc` mount.
- [x] 2.4 Specify `effect-orpc` `.effect()` plus `eventIterator(...)` as the
      watch bridge inherited from D7.
- [x] 2.5 Specify immediate `hello` emission with daemon identity and
      observation time.
- [x] 2.6 Specify Effect `PubSub` subscription ownership and cleanup on iterator
      close, client abort/disconnect, runtime/fiber interruption, repeated
      subscribe/close, and hub shutdown.
- [x] 2.7 Specify client `experimental_liveOptions` consumption with explicit
      nonzero retry on the actual watch path.
- [x] 2.8 Specify `hello` reconnect adoption through `studio.operations.current`
      and the D6 adoption helper.
- [x] 2.9 Specify D9/D10 downstream deletion owners for operation polling,
      daemon watchdog, live-game polling, and live-game browser timers.
- [x] 2.10 Specify D7 spike fixture promotion/deletion obligations.

## 3. Packet Proof Strategy

- [x] 3.1 Define contract/router tests for TypeBox `eventIterator(...)` through
      `.effect()`.
- [x] 3.2 Define EventHub tests for `hello` delivery and subsequent hub event
      delivery after `hello`.
- [x] 3.3 Define cleanup tests with observable subscriber count or equivalent
      proof for iterator close.
- [x] 3.4 Define separate abort/disconnect, runtime/fiber interruption, hub
      shutdown, and repeated subscribe/close cleanup proofs.
- [x] 3.5 Define one `/rpc` route proof and negative search for alternate event
      routes.
- [x] 3.6 Define app hook tests for `experimental_liveOptions`, actual-path
      nonzero retry, and `hello` adoption through `studio.operations.current`.
- [x] 3.7 Define downstream parity constraints for D9/D10 so D8 does not delete
      polling before event publishers exist.
- [x] 3.8 Define negative searches for Zod event schemas, browser event
      recovery, alternate buses, stale stream helper vocabulary, and unowned
      spike fixtures.

## 3A. Future Implementation Closure Gates

These are D8 implementation obligations recorded by this packet, not
pre-acceptance authoring tasks.

- [x] 3A.1 Implement or preserve one daemon-owned `StudioEventHub` instance.
- [x] 3A.2 Implement or preserve TypeBox `hello | operation | live-game` event
      union through the owned Standard Schema adapter.
- [x] 3A.3 Implement or preserve `studio.events.watch` with `.effect()` and
      `eventIterator(...)` on the one `/rpc` mount.
- [x] 3A.4 Prove `hello` is the first event and includes daemon identity.
- [x] 3A.5 Prove subsequent hub events flow through the same watch iterator.
- [x] 3A.6 Prove iterator close, client abort/disconnect, runtime/fiber
      interruption, hub shutdown, and repeated subscribe/close cleanup.
- [x] 3A.7 Prove client `experimental_liveOptions` and explicit nonzero retry
      on the actual watch path.
- [x] 3A.8 Prove `hello` calls `studio.operations.current` adoption without
      page reload or browser request-id recovery.
- [x] 3A.9 Promote or delete D7 spike-only fixtures after equivalent production
      watch tests exist.

Implementation evidence:

- `StudioEventHub` remains the daemon-owned bus created by
  `apps/mapgen-studio/src/server/daemon/daemon.ts` and supplied through
  `StudioServerContext` into the package runtime. The daemon owns the single
  `StudioRpcHandle`; `createStudioRpcHandler(...).dispose()` now stops the
  live-game watcher, disposes the ManagedRuntime, and shuts down the daemon hub
  so open watch readers settle without a second daemon-side shutdown path.
- `packages/studio-server/src/contract/studio.ts` exports the TypeBox
  `studioEventSchema`, and `contractTypeboxSpine.test.ts` proves the sealed
  `hello | operation | live-game` union while retaining canonical operation DTO
  reuse.
- `handler.test.ts` proves `studio.events.watch` hello-first delivery,
  published hub-event delivery after hello, iterator close, response-body
  cancel, hub shutdown/pending-read interruption, RPC-handle disposal
  interruption, and repeated subscribe/close cleanup.
- `operationAdoption.test.ts` proves actual watch-path nonzero retry,
  `experimental_liveOptions`, and `hello` adoption through
  `studio.operations.current` without request-id/status replay.
- D7 spike delivery/hello/cleanup/one-route/retry assertions are now covered by
  production handler, Vite proxy, and app hook tests. This does not claim D9/D10
  product parity: operation publisher parity, operation polling/watchdog
  deletion, live-game publisher cadence, and browser live-game timer deletion
  remain owned by D9/D10.

## 4. Verification

- [x] 4.1 `bun run openspec -- validate mapgen-studio-event-hub --strict`.
- [x] 4.2 `bun run openspec:validate`.
- [x] 4.3 `git diff --check`.
- [x] 4.4 Shortcut/black-ice scan.
- [x] 4.5 `git status --short --branch`, `gt status`, and
      `gt log --no-interactive`.
- [x] 4.6 `bun run --cwd packages/studio-server test -- test/handler.test.ts
      test/contractTypeboxSpine.test.ts`.
- [x] 4.7 `bun run --cwd apps/mapgen-studio test --
      test/studioEvents/operationAdoption.test.ts test/server/oneMount.test.ts`.
- [x] 4.8 `bun run nx run @civ7/studio-server:test --outputStyle=static`.
- [x] 4.9 `bun run nx run mapgen-studio:test --outputStyle=static`.
- [x] 4.10 `bun run nx run mapgen-studio:check --outputStyle=static`.
- [x] 4.11 `bun run --cwd packages/studio-server check`.
- [x] 4.12 `bun run --cwd packages/studio-server build`.
- [x] 4.13 `bun run nx run @civ7/studio-server:check --outputStyle=static`.
      The graph-owned Habitat/Grit dependency was repaired in the separate
      lower Graphite slice `codex/runtime-effect-domain-contract-import-surface`
      (`af366fbd0 fix(mapgen): align recipe domain contract imports`), which
      reconciles the current Habitat domain-root import policy with the D1
      daemon import-graph isolation oracle before this D8 event-hub slice.

## 5. Closure

- [x] 5.1 Record review acceptance in `review-disposition-ledger.md`.
- [x] 5.2 Mark D8 accepted in `OPENSPEC-PACKET-TRAIN.md`.
- [x] 5.3 Record fresh implementation-diff review disposition.
- [x] 5.4 Resolve or formally disposition the graph-owned
      `@civ7/studio-server:check` Habitat/Grit failure without claiming D8
      green.
- [x] 5.5 Commit D8 implementation through Graphite with clean/quarantined
      worktree state.
