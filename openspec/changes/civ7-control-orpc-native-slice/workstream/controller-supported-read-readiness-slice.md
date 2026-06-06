# Controller Supported Read Readiness Slice

Status: implemented local package proof.
Date: 2026-06-05.

## Purpose

Repair `readiness.current` after the game-UI controller gained multiple
supported read procedures. A game-resident controller context that can execute a
read such as `strategy.frontSummary` should report observation capability, but
that must not imply broad mutation capability or Tuner-like runtime readiness.

## Write Set

- `packages/civ7-control-orpc/src/modules/readiness/contract.ts`
- `packages/civ7-control-orpc/src/modules/readiness/procedures/current.ts`
- `packages/civ7-control-orpc/test/readiness-current-procedure.test.ts`
- `packages/civ7-control-orpc/test/game-ui-controller.test.ts`
- this OpenSpec record, `tasks.md`, and `specs/civ7-control-orpc/spec.md`

## Behavior Boundary

- `readiness.current` sets `capability.canObserve: true` for
  `app-ui-game` contexts with at least one context-listed supported read
  procedure.
- `readiness.current` keeps `capability.canMutate: false` for game-UI
  controller contexts unless runtime readiness explicitly proves mutation
  capability.
- `attention.current` remains the preferred next read when it is supported or
  when the runtime is playable.
- `strategy.frontSummary` receives a dedicated `read-strategy-front` next step
  when it is the supported controller read and `attention.current` is not
  available.
- Supported mutation procedures are still listed as controller facts, but they
  do not by themselves set observe or mutation readiness.

## Non-Goals

- no new game-UI read or mutation runtime port;
- no bridge, transport, CLI, Studio, or global ingress expansion;
- no direct-control root import or direct-control procedure-core scaffolding;
- no approval/reason mechanic;
- no deployed Civ7 runtime proof or play-thread action;
- no full `7.3` acceptance.

## Proof Collected

- focused `readiness-current`, `game-ui-controller`, and
  `controller-ingress` tests;
- control-oRPC package test/check/build;
- controller mod package test/check/build with bundle scan;
- strict OpenSpec validation for `civ7-control-orpc-native-slice`;
- strict OpenSpec validation for `civ7-support-direct-control-modularization`;
- `git diff --check`.

These are local package and bundle proofs only.

## Residual Risk

The fake game runtime proves the local service projection only. Live Civ7 still
must prove that supported read procedures are useful from the shipped UIScript
without overclaiming mutation readiness or broader controller coverage.
