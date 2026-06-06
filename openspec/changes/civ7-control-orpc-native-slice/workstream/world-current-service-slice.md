# World Current Service Slice

Status: local package and generated-bundle proof collected.
Date: 2026-06-06.

## Purpose

Add `world.current` as a bounded service-owned current-world read in
`packages/civ7-control-orpc`. This is the replacement path for the stopped
summary-catalog approach: the procedure projects current world facts from the
existing playable/App UI snapshot runtime port, not from direct-control
summary wrappers.

## Write Set

- `packages/civ7-control-orpc/src/modules/world/**` for the contract-local
  schema, native procedure, and router.
- `packages/civ7-control-orpc/src/contract.ts`,
  `packages/civ7-control-orpc/src/router.ts`, and
  `packages/civ7-control-orpc/src/index.ts` for aggregate service exposure.
- `packages/civ7-control-orpc/src/errors.ts` for bounded tagged error data.
- `packages/civ7-control-orpc/src/game-ui.ts`,
  `packages/civ7-control-orpc/src/modules/readiness/**`, and
  `packages/civ7-control-orpc/src/bridge/controller-ingress.ts` for
  controller supported-read facts, `read-world` readiness next step, and closed
  bridge ingress over the aggregate contract.
- Focused control-oRPC tests for service projection, readiness, and bridge
  ingress.
- OpenSpec task/spec/workstream records for this bounded slice.

## Behavior Boundary

`world.current`:

- accepts a closed empty input object;
- reads the low-level playable/App UI snapshot evidence already exposed through
  context;
- projects bounded turn, local-player, map, and player-count facts;
- returns source-status fields that distinguish read versus skipped coverage;
- recommends attention/world inspection next steps without claiming runtime
  proof from local tests.

The slice deliberately does not:

- call `getCiv7MapSummary`, `getCiv7PlayerSummary`,
  `getCiv7UnitSummary`, or `getCiv7CitySummary`;
- revive `map.summary.read`, `player.summary.read`, `unit.summary.read`, or
  `city.summary.read`;
- expose actor samples, owner grouping, relationship labels, raw app-ui
  snapshot objects, host, port, state, session, command, rawCommand, Tuner
  payloads, or direct-control runtime envelopes;
- infer hostile, enemy, opponent, threat, war, ally, suzerain, or other
  relationship labels from owner ids or player counts;
- add transport, CLI, Studio, runtime proof, play-thread action, or parent
  Task 5.x/6.x/7.x acceptance.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/game-ui-controller.test.ts test/world-current-procedure.test.ts test/readiness-current-procedure.test.ts test/controller-bridge-ingress.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run --cwd mods/mod-civ7-intelligence-bridge build`
- `bun run --cwd mods/mod-civ7-intelligence-bridge test`
- `bun run --cwd mods/mod-civ7-intelligence-bridge check`
- Generated bundle absence scan for direct-control root/socket/session runtime,
  raw command/session payload strings, RPC transport symbols, and retired
  caller-permission tokens.
- Private procedure-schema export scan over the world contract, package root,
  and generated declaration surface.
- Active approval/caller-permission scan over changed control-oRPC source,
  tests, and OpenSpec records; hits are limited to explicit retirement or
  absence-scan language.
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

All proof remains local package and generated-bundle proof only until a
support-owned deployed Civ7 runtime pass proves the shipped UIScript behavior
in game.
