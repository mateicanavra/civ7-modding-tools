# Tradition Action Hint CLI Field Removal Slice

## Purpose

Remove the last direct-control traditions action-hint command recipe field.
`@civ7/direct-control` should keep low-level tradition action parameters and
validation evidence, while `packages/civ7-control-orpc` and CLI adapters own
semantic service/caller presentation.

## Write Set

- `packages/civ7-direct-control/src/play/progression/reads.ts`
- `packages/civ7-direct-control/src/play/progression/traditions.ts`
- `packages/civ7-direct-control/test/progression-reads.test.ts`
- `packages/civ7-direct-control/test/traditions-view-procedure.test.ts`
- `packages/civ7-control-orpc/test/progression-traditions-procedure.test.ts`
- `packages/cli/test/commands/game.play.progression-read.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/tradition-action-hint-cli-field-removal-slice.md`

## Behavior

- `Civ7TraditionActionSchema` no longer schema-admits `cli`.
- `Civ7TraditionAction` no longer exposes `cli`.
- `readTraditionsView` action hints no longer include
  `game play change-tradition ...` recipes.
- Fixtures no longer include stale aggregate `recommendedCli` or
  `actionHints[].cli`.
- Semantic control-oRPC progression output remains unchanged: action kind,
  action parameter, validation success, and next-step descriptors remain the
  caller-facing projection.

## Boundaries

- No parser flag, runtime send, control-oRPC contract/router, controller bridge,
  transport, deployed Civ7 runtime behavior, or play-thread state changes.
- No runtime/live proof claim. This is local source/CLI/oRPC/OpenSpec proof.
- No caller-provided approval or approval-reason mechanic is introduced;
  approval remains retired.
- Relationship authority is unchanged; this slice does not add relationship
  labels.
- Parent Task 5.x/6.x/7.x acceptance remains pending by implication.

## Proof Collected

- `bun run --cwd packages/civ7-direct-control test test/progression-reads.test.ts test/traditions-view-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc test -- progression-traditions-procedure.test.ts`
- `bun run --cwd packages/cli test -- game.play.progression-read.test.ts`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control build`
- `bun run check:cli`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- Traditions `actionHints[].cli` source/test scan.
- Active approval/caller-permission scan over changed files.
- Relationship-label safety scan over changed files.
- `git diff --check`
