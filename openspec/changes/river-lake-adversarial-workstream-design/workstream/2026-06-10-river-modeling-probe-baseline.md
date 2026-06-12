# River Modeling Probe Baseline

Date: 2026-06-10
Owner: Codex
Scope: direct-control runtime characterization of Civ's official
`TerrainBuilder.modelRivers(...)` sequence

## Why This Exists

The current river recovery train had an unresolved contradiction:

- source and tests contained a categorical guard against
  `adapter.modelRivers(...)`;
- official Civ resources still call `TerrainBuilder.modelRivers(...)`;
- live readback still showed `TERRAIN_NAVIGABLE_RIVER` terrain with zero live
  river metadata.

This note records the bounded probe that now exists to settle that question and
the first live baseline gathered with it.

## Source Added In This Slice

- `scripts/civ7-direct-control/probe-river-modeling.ts`
- `scripts/civ7-direct-control/probe-river-modeling.test.ts`

Probe contract:

- read-only by default;
- mutating only with `--confirm-disposable-session`;
- uses the official compatibility sequence
  `modelRivers -> validateAndFixTerrain -> defineNamedRivers -> storeWaterData`;
- keeps terrain readback and river-metadata readback as separate proof classes.

## Validation Run

Commands run from the river worktree:

- `bun test scripts/civ7-direct-control/probe-river-modeling.test.ts scripts/civ7-direct-control/probe-river-writer.test.ts`
- `bun run --cwd packages/civ7-direct-control check`
- `bun scripts/civ7-direct-control/probe-river-modeling.ts --read-full-grid`
- `bun scripts/civ7-direct-control/probe-river-writer.ts --read-full-grid`
- `bun scripts/civ7-direct-control/verify-studio-run-in-game-live.ts`

## Live Baseline

Read-only baseline on the current live session:

- `TerrainBuilder.modelRivers`, `validateAndFixTerrain`,
  `defineNamedRivers`, and `storeWaterData` all exist in runtime.
- `RiverTypes` remains `NO_RIVER=-1`, `RIVER_MINOR=0`,
  `RIVER_NAVIGABLE=1`.
- `TERRAIN_NAVIGABLE_RIVER` terrain id resolves to `5`.
- Full-grid readback still shows:
  - `terrainNavigableRiver=69`
  - `river=0`
  - `navigableRiver=0`
  - `minorRiver=0`
  - `noRiver=6996`

This preserves the current strongest finding:

- raw navigable-river terrain can exist while Civ runtime river metadata is
  still entirely absent.

## Mutation Boundary

The current live session is not a neutral disposable shell:

- `verify-studio-run-in-game-live.ts` reported setup phase
  `running-game`.

Because of that, this slice did **not** run the mutating
`--confirm-disposable-session` probe against the current live session. The next
runtime-authoring proof must run inside a fresh disposable session started
through `@civ7/direct-control`, not by silently mutating an arbitrary running
game.

## Consequence For The Workstream

The categorical `modelRivers(...)` ban is still not settled product authority.
What changed is better:

1. We now have a bounded, tested probe for the official engine sequence.
2. We have live proof that the runtime surface exists.
3. We have fresh confirmation that direct terrain stamping still fails to
   produce live river metadata on the current session.
4. The next step is explicit: run the mutating probe inside a disposable fresh
   Civ session and then decide whether the ban survives evidence.
