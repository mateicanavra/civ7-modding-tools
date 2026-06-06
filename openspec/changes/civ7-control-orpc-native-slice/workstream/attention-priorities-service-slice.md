# Attention Priorities Service Slice

## Status

Local package, OpenSpec, and boundary-scan proof collected.

## Purpose

Add `attention.priorities` as a native service-owned priority dashboard under
the `attention` router. The procedure composes playable status, notification,
turn-completion, ready-unit/city, and optional battlefield runtime/read
evidence into ranked semantic priorities and next-step descriptors.

This is a read-only attention service. It does not send operations, infer
relationship labels, or expose CLI command syntax as service output.

## Write Set

- `packages/civ7-control-orpc/src/errors.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/src/modules/attention/contract.ts`
- `packages/civ7-control-orpc/src/modules/attention/router.ts`
- `packages/civ7-control-orpc/src/modules/attention/procedures/priorities.ts`
- `packages/civ7-control-orpc/test/attention-priorities-procedure.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/specs/civ7-control-orpc/spec.md`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/attention-priorities-service-slice.md`

## Boundary

- `attention.priorities` owns priority ranking, source statuses, summaries,
  notes, and semantic next-step descriptors.
- Direct-control remains the low-level runtime/read port provider for playable
  status, HUD/notification, turn-completion, ready-unit/city, and battlefield
  evidence.
- Procedure input/output schemas stay contract-local; callers use the aggregate
  contract/router/server client rather than per-procedure schema exports.
- Service output does not contain literal `game play ...` CLI command strings.
- Battlefield evidence is planning context only. Owner mismatch, proximity,
  contact, ranking, and action legality remain relationship-unproven without
  official relationship, team, war, or suzerain evidence.
- No raw host, port, state, session, command, rawCommand, Tuner payload,
  direct-control runtime envelope, transport expansion, play-thread action,
  action-send authority, or live runtime proof is claimed.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/attention-priorities-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
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

This is local package proof only. It does not prove deployed Civ7 runtime
behavior, controller bridge allowlisting, transport behavior, relationship
authority, action sends, or parent Task 5.x/6.x/7.x acceptance.
