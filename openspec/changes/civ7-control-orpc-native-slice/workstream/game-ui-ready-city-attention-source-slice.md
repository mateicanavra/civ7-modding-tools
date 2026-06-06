# Game UI Ready-City Attention Source Slice

Status: implemented local package proof.
Date: 2026-06-06.

## Purpose

Add official game-resident ready-city evidence to the existing
service-owned `attention.current` procedure without reviving a direct-control
game-UI semantic subpath or broadening the controller bridge surface.

This closes the first attention adapter's ready-city gap for the specific
sources that can be defended in game UI scope: end-turn-blocking notification
targets that resolve to cities, and local-player population-ready city evidence
from `Players.Cities` plus `Cities.get(...).Growth`.

## Write Set

- `packages/civ7-control-orpc/src/game-ui-attention.ts`
- `packages/civ7-control-orpc/src/modules/attention/procedures/current.ts`
- `packages/civ7-control-orpc/test/game-ui-controller.test.ts`
- this OpenSpec record, `tasks.md`, `specs/civ7-control-orpc/spec.md`, and the
  historical attention service adapter record

## Behavior Boundary

- Game UI attention source handling remains service-owned in
  `packages/civ7-control-orpc`.
- The adapter treats an end-turn-blocking notification target as ready-city
  evidence only when it resolves to a city through ambient `Cities.get`.
- The adapter treats local-player population readiness as ready-city evidence
  only through `Players.Cities.get(localPlayerId).getCityIds()` plus
  `Cities.get(cityId).Growth.isReadyToPlacePopulation === true`.
- Selected city ids, requested ids, and unrelated notification targets remain
  hints only and do not become ready-city blockers or actors.
- Absent ready-city source evidence still reports `skipped-unsupported`, so
  `attention.current` cannot recommend `end-turn` from incomplete ready-actor
  coverage.
- Normal bridge/service output remains semantic and omits host, port, state,
  command, rawCommand, session, tuner payloads, and direct-control socket
  details.

## Non-Goals

- no direct-control game-UI attention export or semantic runtime port;
- no controller bridge schema/envelope changes;
- no public package-root procedure schema exports;
- no new mutation runtime implementation;
- no custom dispatcher, router, middleware, transport, or procedure-core
  scaffolding;
- no deployed Civ7 runtime proof or play-thread action;
- no full `7.3` acceptance.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/game-ui-controller.test.ts`
- `bun run --cwd packages/civ7-control-orpc test test/attention-current-procedure.test.ts test/readiness-current-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run --cwd mods/mod-civ7-intelligence-bridge build`
- `bun run --cwd mods/mod-civ7-intelligence-bridge test`
- `bun run --cwd mods/mod-civ7-intelligence-bridge check`
- generated bundle absence scan for direct-control root/socket/session runtime,
  raw command/session payload strings, RPC transport symbols, and retired
  caller-permission tokens
- private procedure-schema export scan
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

## Residual Risk

The fake game runtime proves local source behavior only. Live Civ7 still must
prove that the shipped UIScript can observe the same ready-city evidence in a
running game before this becomes deployed runtime proof or closes parent
controller task `7.3`.
