## 1. Frame

- [x] 1.1 Create S3.0 proposal/design/tasks/spec delta from the accepted
      runtime simplification plan and merged S1/S2 context.
- [x] 1.2 Run strict OpenSpec validation before reference proof work.
- [x] 1.3 Start watcher/review lane before code changes.

## 2. Evidence Map

- [x] 2.1 Inspect installed `@orpc/contract` eventIterator schema/runtime
      support.
- [x] 2.2 Inspect `effect-orpc` procedure implementation types/runtime for
      eventIterator output compatibility.
- [x] 2.3 Inspect installed `@orpc/tanstack-query` stream helper API names and
      event-iterator requirements.
- [x] 2.4 Inspect `ClientRetryPlugin` event-iterator retry behavior.
- [x] 2.5 Inspect current Studio daemon/vite `/rpc` transport path for stream
      passthrough constraints.

## 3. Working Reference Proof

- [x] 3.1 Add a bounded reference contract/procedure proof for eventIterator
      output.
- [x] 3.2 Add an Effect `PubSub` to async-iterator adapter proof with
      observable cleanup on iterator close/client disconnect.
- [x] 3.3 Add or run a focused transport/client proof for streaming delivery
      and reconnection, or record the source-backed boundary that makes a
      narrower S3.1 proof necessary.
- [x] 3.4 Keep reference code test-local/spike-scoped, with explicit S3.1
      promotion or deletion target.

## 4. Findings + Decision

- [x] 4.1 Write `workstream/findings.md` with verdict, selected S3.1 bridge,
      evidence map, constraints, risks, and deletion/promotion targets.
- [x] 4.2 Record the installed API-name correction for TanStack oRPC stream
      helpers if it differs from the accepted plan wording.
- [x] 4.3 Update downstream plan or follow-on OpenSpec assumptions if the spike
      changes S3.1/S3.2 requirements.

## 5. Verification + Closure

- [x] 5.1 `bun run openspec -- validate mapgen-studio-stream-spike --strict`.
- [x] 5.2 Focused package/app gates for the reference proofs.
- [x] 5.3 Watcher/review disposition recorded; no P1/P2 findings unresolved.
- [ ] 5.4 Graphite submit/merge/drain according to repo rules.
