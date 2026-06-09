# Game UI Production Choice Runtime Slice

Status: implemented local package/bundle proof.
Date: 2026-06-05.

## Purpose

Add a game-resident production-choice runtime dependency behind the
controller-supported `city.production.choice.request` service procedure.

This advances the native in-process controller from readiness, attention,
notification dismissal, and turn completion into a common city-blocker action
without adding a generic operation tunnel, direct-control procedure-core
scaffolding, or transport-first API.

## Write Set

- `packages/civ7-control-orpc/src/game-ui-production.ts`
- `packages/civ7-control-orpc/src/game-ui.ts`
- `packages/civ7-control-orpc/test/game-ui-controller.test.ts`
- this OpenSpec record, `tasks.md`, and
  `specs/civ7-control-orpc/spec.md`

## Behavior Boundary

- `@civ7/control-orpc/game-ui` lists `city.production.choice.request` as a
  supported mutation only when controller proof exists and ambient
  `Game.CityOperations.canStart`, `Game.CityOperations.sendRequest`,
  `CityOperationTypes.BUILD`, and notification blocker read APIs exist.
- The game-UI adapter returns the internal runtime-port result shape required
  by the existing service-owned `city.production.choice.request` procedure; the
  procedure still owns caller-facing semantic projection.
- Validator-blocked production choices remain semantic `not-sent` results and
  do not call `sendRequest`.
- Confirmed `production-choice-cleared` requires a matching production blocker
  before the send and post-send evidence that the matching blocker is absent or
  no longer city-matching.
- Failed, missing, unrelated, or still-live blocker evidence remains
  unconfirmed and no-repeat guarded unless city/buildQueue/validator evidence
  proves an accepted production-state outcome.
- Selected-city/interface changes alone do not count as confirmed production
  state proof.
- Normal bridge/service output remains semantic and omits host, port, state,
  command, rawCommand, session, tuner payloads, raw game-UI function names, and
  direct-control socket details.

## Non-Goals

- no generic city-operation/operationType/raw-args dispatcher;
- no direct-control root import into the game UI bundle path;
- no direct-control procedure-core or custom oRPC plumbing;
- no runtime implementation for population placement, unit target, narrative,
  diplomacy, or progression game-UI mutation ports;
- no deployed Civ7 runtime proof or play-thread action;
- no full `7.3` acceptance.

## Proof Collected

- focused `game-ui-controller` and `city-production-choice` procedure tests;
- control-oRPC package test/check/build;
- controller mod package test/check/build with bundle scan;
- strict OpenSpec validation for `civ7-control-orpc-native-slice`;
- `git diff --check`.

These are local package and bundle proofs only.

## Residual Risk

The fake game runtime proves local source behavior only. Live Civ7 still must
prove that the shipped UIScript loads, detects the expected CityOperations APIs,
executes an actual production choice, and observes postconditions without
repeating suspect sends.
