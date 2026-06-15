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

- [ ] 3A.1 Implement or preserve `studio.events.watch` with `.effect()` and `eventIterator(...)`.
- [ ] 3A.2 Prove TypeBox event schema origin and Standard Schema adapter use.
- [ ] 3A.3 Prove iterator close, abort/disconnect, interruption, and repeated subscribe/close cleanup as separate cases.
- [ ] 3A.4 Prove one `/rpc` stream passthrough through Vite with at least two ordered chunks before upstream close.
- [ ] 3A.5 Prove `experimental_liveOptions` plus nonzero retry on the actual watch path.
- [ ] 3A.6 Promote or delete every D7 spike fixture when D8/D9 production tests cover the same guarantee.

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
