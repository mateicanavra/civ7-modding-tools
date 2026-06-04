# Production Choice Proof Policy Source Slice

Status: implemented source modularization.
Date: 2026-06-04.

## Scope

This slice starts Task 5.2 with a write-capable direct-control behavior owner
rather than another read wrapper. It extracts production-choice request/proof
classification policy into `@civ7/direct-control` so later native
oRPC/effect-orpc mutation procedures can consume explicit policy boundaries.

The write set is:

- `packages/civ7-direct-control/src/play/operations/production-choice-proof.ts`
  for production-choice request `verified` mapping, proof-confirmed mapping,
  and postcondition outcome mapping;
- `packages/civ7-direct-control/src/play/operations/production-choice.ts` so
  legacy request-result `verified` uses the direct-control-owned helper;
- `packages/civ7-direct-control/src/proof/production-choice-telemetry.ts` so
  telemetry projection consumes the helper rather than owning duplicate proof
  classification logic;
- focused direct-control proof tests and this OpenSpec record.

No oRPC procedure, router, middleware, context, transport, CLI/Studio bridge,
runtime send behavior, runtime proof claim, Task 5.x/6.x acceptance, or
play-thread action is part of this slice.

## Boundary

This is behavior-preserving modularization. The legacy request-result
`verified` boolean remains broader than proof confirmation. In particular,
`validation-changed` remains legacy-verified but proof-unconfirmed and
no-repeat guarded through telemetry summary policy.

This keeps the split explicit for later native oRPC work:

- request status can describe what the legacy direct-control request result
  said;
- proof confidence/no-repeat policy decides whether a sent mutation is
  confirmed and repeat-safe;
- telemetry remains a projection over the direct-control-owned policy, not the
  owner of that policy.

## Proof Captured

Verification run:

- `bun run --cwd packages/civ7-direct-control test -- production-choice-proof.test.ts production-choice-telemetry.test.ts production-choice.test.ts`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control test`
- `bun run --cwd packages/civ7-direct-control build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization
  --strict`
- `git diff --check`

The focused proof covers every `Civ7ProductionPostconditionClassification`,
including the sharp `validation-changed` case: it remains legacy-verified but
proof-unconfirmed/no-repeat guarded.
