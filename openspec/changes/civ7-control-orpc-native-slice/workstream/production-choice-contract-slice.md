# Production Choice Service Contract Slice

Status: implemented local package/contract ownership slice.
Date: 2026-06-05.

## Purpose

Move the caller-facing `city.production.choice.request` input schema and normal
postcondition classification enum into `packages/civ7-control-orpc` service
ownership.

This continues the separation between service contracts and direct-control
runtime/proof ports. The procedure still calls the direct-control production
choice runtime facade and consumes the direct-control proof helpers for
postcondition/no-repeat semantics.

## Write Set

- `packages/civ7-control-orpc/src/modules/city/contract.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/test/city-production-choice-procedure.test.ts`
- this OpenSpec record, `tasks.md`, and `specs/civ7-control-orpc/spec.md`

## Behavior Boundary

The service package now owns:

- `Civ7CityProductionChoiceInputSchema`
- `Civ7CityProductionChoicePostconditionClassificationSchema`

The input remains the semantic production choice request shape:

- `cityId`
- `args`

The args schema admits exactly one valid production choice variant:

- `UnitType`
- `ProjectType`
- `ConstructibleType`
- `ConstructibleType` with `X` and `Y`

The input remains closed against approval, endpoint, session, state, and raw
command fields. The classification enum is the normal service projection
vocabulary; the direct-control proof helper remains the source authority for
runtime classification and no-repeat semantics.

## Non-Goals

- no production choice procedure behavior change;
- no direct-control runtime/proof helper change;
- no telemetry, persistence, CLI/Studio/browser/controller change;
- no runtime/live-game proof claim;
- no play-thread action;
- no Task 5.x/6.x/7.x parent acceptance.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/city-production-choice-procedure.test.ts test/primitive-schemas.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- city contract direct-control import scan
- `git diff --check`

These are local package/contract and OpenSpec proofs only.

## Residual Risk

Other mutation procedure contracts may still import direct-control operation
input schemas or proof vocabularies. Those should be separated through small
domain-specific slices when their service-owned caller shape is clear.
