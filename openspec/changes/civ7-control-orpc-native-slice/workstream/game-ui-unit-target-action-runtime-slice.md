# Game UI Unit Target Action Runtime Slice

Status: implemented local package/bundle proof.
Date: 2026-06-05.

## Purpose

Add a game-resident unit-target runtime dependency behind the
controller-supported `unit.target.action.request` service procedure.

This advances the unit-domain controller path without adding a generic
operation tunnel, target-candidate relationship surface, direct-control
procedure-core scaffolding, or transport-first API. The service procedure
remains the caller-facing owner of semantic unit target output and no-repeat
projection; the adapter supplies ambient game-UI unit, map-unit, validation,
and send evidence.

## Write Set

- `packages/civ7-control-orpc/src/game-ui-unit-target.ts`
- `packages/civ7-control-orpc/src/game-ui.ts`
- `packages/civ7-control-orpc/test/game-ui-controller.test.ts`
- `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js`
- this OpenSpec record, `tasks.md`, and
  `specs/civ7-control-orpc/spec.md`

## Behavior Boundary

- `@civ7/control-orpc/game-ui` lists `unit.target.action.request` as a
  supported mutation only when controller proof exists and ambient
  `Game.UnitOperations.canStart/sendRequest`,
  `Game.UnitCommands.canStart/sendRequest`, `Units.get`, `MapUnits.getUnits`,
  `GameplayMap` target-index APIs, `UnitOperationTypes`,
  `UnitCommandTypes`, and `UnitOperationMoveModifiers` exist.
- The game-UI adapter returns the internal runtime-port result shape required
  by the existing service-owned unit procedure; the procedure still owns
  caller-facing semantic projection and no-repeat next steps.
- The adapter uses fixed official right-click candidate ordering: naval
  attack, air attack, ranged attack, army overrun, swap units, then `MOVE_TO`.
  It does not accept generic operation names or raw args from callers.
- Controller local-player evidence is send authority. The adapter does not
  send unless the requested `unitId.owner` matches
  `GameContext.localPlayerID`.
- Validator-blocked unit target requests remain semantic `not-sent` results
  and do not call the send API.
- Path-shortfall evidence remains confirmed but no-repeat guarded through the
  existing unit proof policy; no-state-change, missing postcondition, failed
  validation, and pending-runtime-proof paths remain guarded.
- Normal bridge/service output remains semantic and omits host, port, state,
  command, rawCommand, session, tuner payloads, send results, raw game-UI
  function names, direct-control socket details, and raw operation envelopes.

## Non-Goals

- no generic unit-operation catalog or operationType/raw-args dispatcher;
- no target-candidate relationship semantics or hostile/opponent labels;
- no direct-control root import into the game UI bundle path;
- no approval/reason mechanic;
- no direct-control procedure-core or custom oRPC plumbing;
- no deployed Civ7 runtime proof or play-thread action;
- no full `7.3` acceptance.

## Proof Collected

- focused `game-ui-controller`, `unit-target-action`, and
  `controller-ingress` tests;
- control-oRPC package test/check/build;
- controller mod package test/check/build with bundle scan;
- strict OpenSpec validation for `civ7-control-orpc-native-slice`;
- strict OpenSpec validation for `civ7-support-direct-control-modularization`;
- `git diff --check`.

These are local package and bundle proofs only.

## Residual Risk

The fake game runtime proves local source behavior only. Live Civ7 still must
prove that the shipped UIScript loads, detects the expected unit, map, and
operation APIs, executes actual unit target sends, and observes postconditions
without repeating suspect sends.
