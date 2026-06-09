# Game UI Diplomacy Response Runtime Slice

Status: implemented local package/bundle proof.
Date: 2026-06-05.

## Purpose

Add a game-resident diplomacy-response runtime dependency behind the
controller-supported `diplomacy.response.request` service procedure.

This advances the diplomacy-domain controller path without adding a generic
operation tunnel, direct-control procedure-core scaffolding, or transport-first
API. The service procedure remains the caller-facing owner of semantic
diplomacy output and no-repeat projection; the adapter supplies ambient game-UI
notification activation/blocking reads plus `PlayerOperations`
validation/send evidence.

## Write Set

- `packages/civ7-control-orpc/src/game-ui-diplomacy.ts`
- `packages/civ7-control-orpc/src/game-ui.ts`
- `packages/civ7-control-orpc/test/game-ui-controller.test.ts`
- `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js`
- this OpenSpec record, `tasks.md`, and
  `specs/civ7-control-orpc/spec.md`

## Behavior Boundary

- `@civ7/control-orpc/game-ui` lists `diplomacy.response.request` as a
  supported mutation only when controller proof exists and ambient
  `Game.PlayerOperations.canStart/sendRequest`,
  `PlayerOperationTypes.RESPOND_DIPLOMATIC_ACTION`, diplomacy notification
  read/activate/blocking APIs, and controller-owned local-player evidence
  exist.
- The game-UI adapter returns the internal runtime-port result shape required
  by the existing service-owned diplomacy procedure; the procedure still owns
  caller-facing semantic projection and no-repeat next steps.
- Caller input omits `playerId`. The adapter sends with
  `GameContext.localPlayerID` where present, and the normal result projects
  that acted player evidence.
- Validator-blocked responses remain semantic `not-sent` results and do not
  call the send API.
- Sticky blockers, validation-only changes, failed/missing blocker evidence,
  no-state-change, missing-postcondition, and pending-runtime-proof paths
  remain no-repeat guarded.
- Normal bridge/service output remains semantic and omits host, port, state,
  command, rawCommand, session, tuner payloads, UI closeout internals, raw
  game-UI function names, direct-control socket details, and raw
  `RESPOND_DIPLOMATIC_ACTION` operation names.

## Non-Goals

- no generic player-operation/operationType/raw-args dispatcher;
- no direct-control root import into the game UI bundle path;
- no approval/reason mechanic;
- no direct-control procedure-core or custom oRPC plumbing;
- no relationship labels or diplomacy relationship inference;
- no runtime implementation for unit target ports;
- no deployed Civ7 runtime proof or play-thread action;
- no full `7.3` acceptance.

## Proof Collected

- focused `game-ui-controller`, `diplomacy-response`, and
  `controller-ingress` tests;
- control-oRPC package test/check/build;
- controller mod package test/check/build with bundle scan;
- strict OpenSpec validation for `civ7-control-orpc-native-slice`;
- strict OpenSpec validation for `civ7-support-direct-control-modularization`;
- `git diff --check`.

These are local package and bundle proofs only.

## Residual Risk

The fake game runtime proves local source behavior only. Live Civ7 still must
prove that the shipped UIScript loads, detects the expected diplomacy APIs,
activates the relevant notification UI where needed, executes actual diplomacy
response sends, and observes postconditions without repeating suspect sends.
