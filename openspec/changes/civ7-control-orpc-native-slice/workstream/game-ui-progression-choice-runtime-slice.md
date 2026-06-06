# Game UI Progression Choice Runtime Slice

Status: implemented local package/bundle proof.
Date: 2026-06-05.

## Purpose

Add game-resident progression-choice runtime dependencies behind the
controller-supported `progression.technology.choice.request` and
`progression.culture.choice.request` service procedures.

This advances the progression-domain controller path without adding a generic
operation tunnel, direct-control procedure-core scaffolding, or transport-first
API. The service procedures remain the caller-facing owners of semantic
progression output and post-read projection; the adapter supplies ambient
game-UI notification activation plus `PlayerOperations` validation/send
evidence.

## Write Set

- `packages/civ7-control-orpc/src/game-ui-progression.ts`
- `packages/civ7-control-orpc/src/game-ui.ts`
- `packages/civ7-control-orpc/test/game-ui-controller.test.ts`
- `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js`
- this OpenSpec record, `tasks.md`, and
  `specs/civ7-control-orpc/spec.md`

## Behavior Boundary

- `@civ7/control-orpc/game-ui` lists the technology/culture progression
  procedures as supported mutations only when controller proof exists and
  ambient `Game.PlayerOperations.canStart/sendRequest`, progression operation
  enums, `ProgressionTreeNodeTypes.NO_NODE`, notification read/activate APIs,
  and player progression reads exist.
- The game-UI adapter returns the internal runtime-port result shape required
  by the existing service-owned progression procedures; the procedures still
  own caller-facing semantic projection and post-send attention rereads.
- Caller `playerId` is not part of the public send input or send authority.
  The service derives runtime `playerId` from the game-UI notification view's
  local-player evidence, and the adapter sends with `GameContext.localPlayerID`
  where present.
- Validator-blocked choices remain semantic `not-sent` results. The adapter
  does not call the clear-target send when the choose send did not validate.
- Sticky blockers, state-changed blockers, failed post-reads, and
  pending-runtime-proof paths remain no-repeat guarded.
- Normal bridge/service output remains semantic and omits host, port, state,
  command, rawCommand, session, tuner payloads, raw game-UI function names,
  direct-control socket details, and raw `SET_*_TREE_*` operation names.

## Non-Goals

- no generic player-operation/operationType/raw-args dispatcher;
- no direct-control root import into the game UI bundle path;
- no approval/reason mechanic;
- no direct-control procedure-core or custom oRPC plumbing;
- no runtime implementation for narrative, diplomacy, or unit target ports;
- no deployed Civ7 runtime proof or play-thread action;
- no full `7.3` acceptance.

## Proof Collected

- focused `game-ui-controller`, `progression-choice`, and
  `controller-ingress` tests;
- control-oRPC package test/check/build;
- controller mod package test/check/build with bundle scan;
- strict OpenSpec validation for `civ7-control-orpc-native-slice`;
- strict OpenSpec validation for `civ7-support-direct-control-modularization`;
- `git diff --check`.

These are local package and bundle proofs only.

## Residual Risk

The fake game runtime proves local source behavior only. Live Civ7 still must
prove that the shipped UIScript loads, detects the expected progression APIs,
activates the relevant notification UI where needed, executes actual
technology/culture choice sends, and observes postconditions without repeating
suspect sends.
