# CLI Rehydrate Action Slice

## Status

Implemented local CLI/OpenSpec proof slice.

## Purpose

Keep `civ7 game play rehydrate` aligned with the semantic player-agent output
rule. Restart snapshots should tell the agent which kind of follow-up is useful
without embedding exact CLI recipes in `commonActions`. Command help remains
responsible for exact flag combinations.

## Write Set

- `packages/cli/src/commands/game/play/rehydrate.ts`
- `packages/cli/test/commands/game.play.rehydrate.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/cli-rehydrate-action-slice.md`

## Boundary

- Rehydrate `commonActions` now emit semantic `kind`, `parameters`, `readOnly`,
  and `sendsMutation` descriptors instead of `cli` command recipes.
- HUD decision common actions are route/inspect guidance: they remain
  `readOnly: true` and `sendsMutation: false` until the agent chooses a
  specialized validated action.
- The text-mode output prints the semantic action kind instead of a command
  recipe.
- This slice does not change direct-control notification/ready-unit reads,
  continuity checks, parser flags, runtime behavior, controller bridge,
  generated bundles, play-thread state, deployed Civ7 proof, relationship
  authority, or parent Task 5.x/6.x/7.x acceptance.
- Caller-provided approval remains retired and no approval-reason mechanic is
  introduced.

## Proof Collected

- `bun run --cwd packages/cli test -- game.play.rehydrate.test.ts`
- `bun run check:cli`
- Focused HUD-decision fixture proving rehydrate does not emit mutation-sending
  guidance for generic decision routing.
- Strict OpenSpec validates for `civ7-control-orpc-native-slice` and
  `civ7-support-direct-control-modularization`.
- Rehydrate common-action command-recipe output scan over changed CLI
  source/test.
- Active approval/caller-permission scan over changed files.
- Relationship-label safety scan over changed source/test.
- `git diff --check`

## Residual Risk

This is local CLI/OpenSpec proof only. It does not prove deployed Civ7 runtime
behavior, change rehydrate runtime reads, or prove controller bridge behavior.
