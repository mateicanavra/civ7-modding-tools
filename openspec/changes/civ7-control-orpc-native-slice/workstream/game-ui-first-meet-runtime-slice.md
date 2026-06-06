# Game-UI First-Meet Runtime Slice

Status: implemented local package source seed.
Date: 2026-06-06.

## Purpose

Allow the game-resident controller bridge to invoke the service-owned
`diplomacy.firstMeet.response.request` mutation leaf.

The game-UI adapter realizes only the ambient `Game.PlayerOperations` and
notification-read dependencies needed by that leaf. The native oRPC router
remains the semantic service surface; the serialized controller bridge remains
ingress into that in-process router.

## Write Set

- `packages/civ7-control-orpc/src/game-ui-first-meet.ts`
- `packages/civ7-control-orpc/src/game-ui.ts`
- `packages/civ7-control-orpc/src/bridge/controller-ingress.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/test/game-ui-controller.test.ts`
- `packages/civ7-control-orpc/test/controller-bridge-ingress.test.ts`
- regenerated `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js`
- this OpenSpec record and `tasks.md`

## Behavior Boundary

The slice:

- wires `diplomacy.firstMeet.response.request` through ambient
  `Game.PlayerOperations.canStart/sendRequest` and
  `PlayerOperationTypes.RESPOND_DIPLOMATIC_FIRST_MEET`;
- advertises the mutation only when those exact game UI APIs, notification
  blocker APIs, and controller proof exist;
- derives the serialized bridge envelope schemas from the aggregated
  `Civ7ControlOrpcContract` rather than importing a separate procedure-schema
  surface or accepting unknown payloads;
- omits caller `playerId` from bridge input and routes sends through fresh
  `GameContext.localPlayerID` evidence before ambient send functions are
  called;
- uses strict end-turn-blocking `NOTIFICATION_PLAYER_MET` target evidence for
  `metPlayerId` before treating a cleared first-meet blocker as confirmed;
- preserves validator-blocked `not-sent` output;
- keeps unmatched, transitioned, or sticky first-meet blocker evidence
  `sent-unverified` with `noRepeatAfterUnverified: true`;
- keeps raw game-UI function names, command/session/state details, raw command
  text, direct-control `operation` envelopes, and legacy `verified` fields out
  of normal bridge/procedure output.

First-meet procedure schemas remain contract-owned. The bridge keeps a tight
semantic envelope by extracting the contract-backed TypeBox schema metadata at
ingress, and this slice does not add public package-root exports for first-meet
procedure input/result schemas or standard-schema helpers.

## Non-Goals

- no generic player-operation dispatcher or diplomacy catalog;
- no direct-control procedure-core scaffolding;
- no caller permission or reason-gate mechanic;
- no raw command/session/tuner payload ingress or normal output;
- no transport/RPCLink/OpenAPI expansion;
- no CLI/Studio caller migration;
- no deployed Civ7 UIScript runtime proof;
- no play-thread action;
- no relationship labels;
- no parent Task 5.x/6.x/7.x acceptance.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/game-ui-controller.test.ts test/controller-bridge-ingress.test.ts test/first-meet-response-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run --cwd mods/mod-civ7-intelligence-bridge test`
- `bun run --cwd mods/mod-civ7-intelligence-bridge check`
- `bun run --cwd mods/mod-civ7-intelligence-bridge build`
- generated bundle absence scan for direct-control root/socket/session runtime,
  raw command/session payload strings, RPC transport symbols, and retired
  caller-permission tokens
- private procedure-schema export scan
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

These are local package and generated-bundle proofs only.

## Residual Risk

Live Civ7 proof remains pending until the generated controller bundle is
deployed and exercised in a running game. The local package tests prove the
service/bridge boundary and fake ambient Game UI dependency behavior; they do
not prove Firaxis runtime API availability, command side effects, or that live
first-meet diplomacy state changes after send.
