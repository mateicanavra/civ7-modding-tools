# CLI Traditions oRPC Slice

## Status

Local control-oRPC, CLI, and OpenSpec closure proof collected.

## Purpose

Route `civ7 game play traditions` through the native in-process
`progression.traditions.current` service procedure instead of letting the CLI
own the traditions option projection or pass through direct-control CLI command
strings.

The control-oRPC service owns caller-facing traditions input, semantic
tradition rows, action descriptors, validation-success projection,
omitted-detail policy, and next-step descriptors. `@civ7/direct-control`
remains the low-level App UI/Culture runtime evidence source.

## Write Set

- `packages/civ7-control-orpc/src/dependencies/direct-control.ts`
- `packages/civ7-control-orpc/src/errors.ts`
- `packages/civ7-control-orpc/src/game-ui.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/src/modules/progression/contract.ts`
- `packages/civ7-control-orpc/src/modules/progression/procedures/traditions-current.ts`
- `packages/civ7-control-orpc/src/modules/progression/router.ts`
- `packages/civ7-control-orpc/test/progression-traditions-procedure.test.ts`
- `packages/cli/src/commands/game/play/traditions.ts`
- `packages/cli/test/commands/game.play.progression-read.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/specs/civ7-control-orpc/spec.md`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/cli-traditions-orpc-slice.md`

## Boundary

- `progression.traditions.current` is a progression-domain decision read, not
  a broad read-wrapper catalog or `operations` root.
- The service result uses semantic action descriptors and next-step
  descriptors. CLI command strings remain caller-local presentation mapping in
  `packages/cli`.
- Normal service and CLI JSON omit raw host, port, state, session, command,
  rawCommand, direct-control runtime envelopes, direct-control
  `recommendedCli`, direct-control `actionHints[].cli`, approval/reason
  mechanics, and transport details.
- Game-UI/controller traditions support remains unsupported in this slice.
- Local tests do not prove deployed Civ7 runtime behavior.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/progression-traditions-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run --cwd packages/cli test -- game.play.progression-read.test.ts`
- `bun run check:cli`
- `bun run test:cli:play`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- Private procedure-schema export scan: traditions input/result schemas remain
  contract-local constants; no procedure schema bag is exported.
- Active approval/caller-permission scan: hits are limited to negative
  boundary wording and the focused bad-input assertion.
- Service-output CLI-string scan: `progression.traditions.current` source and
  focused procedure output contain no literal `game play ...` command strings.
- Raw runtime output scan: normal service/CLI surfaces omit raw direct-control
  runtime envelopes; endpoint/session/command fields stay context-owned.
- `git diff --check`

## Residual Risk

This is local package and CLI proof only. It does not prove deployed Civ7
runtime behavior, game-UI/controller bridge support, transport expansion,
approval/reason mechanics, a broad read-wrapper catalog, or parent Task
5.x/6.x/7.x acceptance.
