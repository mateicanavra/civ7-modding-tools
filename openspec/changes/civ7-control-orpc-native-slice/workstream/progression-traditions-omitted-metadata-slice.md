# Progression Traditions Omitted Metadata Slice

## Status

Implemented local package/CLI proof slice.

## Purpose

Keep `progression.traditions.current` omission metadata semantic. The service
already omits command strings and low-level runtime probes from normal output;
the omission records should name service-level presentation/runtime evidence
categories instead of direct-control or CLI implementation field paths.

## Write Set

- `packages/civ7-control-orpc/src/modules/progression/procedures/traditions-current.ts`
- `packages/civ7-control-orpc/test/progression-traditions-procedure.test.ts`
- `packages/cli/test/commands/game.play.progression-read.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/progression-traditions-omitted-metadata-slice.md`

## Boundary

- `progression.traditions.current` now reports omitted
  `presentation.commandSuggestions`, `presentation.actionDirections`, and
  `runtime.validationProbe` categories.
- The output continues to omit CLI command strings, raw endpoint/session/state
  fields, direct-control runtime envelopes, and approval/reason mechanics.
- CLI compact traditions output still maps service semantics into CLI-local
  presentation; this slice does not change parser flags or command help.
- Service contract shape, runtime direct-control reads, controller bridge,
  generated bundles, play-thread state, deployed Civ7 proof, and parent
  Task 5.x/6.x/7.x acceptance are unchanged.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/progression-traditions-procedure.test.ts`
- `bun run test:cli:play -- game.play.progression-read.test.ts`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run check:cli`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- Service omission metadata scan over changed source/tests.
- Active approval/caller-permission scan over changed files; no active hits.
- `git diff --check`

## Residual Risk

This is local package/CLI proof only. It does not prove deployed Civ7 runtime
behavior, change the progression traditions service contract shape, or prove
controller bridge behavior.
