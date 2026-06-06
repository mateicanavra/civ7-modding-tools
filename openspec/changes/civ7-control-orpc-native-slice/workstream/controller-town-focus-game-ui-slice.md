# Controller Town Focus Game-UI Slice

Status: implemented local package source seed.
Date: 2026-06-06.

## Purpose

Allow the game-resident controller bridge to invoke the existing
service-owned `city.townFocus.change.request` and
`city.townFocus.review.request` procedures without adding a generic operation
dispatcher or direct-control procedure shell.

The game-UI adapter realizes only the ambient runtime dependencies needed by
those city-domain service leaves. The native oRPC router remains the semantic
service surface; the bridge remains serialized ingress into that in-process
router.

## Write Set

- `packages/civ7-control-orpc/src/game-ui-town-focus.ts`
- `packages/civ7-control-orpc/src/game-ui.ts`
- `packages/civ7-control-orpc/src/bridge/controller-ingress.ts`
- `packages/civ7-control-orpc/src/modules/city/contract.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/test/game-ui-controller.test.ts`
- `packages/civ7-control-orpc/test/controller-bridge-ingress.test.ts`
- this OpenSpec record and `tasks.md`

## Behavior Boundary

The slice:

- wires `city.townFocus.change.request` through ambient
  `Game.CityCommands.canStart/sendRequest` and
  `CityCommandTypes.CHANGE_GROWTH_MODE`;
- wires `city.townFocus.review.request` through ambient
  `Game.CityOperations.canStart/sendRequest` and
  `CityOperationTypes.CONSIDER_TOWN_PROJECT`;
- advertises both procedures only when those exact game UI APIs exist and
  controller lifecycle/local-player/hotseat proof is available;
- reuses the concrete city town-focus contract input/result schemas in the
  serialized bridge envelopes rather than accepting unknown payloads;
- rejects non-local city-owner sends before ambient send functions are called;
- preserves validator-blocked `not-sent` output;
- keeps sent game-UI town-focus outputs
  `sent-unverified`/`pending-runtime-proof` with
  `noRepeatAfterUnverified: true`;
- keeps raw game-UI function names, command/session/state details, raw command
  text, direct-control `operation` envelopes, and legacy `verified` fields out
  of normal bridge/procedure output.

The exported city TypeBox schemas remain contract-owned so the bridge can keep
a tight semantic envelope. The slice does not add public package-root exports
for town-focus procedure input/result schemas or standard-schema helpers.

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

These are local package proofs only.

## Residual Risk

Live Civ7 proof remains pending until the generated controller bundle is
deployed and exercised in a running game. The local package tests prove the
service/bridge boundary and fake ambient Game UI dependency behavior; they do
not prove Firaxis runtime API availability, command side effects, or that the
live town project review state changes after send.
