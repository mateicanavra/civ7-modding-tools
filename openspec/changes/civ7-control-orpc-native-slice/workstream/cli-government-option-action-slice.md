# CLI Government Option Action Slice

## Status

Implemented local CLI/OpenSpec proof slice.

## Purpose

Keep `civ7 game play choose-celebration --options` and `civ7 game play
choose-government --options` aligned with the semantic player-agent output
rule. Option rows expose follow-up guidance as semantic descriptors, not
`chooseCli` or `validateCli` command recipes. Command help remains responsible
for exact flag combinations.

## Write Set

- `packages/cli/src/commands/game/play/choose-celebration.ts`
- `packages/cli/src/commands/game/play/choose-government.ts`
- `packages/cli/test/commands/game.play.celebration-government.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/cli-government-option-action-slice.md`

## Boundary

- `choose-celebration --options` now emits
  `surface: "celebration-choice-options"` and enabled row `nextAction` /
  `validationAction` descriptors.
- `choose-government --options` now emits `surface: "government-choice-options"`
  and enabled row `nextAction` / `validationAction` descriptors.
- Option output no longer emits `chooseCli`, `validateCli`, or `game play ...`
  command recipes.
- This slice does not change celebration/government service behavior, parser
  flags, runtime reads, direct-control validators, controller bridge, generated
  bundles, play-thread state, deployed Civ7 proof, relationship authority, or
  parent Task 5.x/6.x/7.x acceptance.
- Caller-provided approval remains retired and no approval-reason mechanic is
  introduced.

## Proof Collected

- `bun run --cwd packages/cli test -- game.play.celebration-government.test.ts`
- `bun run check:cli`
- Strict OpenSpec validates for `civ7-control-orpc-native-slice` and
  `civ7-support-direct-control-modularization`.
- Celebration/government options command-recipe output scan over changed CLI
  source/test.
- Active approval/caller-permission scan over changed files.
- Relationship-label safety scan over changed source/test.
- `git diff --check`

## Residual Risk

This is local CLI/OpenSpec proof only. It does not prove deployed Civ7 runtime
behavior, change celebration/government service behavior, or prove controller
bridge behavior.
