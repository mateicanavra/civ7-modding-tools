# CLI Priorities oRPC Slice

## Status

Local CLI, package, OpenSpec, and boundary-scan proof collected.

## Purpose

Route `civ7 game play priorities` through the native in-process
`attention.priorities` server-side client. The control-oRPC service owns
priority ranking, source-status, current HUD/ready actor, optional battlefield,
and semantic next-step composition. The CLI remains an edge adapter that builds
endpoint context and maps semantic next-step descriptors into command
suggestions for CLI presentation only.

## Write Set

- `packages/civ7-control-orpc/src/errors.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/src/modules/attention/contract.ts`
- `packages/civ7-control-orpc/src/modules/attention/router.ts`
- `packages/civ7-control-orpc/src/modules/attention/procedures/priorities.ts`
- `packages/civ7-control-orpc/test/attention-priorities-procedure.test.ts`
- `packages/cli/src/commands/game/play/priorities.ts`
- `packages/cli/test/commands/game/play/priorities.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/specs/civ7-control-orpc/spec.md`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/attention-priorities-service-slice.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/cli-priorities-orpc-slice.md`

## Boundary

- CLI endpoint flags construct oRPC context; endpoint/session/state/raw command
  fields are not procedure input.
- CLI output may include command suggestions, but those strings are mapped
  locally from semantic service descriptors and are not part of the native
  service contract.
- The command stays read-only. It does not send unit/city/turn/progression
  operations or claim live runtime proof.
- Normal JSON omits raw host, port, state, session, command, rawCommand, Tuner
  payloads, direct-control runtime envelopes, and transport details.
- Battlefield evidence remains relationship-safe planning context and does not
  authorize hostile/enemy/opponent/threat labels or action sends.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/attention-priorities-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run --cwd packages/cli test -- game/play/priorities.test.ts`
- `bun run test:cli:play`
- `bun run check:cli`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- Private procedure-schema export scan; the new `attention.priorities`
  input/result schemas remain contract-local, with only the tagged error data
  schema following the package's existing public error export pattern.
- Active approval/caller-permission scan over changed surfaces; hits are only
  approval-removal proof-scan/retirement language in OpenSpec.
- Service-output CLI-string scan for `attention.priorities`; no literal
  `game play` command strings appear in the control-oRPC attention service
  source.
- `git diff --check`

## Residual Risk

This is local package and CLI proof only. It does not prove deployed Civ7
runtime behavior, play-thread state, controller bridge behavior, transport
behavior, relationship authority, action sends, or parent Task 5.x/6.x/7.x
acceptance.
