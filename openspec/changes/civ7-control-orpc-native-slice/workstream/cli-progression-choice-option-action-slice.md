# CLI Progression Choice Option Action Slice

## Status

Implemented local CLI/OpenSpec proof slice.

## Purpose

Keep `civ7 game play choose-tech --options` and
`civ7 game play choose-culture --options` aligned with the semantic
player-agent output rule. Option rows should expose follow-up guidance as
semantic descriptors, not `chooseCli`, `targetCli`, or `validateCli` command
recipes. Command help remains responsible for exact flag combinations.

## Write Set

- `packages/cli/src/commands/game/play/choose-tech.ts`
- `packages/cli/src/commands/game/play/choose-culture.ts`
- `packages/cli/test/commands/game.play.technology.test.ts`
- `packages/cli/test/commands/game.play.culture.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/cli-progression-choice-option-action-slice.md`

## Boundary

- `choose-tech --options` now emits `surface: "technology-choice-options"` and
  enabled row `nextAction`, `targetAction`, and `validationAction` descriptors.
- `choose-culture --options` now emits `surface: "culture-choice-options"` and
  enabled row `nextAction`, `targetAction`, and `validationAction` descriptors.
- Option output no longer emits `chooseCli`, `targetCli`, `validateCli`, or
  `game play ...` command recipes.
- This slice does not change progression choice service behavior, parser flags,
  runtime reads, direct-control validators, controller bridge, generated
  bundles, play-thread state, deployed Civ7 proof, relationship authority, or
  parent Task 5.x/6.x/7.x acceptance.
- Caller-provided approval remains retired and no approval-reason mechanic is
  introduced.

## Proof Collected

- `bun run --cwd packages/cli test -- game.play.technology.test.ts game.play.culture.test.ts`
- `bun run check:cli`
- Strict OpenSpec validates for `civ7-control-orpc-native-slice` and
  `civ7-support-direct-control-modularization`.
- Technology/culture options command-recipe output scan over changed CLI
  source/test.
- Active approval/caller-permission scan over changed files.
- Relationship-label safety scan over changed source/test.
- `git diff --check`

## Residual Risk

This is local CLI/OpenSpec proof only. It does not prove deployed Civ7 runtime
behavior, change progression service behavior, or prove controller bridge
behavior.
