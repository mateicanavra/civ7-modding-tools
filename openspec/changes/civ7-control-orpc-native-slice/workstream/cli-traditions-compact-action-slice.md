# CLI Traditions Compact Action Slice

## Status

Implemented local CLI/OpenSpec proof slice.

## Purpose

Keep `civ7 game play traditions --compact` aligned with the semantic
player-agent output rule. Compact tradition rows should expose the available
policy action as a small descriptor, not as repeated `change-tradition` command
recipes. Command help remains responsible for exact flag combinations.

## Write Set

- `packages/cli/src/commands/game/play/traditions.ts`
- `packages/cli/test/commands/game.play.progression-read.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/cli-traditions-compact-action-slice.md`

## Boundary

- `traditions --compact` now emits `surface: "traditions"`, row-level
  `nextAction` descriptors, and validation-success-only `recommendedActions`
  for enabled available traditions.
- Compact output no longer emits `validateCli`, `sendCli`, `sendCloseoutCli`,
  `recommendedCli`, or `game play change-tradition ...` command recipes.
- This slice does not change `progression.traditions.current` service behavior,
  service contracts, runtime direct-control reads, parser flags, controller
  bridge, generated bundles, play-thread state, deployed Civ7 proof,
  relationship authority, or parent Task 5.x/6.x/7.x acceptance.
- Caller-provided approval remains retired and no approval-reason mechanic is
  introduced.

## Proof Collected

- `bun run --cwd packages/cli test -- game.play.progression-read.test.ts`
- `bun run check:cli`
- Focused validation-failed tradition fixture proving disabled options do not
  appear in send-oriented `recommendedActions`.
- Strict OpenSpec validates for `civ7-control-orpc-native-slice` and
  `civ7-support-direct-control-modularization`.
- Compact traditions command-recipe output scan over changed CLI source/test.
- Active approval/caller-permission scan over changed files.
- Relationship-label safety scan over changed source/test.
- `git diff --check`

## Residual Risk

This is local CLI/OpenSpec proof only. It does not prove deployed Civ7 runtime
behavior, change oRPC service behavior, or prove controller bridge behavior.
