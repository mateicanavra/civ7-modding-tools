# Controller Context Proof Slice

Status: implemented local package proof.
Date: 2026-06-05.

## Purpose

Move controller mutation lifecycle/local-player/hotseat proof authority out of
the serialized caller envelope and into controller-owned context before native
router dispatch.

`Civ7IntelligenceBridge.invoke(...)` remains serialized ingress into the
in-process controller service. It should not let callers assert
`game-controller-ready`, `GameContext.localPlayerID`, or hotseat status as
runtime facts.

## Write Set

- `packages/civ7-control-orpc/src/bridge/controller-ingress.ts`
- `packages/civ7-control-orpc/src/game-ui.ts`
- `packages/civ7-control-orpc/test/controller-bridge-ingress.test.ts`
- `packages/civ7-control-orpc/test/game-ui-controller.test.ts`
- this OpenSpec record, `tasks.md`, and `specs/civ7-control-orpc/spec.md`

## Behavior Boundary

- Mutation request envelopes still carry semantic procedure input plus
  controller-runtime context metadata.
- Caller-supplied `controllerProof` is rejected as an extra serialized field.
- The bridge requires controller context to provide closed lifecycle,
  local-player, and single-local-player/hotseat proof before native router
  dispatch.
- The game-UI context derives that proof from ambient `UI`, `GameContext`, and
  `Players` globals when it can prove an in-game single-local-player state.
- Missing or insufficient proof fails before mutation dispatch with bounded
  bridge error output.

## Non-Goals

- no mutation runtime port implementation in the game-UI adapter;
- no deployed Civ7 runtime proof or play-thread action;
- no custom dispatcher, router, middleware, transport, or procedure-core
  scaffolding;
- no full `7.3` acceptance.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/controller-bridge-ingress.test.ts test/game-ui-controller.test.ts`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

## Residual Risk

The proof derivation is source-local and fake-runtime backed. It does not prove
that Civ7's live game process exposes `Players.getAliveHumanIds()` or
`Players.getNumAliveHumans()` with enough hotseat fidelity for runtime mutation
support. Live controller deployment and runtime proof remain pending.
