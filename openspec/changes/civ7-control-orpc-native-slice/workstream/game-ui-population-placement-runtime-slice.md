# Game UI Population Placement Runtime Slice

Status: implemented local package/bundle proof.
Date: 2026-06-05.

## Purpose

Add a game-resident population-placement runtime dependency behind the
controller-supported `city.population.place.request` service procedure.

This continues the city-domain controller path after production choice without
adding a generic operation tunnel, direct-control procedure-core scaffolding,
or transport-first API. The service procedure remains the caller-facing owner
of semantic population placement output; the adapter supplies ambient game-UI
validation, send, city-readiness, worker-placement, and expansion evidence.

## Write Set

- `packages/civ7-control-orpc/src/game-ui-population.ts`
- `packages/civ7-control-orpc/src/game-ui.ts`
- `packages/civ7-control-orpc/test/game-ui-controller.test.ts`
- `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js`
- this OpenSpec record, `tasks.md`, and
  `specs/civ7-control-orpc/spec.md`

## Behavior Boundary

- `@civ7/control-orpc/game-ui` lists `city.population.place.request` as a
  supported mutation only when controller proof exists and ambient
  `Game.PlayerOperations.canStart/sendRequest`,
  `PlayerOperationTypes.ASSIGN_WORKER`,
  `Game.CityCommands.canStart/sendRequest`, `CityCommandTypes.EXPAND`,
  `Players.get`, and `Cities.get` APIs exist.
- The game-UI adapter returns the internal runtime-port result shape required
  by the existing service-owned `city.population.place.request` procedure; the
  procedure still owns caller-facing semantic projection.
- Assign-worker sends are local-player bounded: caller `playerId` must match
  controller-owned `GameContext.localPlayerID` before any
  `PlayerOperations.sendRequest` call.
- Validator-blocked placement requests remain semantic `not-sent` results and
  do not call send APIs.
- Confirmed `population-ready-cleared` requires pre-send city readiness
  evidence and post-send evidence that readiness cleared.
- Missing ready-city evidence, failed city/player/placement state reads,
  validation-only changes, no-state-change, and unchanged placement snapshots
  remain unverified or no-repeat guarded.
- Normal bridge/service output remains semantic and omits host, port, state,
  command, rawCommand, session, tuner payloads, raw game-UI function names, and
  direct-control socket details.

## Non-Goals

- no generic player-operation/city-command/operationType/raw-args dispatcher;
- no direct-control root import into the game UI bundle path;
- no approval/reason mechanic;
- no direct-control procedure-core or custom oRPC plumbing;
- no runtime implementation for unit target, narrative, diplomacy, or
  progression game-UI mutation ports;
- no deployed Civ7 runtime proof or play-thread action;
- no full `7.3` acceptance.

## Proof Collected

- focused `game-ui-controller`, `city-population-placement`, and
  `controller-ingress` tests;
- control-oRPC package test/check/build;
- controller mod package test/check/build with bundle scan;
- strict OpenSpec validation for `civ7-control-orpc-native-slice`;
- strict OpenSpec validation for `civ7-support-direct-control-modularization`;
- `git diff --check`.

These are local package and bundle proofs only.

## Residual Risk

The fake game runtime proves local source behavior only. Live Civ7 still must
prove that the shipped UIScript loads, detects the expected PlayerOperations
and CityCommands APIs, executes actual assign-worker and expand-city requests,
and observes postconditions without repeating suspect sends.
