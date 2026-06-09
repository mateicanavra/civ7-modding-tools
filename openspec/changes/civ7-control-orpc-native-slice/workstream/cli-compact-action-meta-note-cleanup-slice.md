# CLI Compact Action Meta Note Cleanup Slice

## Intent

Remove repeated compact-output notes that explain command help owns exact flag
combinations. Compact JSON should carry minimal semantic action context,
domain facts, and proof/safety notes; it should not repeat interface-design
commentary on every surface.

## Write Set

- `packages/cli/src/commands/game/play/choose-celebration.ts`
- `packages/cli/src/commands/game/play/choose-culture.ts`
- `packages/cli/src/commands/game/play/choose-government.ts`
- `packages/cli/src/commands/game/play/choose-narrative.ts`
- `packages/cli/src/commands/game/play/choose-tech.ts`
- `packages/cli/src/commands/game/play/priorities.ts`
- `packages/cli/src/commands/game/play/traditions.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/cli-compact-action-meta-note-cleanup-slice.md`

## Boundary

- No parser flag change.
- No direct-control runtime behavior change.
- No control-oRPC contract/router/controller bridge change.
- No action descriptor shape change.
- No deployed Civ7 runtime proof or play-thread action.
- Caller-provided approval remains retired; no approval or approval-reason
  mechanic is introduced.

## Proof Collected

- `bun run --cwd packages/cli test -- game.play.progression-read.test.ts`
- `bun run --cwd packages/cli test -- game/play/priorities.test.ts`
- `bun run --cwd packages/cli test -- game.play.technology.test.ts game.play.culture.test.ts`
- `bun run --cwd packages/cli test -- game.play.celebration-government.test.ts game.play.narrative.test.ts`
- `bun run check:cli`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- Targeted scans verified the repeated compact meta note is absent and this
  slice did not introduce active approval/caller-permission or
  relationship-label wording.
