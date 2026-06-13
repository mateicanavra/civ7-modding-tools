## 1. Frame

- [x] 1.1 Create S3.1 proposal/design/tasks/spec delta from the accepted plan
      and S3.0 findings.
- [x] 1.2 Run strict OpenSpec validation before implementation.
- [x] 1.3 Start watcher/review lane before code changes.

## 2. Server Event Hub

- [x] 2.1 Add TypeBox/Standard Schema event union for `hello`, `operation`,
      and `live-game`.
- [x] 2.2 Add EventHub service/API backed by Effect `PubSub`.
- [x] 2.3 Provide the daemon-created hub through `StudioServerContext` and the
      package runtime layer.
- [x] 2.4 Add `studio.events.watch` contract/router procedure with immediate
      `hello` and cleanup on iterator close.
- [x] 2.5 Promote/delete the S3.0 package spike fixture after production watch
      tests cover its guarantees.

## 3. Client Subscription

- [x] 3.1 Add `ClientRetryPlugin` to the single Studio RPC link.
- [x] 3.2 Extract a reusable operation-adoption helper from the S2.1 boot
      adoption flow.
- [x] 3.3 Add one event subscription hook using `experimental_liveOptions`.
- [x] 3.4 On `hello`, trigger `studio.operations.current` re-adoption without
      deleting the watchdog or operation polls.

## 4. Verification + Closure

- [x] 4.1 `bun run openspec -- validate mapgen-studio-event-hub --strict`.
- [x] 4.2 Focused package tests: hello delivery, cleanup, one-mount watch.
- [x] 4.3 Focused app tests: client retry plugin wiring and hello/reconnect
      re-adoption.
- [x] 4.4 Package gate: `bun x turbo run check --filter=@civ7/studio-server`.
- [x] 4.5 Downstream realignment: S3.2/S3.3 assumptions and S3.0 fixture
      disposition recorded.
- [ ] 4.6 Graphite submit/merge/drain according to repo rules.
