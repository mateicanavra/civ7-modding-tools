# CLI Compact Priority Action Slice

## Status

Implemented local CLI/OpenSpec proof slice.

## Purpose

Keep compact player-agent output semantic for `civ7 game play priorities` and
`civ7 game play progress-dashboard`. These compact views should describe the
next play action or inspection as a semantic descriptor, not as literal CLI
syntax. Command help remains responsible for exact flag combinations.

## Write Set

- `packages/cli/src/commands/game/play/priorities.ts`
- `packages/cli/src/commands/game/play/progress-dashboard.ts`
- `packages/cli/src/game-play/semantic-envelope.ts`
- `packages/cli/test/commands/game/play/priorities.test.ts`
- `packages/cli/test/commands/game.play.progression-read.test.ts`
- `packages/cli/test/commands/game/play/semantic-envelope.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/cli-priorities-orpc-slice.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/cli-progress-dashboard-orpc-slice.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/cli-compact-priority-action-slice.md`

## Boundary

- `priorities --compact` now emits priority `nextAction` descriptors and stores
  semantic descriptors in the semantic envelope `actions` and `nextSteps`
  slots.
- `validate-unit-command` remains validation guidance in compact output:
  `readOnly: true` and `sendsMutation: false`. Only actual end-turn send
  descriptors are marked as mutation-sending here.
- `progress-dashboard --compact` now emits a semantic `nextAction` descriptor
  from the service `nextSteps` array.
- The compact outputs no longer expose `game play ...` command recipes as
  normal JSON guidance.
- This slice does not change control-oRPC service behavior, service contracts,
  runtime direct-control reads, parser flags, controller bridge, generated
  bundles, play-thread state, deployed Civ7 proof, relationship authority, or
  parent Task 5.x/6.x/7.x acceptance.
- Caller-provided approval remains retired and no approval-reason mechanic is
  introduced.

## Proof Collected

- `bun run test:cli:play -- game/play/priorities.test.ts game.play.progression-read.test.ts game/play/semantic-envelope.test.ts`
- `bun run check:cli`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- Compact command-recipe output scan over changed CLI source/test.
- Focused stale unit-command priority proof that validation guidance is not
  emitted as mutation-sending action guidance.
- Active approval/caller-permission scan over changed files; no active hits.
- Relationship-label safety scan over changed source/test.
- `git diff --check`

## Residual Risk

This is local CLI/OpenSpec proof only. It does not prove deployed Civ7 runtime
behavior, change oRPC service behavior, or prove controller bridge behavior.
