# Controller Mutation Readiness Proof Slice

Status: implemented local package proof.
Date: 2026-06-06.

## Purpose

Tighten native mutation readiness so controller-supported mutations cannot
bypass non-playable Tuner readiness with an allowlist string alone.

The serialized controller bridge already rejects mutation requests without
closed controller lifecycle, local-player, and single-local-player/hotseat
proof before dispatch. This slice moves the same proof shape into a shared
context model and has the native oRPC mutation readiness middleware require it
whenever a controller-supported mutation runs from a non-playable readiness
source.

## Write Set

- `packages/civ7-control-orpc/src/model/controller-proof.ts`
- `packages/civ7-control-orpc/src/context.ts`
- `packages/civ7-control-orpc/src/bridge/controller-ingress.ts`
- `packages/civ7-control-orpc/src/middleware/mutation-readiness.ts`
- `packages/civ7-control-orpc/test/city-production-choice-procedure.test.ts`
- this OpenSpec record, `tasks.md`, and
  `specs/civ7-control-orpc/spec.md`

## Behavior Boundary

- Controller mutation proof remains context-owned metadata, not procedure input
  or serialized caller authority.
- Native mutation readiness still reads direct-control playable status first.
- If playable status is false, a controller mutation may proceed only when the
  procedure key is listed in `supportedMutationProcedures` and the same context
  carries valid controller lifecycle, local-player, and hotseat proof.
- A context that only lists `supportedMutationProcedures` still fails with
  bounded `MUTATION_READINESS_REQUIRED` output before the mutation port runs.
- The bridge reuses the shared proof model instead of owning a separate proof
  shape.

## Non-Goals

- no new controller bridge allowlist entries;
- no transport, CLI, Studio, RPCLink, OpenAPI, or deployed UIScript behavior
  change;
- no approval/reason mechanic;
- no raw command/session/Tuner/game-UI runtime payload exposure;
- no deployed Civ7 runtime proof, play-thread action, or full `7.3`
  acceptance.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test -- city-production-choice-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc test -- city-production-choice-procedure.test.ts controller-bridge-ingress.test.ts`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- root-export scan for new controller-proof or per-procedure schema exports
- added-line scan for active approval/caller-permission mechanics
- added-line relationship-label safety scan
- `git diff --check`

## Residual Risk

This is local package proof only. It proves the native middleware gate for a
fake controller context, not live Civ7 controller deployment or runtime
mutation behavior.
