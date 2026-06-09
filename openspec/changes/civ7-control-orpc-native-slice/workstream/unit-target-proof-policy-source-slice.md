# Unit Target Proof Policy Source Slice

Status: implemented source modularization.
Date: 2026-06-04.

## Scope

This slice continues Task 5.2 with unit target actions, a write-capable
direct-control atom. It moves unit-target proof/no-repeat mapping out of the
telemetry projection and into a focused proof-policy helper.

The write set is:

- `packages/civ7-direct-control/src/proof/unit-target-proof-policy.ts` for
  unit-target proof postcondition and outcome mapping;
- `packages/civ7-direct-control/src/proof/unit-target-telemetry.ts` so
  telemetry projection consumes the proof-policy helper instead of owning the
  confirmation/outcome mapping;
- focused direct-control proof-policy tests and this OpenSpec record.

No unit target runtime command source, candidate selection, bounded polling,
verification reconciliation, oRPC procedure/router/middleware/context,
transport, CLI/Studio bridge, runtime proof claim, Task 5.x/6.x acceptance, or
play-thread action is part of this slice.

## Boundary

Runtime verification remains owned by `src/play/operations/unit-target-action.ts`.
The proof-policy helper consumes the result's verification evidence and decides
the operation telemetry postcondition shape:

- unverified, missing-postcondition, and pending-runtime-proof paths stay
  no-repeat guarded;
- confirmed `target-reached`, `unit-state-changed`, and `target-state-changed`
  paths summarize as repeat-safe;
- confirmed `path-shortfall` remains no-repeat guarded because the unit moved
  but landed short of the requested target tile.

Telemetry remains a projection over the proof-policy helper, not the owner of
proof/no-repeat semantics.

## Proof Captured

Verification run:

- `bun run --cwd packages/civ7-direct-control test -- unit-target-proof-policy.test.ts unit-target-telemetry.test.ts unit-target-action.test.ts`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control test`
- `bun run --cwd packages/civ7-direct-control build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization
  --strict`
- `git diff --check`

The focused proof covers every unit-target verification classification, read-only
plan omission, missing verification evidence, and pending-runtime-proof over an
otherwise confirmed target reach. Existing telemetry and request tests still
preserve projection and runtime send/poll behavior without live-game proof
claims.
