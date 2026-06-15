## 1. Packet Entrance

- [x] 1.1 Confirm D0-D6 are accepted in `OPENSPEC-PACKET-TRAIN.md`.
- [x] 1.2 Classify the existing `mapgen-studio-stream-spike` change as S3.0 implementation-closure history requiring D7 frame-standard repair.
- [x] 1.3 Complete D7 transport/API and hardening/black-ice prework scouts.
- [x] 1.4 Run D7 transport/API, testing/proof, downstream realignment, hardening/prework, and black-ice review lanes.
- [x] 1.5 Record packet entrance proof: branch/status, selected baseline, dirty-file quarantine, and Graphite stack state.

## 2. Packet Scope

- [x] 2.1 Select `effect-orpc` `.effect()` plus `eventIterator(...)` as the production watch bridge.
- [x] 2.2 Reject plain oRPC `.handler()` as a production Studio event bridge.
- [x] 2.3 Specify TypeBox event union through the owned Standard Schema adapter.
- [x] 2.4 Specify Effect `PubSub` subscription scope cleanup requirements.
- [x] 2.5 Specify separate iterator close, abort/disconnect, interruption, and repeated subscribe/close cleanup proofs.
- [x] 2.6 Specify one `/rpc` transport and two-ordered-chunk Vite proxy passthrough proof.
- [x] 2.7 Specify `experimental_liveOptions` and reject stale/accumulating client helper shapes for Studio events.
- [x] 2.8 Specify explicit nonzero retry owner on the actual watch path.
- [x] 2.9 Specify spike fixture promotion/deletion obligations for D8/D9.

## 3. Packet Proof Strategy

- [x] 3.1 Define contract/router tests for `eventIterator(...)` through `.effect()`.
- [x] 3.2 Define Effect subscription cleanup tests with observable subscriber/dequeue counts.
- [x] 3.3 Define separate abort/disconnect, interruption, and repeated subscribe/close tests.
- [x] 3.4 Define Vite `/rpc` two-ordered-chunk stream passthrough test.
- [x] 3.5 Define client live-options and retry-owner tests.
- [x] 3.6 Define negative searches for alternate routes, stale helper vocabulary, plain handler bridge, default-only retry claims, and unowned spike fixtures.

## 3A. Future Implementation Closure Gates

These are D7 implementation obligations recorded by this packet, not pre-acceptance authoring tasks.

- [x] 3A.1 Implement or preserve `studio.events.watch` with `.effect()` and `eventIterator(...)`.
- [x] 3A.2 Prove TypeBox event schema origin and Standard Schema adapter use.
- [x] 3A.3 Prove iterator close, abort/disconnect, interruption, and repeated subscribe/close cleanup as separate cases.
- [x] 3A.4 Prove one `/rpc` stream passthrough through Vite with at least two ordered chunks before upstream close.
- [x] 3A.5 Prove `experimental_liveOptions` plus nonzero retry on the actual watch path.
- [x] 3A.6 Promote or delete every D7 spike fixture when D8/D9 production tests cover the same guarantee.

Implementation evidence:

- `packages/studio-server/src/router/index.ts` still implements `studio.events.watch` through `oe.studio.events.watch.effect(...)`, and `packages/studio-server/src/contract/studio.ts` still owns the TypeBox event union through the Standard Schema `eventIterator(...)` adapter.
- `bun run --cwd packages/studio-server test -- test/handler.test.ts test/contractTypeboxSpine.test.ts` passed with package proofs for iterator `return()`, response-body cancel/disconnect cleanup, hub shutdown/interruption cleanup, repeated subscribe/close, event delivery, and TypeBox/Standard Schema contract origin.
- `bun run --cwd apps/mapgen-studio test -- test/devServer/viteProxyStream.test.ts test/studioEvents/operationAdoption.test.ts` passed with Vite `/rpc` two-ordered-chunk passthrough and actual watch-path `experimental_liveOptions` query-function nonzero retry proof.
- D7 introduces no new spike-only fixture. Historical S3/D8 references remain classified downstream in the D8/D9 packet records, not as D7 production paths.

## 4. Verification

- [x] 4.1 `bun run openspec -- validate mapgen-studio-stream-spike --strict`.
- [x] 4.2 `bun run openspec:validate`.
- [x] 4.3 `git diff --check`.
- [x] 4.4 Shortcut/black-ice scan.
- [x] 4.5 `git status --short --branch`, `gt status`, and `gt log --no-interactive`.

## 5. Closure

- [x] 5.1 Record review acceptance in `review-disposition-ledger.md`.
- [x] 5.2 Mark D7 accepted in `OPENSPEC-PACKET-TRAIN.md`.
- [x] 5.3 Commit accepted D7 packet through Graphite with clean/quarantined worktree state.
- [x] 5.4 Record fresh implementation-diff review disposition with no unresolved P1/P2.
- [x] 5.5 Commit D7 implementation changes through Graphite with clean/quarantined worktree state.

Post-commit disposition:

- D7 implementation is committed at the current `codex/runtime-effect-stream-spike` branch tip (`fix(studio): harden event stream cleanup`).
- Post-amend `git status --short --branch` is clean.
