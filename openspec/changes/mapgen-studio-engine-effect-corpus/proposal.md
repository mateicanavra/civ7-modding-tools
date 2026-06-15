# MapGen Studio engine Effect corpus

## Why

D0 accepted the one `/rpc` runtime surface and D1 accepted the watch-graph isolation contract. The next runtime move must not start by rewriting engines. It starts by making the runtime corpus exact.

The current Studio runtime still has a manually owned stateful island in `apps/mapgen-studio/src/server/studio/engines.ts`: operation queue, operation stores, server identity, Autoplay, Run in Game, Save/Deploy, deploy execution, Civ process restart, map config materialization, proof building, log polling, rollback, and event publication are all process-local closures. `@civ7/studio-server` wraps those closures with Effect/oRPC, while `@civ7/control-orpc` already owns a separate native Effect/oRPC surface for game UI and direct-control mutations.

D2 defines the authoritative source corpus and classification map before D3-D12 migrate code. It prevents two failure modes:

- accidentally leaving a mutation engine outside the Effect runtime plan;
- dragging retained `@civ7/control-orpc` game UI procedure authority into the Studio operation runtime just because it is also a mutation surface.

## Target Authority Refs

- `docs/projects/studio-runtime-simplification/RUNTIME-EFFECT-REFACTOR-FRAME.md` - D2 source corpus and later domino ownership.
- `docs/projects/studio-runtime-simplification/OPENSPEC-PACKET-TRAIN.md` - packet discipline and accepted D0/D1 baseline.
- `openspec/changes/mapgen-studio-runtime-one-mount/workstream/*` - D0 baseline and artifact classification.
- `openspec/changes/mapgen-studio-dev-watch-deploy-isolation/workstream/packet-*.md` - D1 accepted watch/import proof contract.
- `apps/mapgen-studio/src/server/studio/engines.ts` - current app-hosted stateful engine island.
- `packages/studio-server/src/router/index.ts`, `packages/studio-server/src/context.ts`, and `packages/studio-server/src/runtime.ts` - current Effect/oRPC wrapper and host context seam.
- `packages/civ7-control-orpc/src/**` - retained native control-oRPC surface.
- `packages/civ7-direct-control/src/**` - sanctioned direct-control atom/session owner.

## What Changes

- Add the `mapgen-studio-engine-effect-corpus` OpenSpec packet and workstream ledgers.
- Classify every current Studio runtime source into one of these statuses:
  - `studio-runtime-scope`: moves into `@civ7/studio-server` Effect services in D3-D10.
  - `retained-package-authority`: already owned by `@civ7/control-orpc`, `@civ7/direct-control`, or an existing `@civ7/studio-server` Effect service.
  - `future-domino`: intentionally owned by a named later domino with risk and re-entry trigger.
  - `delete-or-collapse`: should disappear as a distinct app-local owner once a named domino lands.
- Classify every production `@civ7/control-orpc` mutation procedure that uses `civ7ControlOrpcMutationProcedure` as retained control-oRPC authority unless a later reviewed packet explicitly says otherwise.
- Classify behavior-based `@civ7/control-orpc` state machines that do not use the mutation helper but still coordinate live game state, including display explore, display queue close/current, camera focus, and appshot capture.
- Define the service map D3-D12 consume: error spine, TypeBox spine dependency, operation runtime service, pipeline services, current operations, stream/event hub, live-game watcher, Nx dev runner, and final game-door invariant.

## Non-Goals

- No code migration in D2.
- No TypeBox conversion; D2 records D2.5 as the contract schema prerequisite.
- No active error bridge deletion; D3 owns `StudioEngineError`/status-code bridge deletion and exhaustive failure mapping.
- No event stream, live watcher, or operation runtime implementation; D4-D10 own those migrations.
- No direct-control package refactor. `@civ7/direct-control` remains the sanctioned raw session/protocol atom owner.
- No broad fallback, compatibility shim, or support-both runtime lane.

## Impact

- New OpenSpec change: `openspec/changes/mapgen-studio-engine-effect-corpus/`.
- New corpus ledgers under `openspec/changes/mapgen-studio-engine-effect-corpus/workstream/`.
- Packet train ledger updated to mark D2 status after acceptance.
- Later packets consume D2 by reference instead of rediscovering runtime ownership.

## Verification Gates

- `bun run openspec -- validate mapgen-studio-engine-effect-corpus --strict`.
- `bun run openspec:validate`.
- `git diff --check`.
- Inventory scan over:
  - `apps/mapgen-studio/src/server/studio/engines.ts`
  - `apps/mapgen-studio/src/server/runInGame/**`
  - `apps/mapgen-studio/src/server/mapConfigs/**`
  - `apps/mapgen-studio/src/server/daemon/**`
  - `apps/mapgen-studio/src/server/studio/context.ts`
  - `packages/studio-server/src/{context.ts,runtime.ts,router/index.ts,handler.ts,services/**,liveGame/**}`
  - `packages/civ7-control-orpc/src/**`
  - `packages/civ7-direct-control/src/**`
- Positive scan for every `civ7ControlOrpcMutationProcedure` production procedure and every behavior-based display/view state machine classification in `control-orpc-classification-ledger.md`.
- Positive scan for every `StudioServerContext` host-injected stateful function and classification in `runtime-corpus-ledger.md`.
- Negative review assertion: no manual Studio engine, operation store, queue, server identity owner, deploy runner, process control helper, scripting log proof helper, event publisher, or live-game watcher remains unclassified.
