# D2 Packet Phase Record - Engine Effect Corpus

Status: accepted
Date: 2026-06-14
Domino: D2
OpenSpec change: `mapgen-studio-engine-effect-corpus`
Graphite packet branch: `codex/runtime-effect-openspec-packets`

## Frame

D2 creates the source corpus and ownership map for the full Studio runtime Effect refactor. It is accepted only when implementers can see every stateful runtime surface, retained control-oRPC mutation surface, owner, downstream domino, risk, and oracle without reading chat.

## Dependencies

- D0 accepted one-mount baseline and artifact classification.
- D1 accepted dev-watch deploy isolation.
- D2.5 owns TypeBox contract spine after this packet.
- D3-D12 consume this corpus.

## Required Review Lanes

- App-hosted engine corpus review.
- `@civ7/control-orpc` and `@civ7/direct-control` authority review.
- Adversarial omission/complexity review.

## Review Acceptance

- App-hosted engine corpus review accepted after repairs for active error bridge, live-game read model, deferred re-entry triggers, and operation phase/projection corpus.
- `@civ7/control-orpc` and `@civ7/direct-control` authority review accepted after repairs for behavior-state direct-control atom coverage and explicit risk/oracle columns.
- Adversarial omission/complexity review accepted after repairs for control-oRPC proof/risk fields and phase/projection state-machine coverage.

## Local Proofs

- `bun run openspec -- validate mapgen-studio-engine-effect-corpus --strict` passed on 2026-06-14.
- `bun run openspec:validate` passed on 2026-06-14.
- `git diff --check` passed on 2026-06-14.
- App-hosted engine symbol scan covered `createStudioEngines`, operation queue, server identity, Autoplay, Run in Game, Save/Deploy, deploy runner, materialization, restoration, scripting log, and proof builder symbols.
- `StudioServerContext`/router scan covered host-injected runtime functions and package wrapper seams.
- `@civ7/control-orpc` scan covered `civ7ControlOrpcMutationProcedure` declarations and retained display/view behavior state machines.
- Manual-state scan covered Studio Promise queue, mutable operation stores, timers, watcher flags, failure counters, and app-local `StudioEngineError` usage.
- Error/live/phase scan covered the active `StudioEngineError` bridge, live-game read model, Run in Game phase/projection helpers, and Save/Deploy phase/projection helpers.
- Shortcut scan found only negative policy statements or historical baseline classification; no D2 target escape hatch was introduced.

## Stop Conditions

D2 cannot be accepted if:

- any frame-required runtime surface lacks a ledger row;
- a `civ7ControlOrpcMutationProcedure` production declaration is omitted;
- a retained control/direct-control surface has no boundary rationale;
- a Studio app-hosted stateful engine is marked retained without a downstream deletion or migration owner;
- a deferred surface lacks owner, risk, and re-entry trigger;
- review finds an unresolved P1/P2 finding.

All stop conditions are cleared as of D2 acceptance on 2026-06-14.
