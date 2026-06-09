# Ready City CLI Field Removal Slice

## Status

Implemented local source/CLI/OpenSpec proof slice.

## Purpose

Remove literal `game play ...` command recipes from the direct-control
ready-city read contract. Ready-city should expose low-level runtime evidence:
city ids, operation args, validation results, production/town/population facts,
and semantic notes. CLI help and control-oRPC service procedures own caller
command shape and semantic mutation projection.

## Write Set

- `packages/civ7-direct-control/src/play/ready/city.ts`
- `packages/civ7-direct-control/test/ready-city-view.test.ts`
- `packages/civ7-direct-control/test/ready-city-procedure.test.ts`
- `packages/cli/test/commands/game/play/ready-city.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/ready-city-cli-field-removal-slice.md`

## Boundary

- Direct-control ready-city production candidates and town-focus options no
  longer include or schema-admit `cli` command recipes.
- Population placement no longer includes `cliHints`; it keeps a semantic
  `notes` array that distinguishes workable plot assignment from expansion
  purchase evidence.
- The read still preserves args, validation results, placement plots,
  production/town/population facts, parser flags, CLI compact semantic
  projection, control-oRPC contracts/routers, controller bridge, generated
  bundles, play-thread state, deployed Civ7 proof, relationship authority, and
  parent Task 5.x/6.x/7.x acceptance.
- Caller-provided approval remains retired and no approval-reason mechanic is
  introduced.

## Proof Collected

- `bun run --cwd packages/civ7-direct-control test test/ready-city-view.test.ts test/ready-city-procedure.test.ts`
- `bun run --cwd packages/cli test -- game/play/ready-city.test.ts`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control build`
- `bun run check:cli`
- Strict OpenSpec validates for `civ7-control-orpc-native-slice` and
  `civ7-support-direct-control-modularization`.
- Ready-city `cli`/`cliHints` source/test scan over changed files.
- Active approval/caller-permission scan over changed files.
- Relationship-label safety scan over changed files.
- `git diff --check`

## Residual Risk

This is local source/CLI/OpenSpec proof only. It does not prove deployed Civ7
runtime behavior and does not remove unrelated notification/progression
compatibility fields.
