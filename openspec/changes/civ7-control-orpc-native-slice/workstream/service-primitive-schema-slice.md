# Service Primitive Schema Slice

Status: implemented local package/schema ownership slice.
Date: 2026-06-05.

## Purpose

Move shared caller-facing primitive schemas for component IDs and map
locations into `packages/civ7-control-orpc` service model ownership, instead
of importing direct-control primitive value schemas into service contracts.

This reduces accidental coupling between the service root bundle and
direct-control runtime exports without changing runtime/proof authority. The
schemas are intentionally equivalent to the current direct-control primitive
schemas.

## Write Set

- `packages/civ7-control-orpc/src/model/primitives.ts`
- `packages/civ7-control-orpc/src/index.ts`
- service contracts under `src/modules/{attention,notifications,city,unit,decisions,strategy}/contract.ts`
- `packages/civ7-control-orpc/test/primitive-schemas.test.ts`
- this OpenSpec record, `tasks.md`, and `specs/civ7-control-orpc/spec.md`

## Behavior Boundary

The service model now owns:

- `Civ7ControlOrpcComponentIdSchema`
- `Civ7ControlOrpcMapLocationSchema`

These are used for caller-facing component/map fields in service contracts and
normal service outputs. Focused proof checks they accept/reject the same
representative component-id and map-location fixtures as the current
direct-control primitive schemas.

This slice does not move operation-specific input schemas, validators, or
proof helpers. Those remain direct-control runtime/proof ports until a later
service-contract slice separates them deliberately.

## Non-Goals

- no procedure behavior change;
- no change to direct-control runtime validators, proof helpers, or command
  authority;
- no schema migration away from TypeBox;
- no runtime/live-game proof claim;
- no play-thread action;
- no Task 5.x/6.x/7.x parent acceptance.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/primitive-schemas.test.ts test/attention-current-procedure.test.ts test/notification-dismissal-procedure.test.ts test/city-population-placement-procedure.test.ts test/strategy-front-summary-procedure.test.ts test/unit-target-action-procedure.test.ts test/narrative-choice-procedure.test.ts test/diplomacy-response-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- primitive import scan for `Civ7ComponentIdSchema` and
  `Civ7MapLocationSchema` in service contracts
- `git diff --check`

These are local package/schema and OpenSpec proofs only.

## Residual Risk

The root service bundle still imports direct-control value exports for
operation-specific schemas and proof helpers. That is not closed by this
primitive slice; it is the next class of service-contract/runtime-port
separation work and should be handled by smaller domain-specific slices.
