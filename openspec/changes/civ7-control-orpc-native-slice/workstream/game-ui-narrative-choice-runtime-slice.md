# Game UI Narrative Choice Runtime Slice

Status: implemented local package/bundle proof.
Date: 2026-06-05.

## Purpose

Add a game-resident narrative-choice runtime dependency behind the
controller-supported `narrative.choice.request` service procedure.

This advances the narrative-domain controller path without adding a generic
operation tunnel, direct-control procedure-core scaffolding, or transport-first
API. The service procedure remains the caller-facing owner of semantic
narrative output and no-repeat projection; the adapter supplies ambient game-UI
notification activation plus `PlayerOperations` validation/send evidence.

## Write Set

- `packages/civ7-control-orpc/src/game-ui-narrative.ts`
- `packages/civ7-control-orpc/src/game-ui.ts`
- `packages/civ7-control-orpc/test/game-ui-controller.test.ts`
- `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js`
- this OpenSpec record, `tasks.md`, and
  `specs/civ7-control-orpc/spec.md`

## Behavior Boundary

- `@civ7/control-orpc/game-ui` lists `narrative.choice.request` as a
  supported mutation only when controller proof exists and ambient
  `Game.PlayerOperations.canStart/sendRequest`,
  `PlayerOperationTypes.CHOOSE_NARRATIVE_STORY_DIRECTION`, notification
  read/activate APIs, and controller-owned local-player evidence exist.
- The game-UI adapter returns the internal runtime-port result shape required
  by the existing service-owned narrative procedure; the procedure still owns
  caller-facing semantic projection and no-repeat next steps.
- Caller input omits `playerId`. The adapter sends with
  `GameContext.localPlayerID` where present, and the normal result projects
  that acted player evidence.
- Validator-blocked choices remain semantic `not-sent` results and do not call
  the send API.
- Sticky blockers, validation-only changes, failed/missing panel evidence,
  no-state-change, missing-postcondition, and pending-runtime-proof paths
  remain no-repeat guarded.
- Normal bridge/service output remains semantic and omits host, port, state,
  command, rawCommand, session, tuner payloads, raw game-UI function names,
  direct-control socket details, and raw
  `CHOOSE_NARRATIVE_STORY_DIRECTION` operation names.

## Non-Goals

- no generic player-operation/operationType/raw-args dispatcher;
- no direct-control root import into the game UI bundle path;
- no approval/reason mechanic;
- no direct-control procedure-core or custom oRPC plumbing;
- no runtime implementation for diplomacy or unit target ports;
- no deployed Civ7 runtime proof or play-thread action;
- no full `7.3` acceptance.

## Proof Collected

- focused `game-ui-controller`, `narrative-choice`, and
  `controller-ingress` tests;
- control-oRPC package test/check/build;
- controller mod package test/check/build with bundle scan;
- strict OpenSpec validation for `civ7-control-orpc-native-slice`;
- strict OpenSpec validation for `civ7-support-direct-control-modularization`;
- `git diff --check`.

These are local package and bundle proofs only.

## Residual Risk

The fake game runtime proves local source behavior only. Live Civ7 still must
prove that the shipped UIScript loads, detects the expected narrative APIs,
activates the relevant notification UI where needed, executes actual narrative
choice sends, and observes postconditions without repeating suspect sends.
