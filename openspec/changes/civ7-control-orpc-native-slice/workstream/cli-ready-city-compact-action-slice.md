# CLI Ready-City Compact Action Slice

## Status

Implemented local CLI/OpenSpec proof slice.

## Purpose

Keep `civ7 game play ready-city --compact` aligned with the semantic
player-agent output rule. Compact city rows should expose production,
population-placement, and expansion follow-up guidance as semantic descriptors,
not direct-control `cli`/`cliHints` command recipes. Command help remains
responsible for exact flag combinations.

## Write Set

- `packages/cli/src/commands/game/play/ready-city.ts`
- `packages/cli/test/commands/game/play/ready-city.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/cli-ready-city-compact-action-slice.md`

## Boundary

- `ready-city --compact` now emits `surface: "ready-city"`, row-level
  `nextAction` descriptors, and top-level `nextAction` for the first compact
  action candidate.
- Compact output no longer emits direct-control `cli` strings, `cliHints`, or
  `game play ...` command recipes.
- This slice does not change direct-control ready-city source behavior,
  runtime reads, parser flags, service contracts, controller bridge, generated
  bundles, play-thread state, deployed Civ7 proof, relationship authority, or
  parent Task 5.x/6.x/7.x acceptance.
- Caller-provided approval remains retired and no approval-reason mechanic is
  introduced.

## Proof Collected

- `bun run --cwd packages/cli test -- game/play/ready-city.test.ts`
- `bun run check:cli`
- Strict OpenSpec validates for `civ7-control-orpc-native-slice` and
  `civ7-support-direct-control-modularization`.
- Compact ready-city command-recipe output scan over changed CLI source/test.
- Active approval/caller-permission scan over changed files.
- Relationship-label safety scan over changed source/test.
- `git diff --check`

## Residual Risk

This is local CLI/OpenSpec proof only. It does not prove deployed Civ7 runtime
behavior, change the underlying direct-control ready-city source, or prove
controller bridge behavior.
