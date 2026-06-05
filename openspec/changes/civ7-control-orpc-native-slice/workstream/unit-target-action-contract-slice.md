# Unit Target Action Service Contract Slice

Status: implemented local package/contract ownership slice.
Date: 2026-06-05.

## Purpose

Move the caller-facing `unit.target.action.request` input schema into
`packages/civ7-control-orpc` service ownership.

This continues the separation between service contracts and direct-control
runtime/proof ports. The procedure still calls the direct-control unit target
action runtime facade and consumes the direct-control proof helper for
verification/no-repeat semantics.

## Write Set

- `packages/civ7-control-orpc/src/modules/unit/contract.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/test/unit-target-action-procedure.test.ts`
- this OpenSpec record, `tasks.md`, and `specs/civ7-control-orpc/spec.md`

## Behavior Boundary

The service package now owns:

- `Civ7UnitTargetActionInputSchema`

The input remains the semantic unit target action request shape:

- `unitId`
- bounded integer `x`
- bounded integer `y`

The input remains closed against endpoint, session, state, and raw
command fields. Unit target action verification classification, proof outcome,
and no-repeat semantics remain direct-control proof authority consumed by the
procedure.

## Non-Goals

- no unit target action procedure behavior change;
- no direct-control runtime/proof helper change;
- no telemetry, persistence, CLI/Studio/browser/controller change;
- no runtime/live-game proof claim;
- no play-thread action;
- no Task 5.x/6.x/7.x parent acceptance.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/unit-target-action-procedure.test.ts test/primitive-schemas.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- unit contract direct-control import scan
- `git diff --check`

These are local package/contract and OpenSpec proofs only.

## Residual Risk

Other procedure contracts may still import direct-control operation input
schemas or proof vocabularies. Those should be separated through small
domain-specific slices when their service-owned caller shape is clear.
