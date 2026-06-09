# Game-UI Unit Command Runtime Slice

Status: implemented local package source seed.
Date: 2026-06-06.

## Purpose

Allow the game-resident controller bridge to invoke the service-owned unit
command mutation leaves:

- `unit.upgrade.request`
- `unit.resettle.request`

The game-UI adapter realizes only the ambient `Game.UnitCommands`, unit-read,
ready-queue, and blocker-read dependencies needed by those leaves. The native
oRPC router remains the semantic service surface; the serialized controller
bridge remains ingress into that in-process router.

## Write Set

- `packages/civ7-control-orpc/src/game-ui-unit-command.ts`
- `packages/civ7-control-orpc/src/game-ui.ts`
- `packages/civ7-control-orpc/src/bridge/controller-ingress.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/test/game-ui-controller.test.ts`
- `packages/civ7-control-orpc/test/controller-bridge-ingress.test.ts`
- regenerated `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js`
- this OpenSpec record and `tasks.md`

## Behavior Boundary

The slice:

- wires `unit.upgrade.request` through ambient
  `Game.UnitCommands.canStart/sendRequest` and
  `UnitCommandTypes.UNITCOMMAND_UPGRADE`;
- wires `unit.resettle.request` through ambient
  `Game.UnitCommands.canStart/sendRequest` and
  `UnitCommandTypes.UNITCOMMAND_RESETTLE`;
- advertises both mutations only when those exact game UI APIs, unit-read APIs,
  ready-queue APIs, blocker-read APIs, and controller proof exist;
- derives concrete serialized bridge envelope schemas from the aggregated
  `Civ7ControlOrpcContract` rather than exporting a separate procedure-schema
  surface or accepting unknown payloads;
- rejects direct adapter sends before `Game.UnitCommands.sendRequest` when the
  requested unit owner does not match fresh `GameContext.localPlayerID`
  evidence;
- uses unit snapshots, selected-unit evidence, first-ready-unit evidence, and
  end-turn-blocking notification evidence for postcondition classification;
- preserves validator-blocked `not-sent` output;
- keeps no-state-change or validation-changed sent output guarded with
  `noRepeatAfterUnverified: true`;
- keeps raw game-UI function names, command/session/state details, raw command
  text, direct-control `operation` envelopes, and legacy `verified` fields out
  of normal bridge/procedure output.

Unit procedure schemas remain contract-owned. The bridge keeps a tight semantic
envelope by extracting the contract-backed TypeBox schema metadata at ingress,
and this slice does not add public package-root exports for unit procedure
input/result schemas or standard-schema helpers.

## Non-Goals

- no generic unit-command dispatcher or operation catalog;
- no direct-control procedure-core scaffolding;
- no caller-provided send metadata mechanic;
- no raw command/session/tuner payload ingress or normal output;
- no transport/RPCLink/OpenAPI expansion;
- no CLI/Studio caller migration;
- no deployed Civ7 UIScript runtime proof;
- no play-thread action;
- no relationship labels;
- no parent Task 5.x/6.x/7.x acceptance.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/game-ui-controller.test.ts test/controller-bridge-ingress.test.ts test/unit-command-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run --cwd mods/mod-civ7-intelligence-bridge test`
- `bun run --cwd mods/mod-civ7-intelligence-bridge check`
- `bun run --cwd mods/mod-civ7-intelligence-bridge build`
- generated bundle absence scan for direct-control root/socket/session runtime,
  raw command/session payload strings, RPC transport symbols, and retired
  caller-provided send-metadata tokens
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
unit upgrade/resettle state changes after send.
