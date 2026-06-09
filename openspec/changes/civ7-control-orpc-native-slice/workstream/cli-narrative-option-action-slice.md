# CLI Narrative Option Action Slice

## Status

Implemented local CLI/OpenSpec proof slice.

## Purpose

Keep `civ7 game play choose-narrative --options` aligned with the semantic
player-agent output rule. Narrative option rows and empty-option dismissal
guidance expose follow-up guidance as semantic descriptors, not command recipes.
Command help remains responsible for exact flag combinations.

## Write Set

- `packages/cli/src/commands/game/play/choose-narrative.ts`
- `packages/cli/test/commands/game.play.narrative.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/cli-narrative-option-action-slice.md`

## Boundary

- `choose-narrative --options` now emits `surface: "narrative-choice-options"`.
- Enabled option rows now expose `nextAction` and `validationAction`
  descriptors.
- Empty-option dismissal guidance now exposes `dismissalDiagnosticAction` and
  `unprovenDismissalAction` descriptors.
- Option output no longer emits `command`, `chooseCli`, `validateCli`,
  `dismissalDiagnosticCli`, `unprovenDismissalCli`, or `game play ...` command
  recipes.
- This slice does not change narrative service behavior, parser flags, runtime
  reads, direct-control validators, controller bridge, generated bundles,
  play-thread state, deployed Civ7 proof, relationship authority, or parent Task
  5.x/6.x/7.x acceptance.
- Caller-provided approval remains retired and no approval-reason mechanic is
  introduced.

## Proof Collected

- `bun run --cwd packages/cli test -- game.play.narrative.test.ts`
- `bun run check:cli`
- Strict OpenSpec validates for `civ7-control-orpc-native-slice` and
  `civ7-support-direct-control-modularization`.
- Narrative options command-recipe output scan over changed CLI source/test.
- Active approval/caller-permission scan over changed files.
- Relationship-label safety scan over changed source/test.
- `git diff --check`

## Residual Risk

This is local CLI/OpenSpec proof only. It does not prove deployed Civ7 runtime
behavior, change narrative service behavior, or prove controller bridge
behavior.
