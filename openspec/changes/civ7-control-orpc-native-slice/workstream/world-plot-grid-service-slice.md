# World Plot/Grid Service Slice

Status: local package/CLI proof collected.
Date: 2026-06-06.

## Purpose

Add service-owned `world.plot.read` and `world.grid.read` leaves under the
native `world` router, then route `civ7 game map --plot` and
`civ7 game map --bounds` through the in-process server-side client.

This completes the current `game map` command migration without reviving
facade-only summary wrappers. Direct-control remains the low-level bounded map
probe/runtime port; control-oRPC owns the caller-facing map read projection.

## Write Set

- `packages/civ7-control-orpc/src/modules/world/contract.ts`
- `packages/civ7-control-orpc/src/modules/world/procedures/map-reads.ts`
- `packages/civ7-control-orpc/src/modules/world/router.ts`
- `packages/civ7-control-orpc/src/dependencies/direct-control.ts`
- `packages/civ7-control-orpc/src/errors.ts`
- `packages/civ7-control-orpc/src/game-ui.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/test/world-map-read-procedure.test.ts`
- `packages/cli/src/commands/game/map.ts`
- `packages/cli/test/commands/game.control.test.ts`
- OpenSpec task/spec/workstream records for this service and CLI migration.

## Behavior Boundary

- `world.plot.read` projects one bounded plot snapshot into a semantic world
  DTO without raw host, port, state, session, command, rawCommand, Tuner
  payload, or direct-control runtime envelope fields.
- `world.grid.read` projects a bounded map grid into a semantic world DTO with
  omission and probe-error source status.
- Caller input schemas are closed and reject endpoint/session/state/raw command
  fields before facade execution.
- `game map --plot` and `game map --bounds` construct native control-oRPC
  context from endpoint flags and call the in-process world service client.
- GameInfo/debug reads remain separate debug projection surfaces.
- Game-UI controller context explicitly leaves plot/grid reads unsupported in
  this slice; no controller bridge allowlist or game-resident map evidence path
  is added.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/world-map-read-procedure.test.ts test/world-current-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run --cwd packages/cli test test/commands/game.control.test.ts`
- `bun run --cwd packages/cli check`
- `bun run check:cli`
- `bun run test:cli`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- Private procedure-schema export scan; no root/runtime/CLI export of
  world plot/grid input/result schema constants was found.
- Active approval/caller-permission scan over changed surfaces; hits are
  limited to explicit retirement or proof-scan language.
- `git diff --check`.

All proof remains local package/CLI service proof only. No deployed Civ7
runtime proof, play-thread action, controller bridge allowlisting, game-UI map
support, transport expansion, broad actor catalog support, relationship labels,
or parent Task 5.x/6.x/7.x acceptance is claimed.
