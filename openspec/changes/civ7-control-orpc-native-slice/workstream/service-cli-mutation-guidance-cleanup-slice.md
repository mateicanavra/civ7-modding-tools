# Service/CLI Mutation Guidance Cleanup Slice

## Purpose

Remove remaining verbose send-oriented wording from service and CLI planning
surfaces. Action labels, priority reasons, notes, and omitted reasons should
carry the minimal semantic distinction needed for play: validation, inspection,
or mutation boundary. Help text owns exact command syntax.

## Write Set

- `packages/civ7-control-orpc/src/game-ui-attention.ts`
- `packages/civ7-control-orpc/src/modules/attention/procedures/priorities.ts`
- `packages/civ7-control-orpc/src/modules/progression/procedures/dashboard-current.ts`
- `packages/civ7-control-orpc/test/attention-priorities-procedure.test.ts`
- `packages/cli/src/commands/game/play/choose-celebration.ts`
- `packages/cli/src/commands/game/play/choose-culture.ts`
- `packages/cli/src/commands/game/play/choose-government.ts`
- `packages/cli/src/commands/game/play/choose-narrative.ts`
- `packages/cli/src/commands/game/play/choose-tech.ts`
- `packages/cli/src/commands/game/play/front-summary.ts`
- `packages/cli/src/commands/game/play/rehydrate.ts`
- `packages/cli/src/commands/game/play/traditions.ts`
- `packages/cli/src/commands/game/play/unit-move-preview.ts`
- `packages/cli/test/commands/game/play/priorities.test.ts`
- `packages/cli/test/commands/game/play/unit-move-preview.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/service-cli-mutation-guidance-cleanup-slice.md`

## Behavior

- Replaces "before sending", "before any send", and "send-ready" phrasing with
  shorter semantic mutation/validation wording.
- Keeps `traditions --compact` validator-first output: validation-failed rows
  produce read-only `validate-tradition-change` descriptors and are not emitted
  in `recommendedActions`.
- Does not change procedure contracts, parser flags, direct-control runtime
  behavior, controller bridge behavior, deployed Civ7 runtime behavior, or
  play-thread state.
- Caller-provided approval remains retired; no approval/reason mechanic is
  introduced.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test -- attention-priorities-procedure.test.ts progression-dashboard-procedure.test.ts game-ui-controller.test.ts`
- `bun run --cwd packages/cli test -- game/play/priorities.test.ts game/play/unit-move-preview.test.ts game.play.tactical-read.test.ts game.play.rehydrate.test.ts game.play.progression-read.test.ts game.play.technology.test.ts game.play.culture.test.ts game.play.celebration-government.test.ts game.play.narrative.test.ts`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run check:cli`
- `bun run openspec validate civ7-control-orpc-native-slice --strict`
- `bun run openspec validate civ7-support-direct-control-modularization --strict`
- Changed runtime/source/test guidance phrase scan for `before sending`,
  `before any send`, `send-ready`, and `specialized ... command` returned no
  hits outside negative test regexes and OpenSpec's description of removed
  phrases.
- Active approval/caller-permission scan found only the standing retired/
  absent-mechanic OpenSpec boundary language in changed docs.
- Relationship-label safety scan found only existing neutral warning/proof
  wording and no new relationship labels.
- `git diff --check`
