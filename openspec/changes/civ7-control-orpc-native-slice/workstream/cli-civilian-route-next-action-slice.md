# CLI Civilian Route Next-Action Slice

## Status

Implemented local CLI/OpenSpec proof slice.

## Purpose

Keep `civ7 game play civilian-route-triage` follow-up suggestions semantic.
The service already emits next-step descriptors with labels and parameters; the
CLI should not expand that into a list of literal command-and-flag recipes in
normal JSON or text output. Command help remains responsible for exhaustive
interface detail.

## Write Set

- `packages/cli/src/commands/game/play/civilian-route-triage.ts`
- `packages/cli/test/commands/game.play.tactical-read.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/cli-civilian-route-triage-orpc-slice.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/cli-civilian-route-next-action-slice.md`

## Boundary

- CLI `nextInspections` now contains concise semantic labels from
  `strategy.civilianRouteTriage.nextSteps`.
- The output no longer lists `game play ...` command recipes for each possible
  follow-up.
- This slice does not change service behavior, service contracts, parser flags,
  runtime direct-control reads, controller bridge, generated bundles,
  play-thread state, deployed Civ7 proof, or parent Task 5.x/6.x/7.x
  acceptance.
- Caller-provided approval remains retired and no approval-reason mechanic is
  introduced.

## Proof Collected

- `bun run test:cli:play -- game.play.tactical-read.test.ts`
- `bun run check:cli`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- Civilian-route command-recipe output scan over changed CLI source/test.
- Active approval/caller-permission scan over changed files; no active hits.
- `git diff --check`

## Residual Risk

This is local CLI/OpenSpec proof only. It does not prove deployed Civ7 runtime
behavior, change route-triage service behavior, or prove controller bridge
behavior.
