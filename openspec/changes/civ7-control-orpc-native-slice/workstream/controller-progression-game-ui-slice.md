# Controller Progression Game-UI Slice

Status: implemented local package source seed.
Date: 2026-06-06.

## Purpose

Allow the game-resident controller bridge to invoke the remaining progression
mutation leaves that already live under the service-owned progression router:

- `progression.technology.target.request`
- `progression.culture.target.request`
- `progression.attribute.purchase.request`
- `progression.attribute.review.request`
- `progression.tradition.change.request`
- `progression.tradition.review.request`

The game-UI adapter realizes ambient `Game.PlayerOperations` dependencies only.
The native oRPC router remains the semantic service surface; the serialized
controller bridge remains ingress into that in-process router.

## Write Set

- `packages/civ7-control-orpc/src/game-ui-progression.ts`
- `packages/civ7-control-orpc/src/game-ui.ts`
- `packages/civ7-control-orpc/src/bridge/controller-ingress.ts`
- `packages/civ7-control-orpc/src/modules/progression/contract.ts`
- `packages/civ7-control-orpc/src/typebox-standard-schema.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/test/game-ui-controller.test.ts`
- `packages/civ7-control-orpc/test/controller-bridge-ingress.test.ts`
- regenerated `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js`
- this OpenSpec record and `tasks.md`

## Behavior Boundary

The slice:

- wires target/player-choice progression leaves through ambient
  `Game.PlayerOperations.canStart/sendRequest`;
- uses exact player-operation enum facts for target, attribute, and tradition
  requests;
- advertises those mutation leaves only when the exact game UI APIs and
  controller proof exist;
- derives concrete serialized bridge envelope schemas from the aggregated
  `Civ7ControlOrpcContract` rather than importing another procedure-schema
  surface or accepting unknown payloads;
- rejects direct adapter sends when requested player does not match
  `GameContext.localPlayerID`;
- preserves validator-blocked `not-sent` output;
- keeps sent game-UI target/player-choice outputs
  `sent-unverified`/`pending-runtime-proof` with
  `noRepeatAfterUnverified: true`;
- keeps raw game-UI function names, command/session/state details, raw command
  text, direct-control `operation` envelopes, and legacy `verified` fields out
  of normal bridge/procedure output.

Progression procedure schemas remain contract-owned. The bridge keeps a tight
semantic envelope by extracting the contract-backed TypeBox schema metadata at
ingress, and this slice does not add public package-root exports for progression
procedure input/result schemas or standard-schema helpers.

## Non-Goals

- no generic operation dispatcher or operation catalog;
- no direct-control procedure-core scaffolding;
- no approval/reason mechanic;
- no raw command/session/tuner payload ingress or normal output;
- no transport/RPCLink/OpenAPI expansion;
- no CLI/Studio caller migration;
- no deployed Civ7 UIScript runtime proof;
- no play-thread action;
- no relationship labels;
- no parent Task 5.x/6.x/7.x acceptance.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/controller-bridge-ingress.test.ts`
- `bun run --cwd packages/civ7-control-orpc test test/game-ui-controller.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run --cwd mods/mod-civ7-intelligence-bridge test`
- `bun run --cwd mods/mod-civ7-intelligence-bridge check`
- `bun run --cwd mods/mod-civ7-intelligence-bridge build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

These are local package and generated-bundle proofs only.

## Residual Risk

Live Civ7 proof remains pending until the generated controller bundle is
deployed and exercised in a running game. The local package tests prove the
service/bridge boundary and fake ambient Game UI dependency behavior; they do
not prove Firaxis runtime API availability, command side effects, or that live
progression target/attribute/tradition state changes after send.
