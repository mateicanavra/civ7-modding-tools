# CLI Map Summary World Current Slice

Status: local CLI/service proof collected.
Date: 2026-06-06.

## Purpose

Route `civ7 game map --summary` through the native `world.current`
server-side client now that current-world summary behavior is owned by
`packages/civ7-control-orpc`.

This is a CLI adapter slice over an existing service procedure. It is not a
new world read service and it does not change plot/grid diagnostics.

## Write Set

- `packages/cli/src/commands/game/map.ts`
- `packages/cli/test/commands/game.control.test.ts`
- OpenSpec task/spec/workstream records for this CLI migration.

## Behavior Boundary

- Summary mode constructs native control-oRPC context from endpoint flags and
  calls `world.current`.
- Normal JSON summary output is the semantic current-world projection.
- Summary output omits raw host, port, state, session, command, rawCommand,
  Tuner payloads, raw App UI snapshots, direct-control summary envelopes,
  actor catalogs, and relationship labels.
- `game map --plot` and `game map --bounds` remain direct-control bounded map
  diagnostics until separate accepted world/map read services exist.

## Proof Collected

- `bun run --cwd packages/cli test test/commands/game.control.test.ts`
- `bun run --cwd packages/cli check`
- `bun run check:cli`
- `bun run test:cli`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- Active approval/caller-permission scan over the changed CLI/OpenSpec
  surfaces; hits are limited to explicit retirement or absence-scan language.
- `git diff --check`.

All proof remains local CLI/service proof only. No deployed Civ7 runtime proof,
play-thread action, transport expansion, plot/grid service migration, revived
summary wrappers, relationship labels, or parent Task 5.x/6.x/7.x acceptance
is claimed.
