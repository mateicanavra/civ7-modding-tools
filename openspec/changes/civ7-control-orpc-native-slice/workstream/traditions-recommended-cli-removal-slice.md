# Traditions Recommended CLI Removal Slice

## Status

Implemented local source/CLI/OpenSpec proof slice.

## Purpose

Remove the aggregate `recommendedCli` command list from the direct-control
traditions read. The native `progression.traditions.current` service already
owns caller-facing semantic action projection, and the direct-control runtime
port should provide low-level tradition ids, action ids, and validation
evidence instead of a caller command list.

## Write Set

- `packages/civ7-direct-control/src/play/progression/traditions.ts`
- `packages/civ7-direct-control/src/play/progression/reads.ts`
- `packages/civ7-direct-control/src/play/progression/traditions-procedure.ts`
- `packages/civ7-direct-control/test/progression-reads.test.ts`
- `packages/civ7-direct-control/test/traditions-view-procedure.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/traditions-recommended-cli-removal-slice.md`

## Boundary

- Direct-control traditions results no longer include aggregate
  `recommendedCli`.
- Tradition action ids, validation probes, and per-action parameters remain.
- The control-oRPC `progression.traditions.current` projection remains the
  caller-facing semantic action surface.
- This does not change CLI parser behavior, oRPC contracts/routers, controller
  bridge behavior, generated bundles, deployed Civ7 proof, play-thread state,
  relationship authority, or parent Task 5.x/6.x/7.x acceptance.
- Caller-provided approval remains retired and no approval-reason mechanic is
  introduced.

## Proof Collected

- `bun run --cwd packages/civ7-direct-control test test/progression-reads.test.ts test/traditions-view-procedure.test.ts`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control build`
- `bun run --cwd packages/cli test -- game.play.progression-read.test.ts`
- Strict OpenSpec validates for `civ7-control-orpc-native-slice` and
  `civ7-support-direct-control-modularization`.
- Direct-control traditions `recommendedCli` source/test scan.
- Active approval/caller-permission scan over changed files.
- Relationship-label safety scan over changed files.
- `git diff --check`

## Residual Risk

This is local source/CLI/OpenSpec proof only. It does not prove deployed Civ7
runtime behavior or remove per-action compatibility fields.
