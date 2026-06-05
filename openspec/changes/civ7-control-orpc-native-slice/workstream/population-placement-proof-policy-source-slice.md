# Population Placement Proof Policy Source Slice

Status: implemented source modularization.
Date: 2026-06-04.

## Scope

This slice continues Task 5.2 with population placement as a write-capable
decision/operation owner. It extracts population-placement request/proof
classification into focused helpers without adding oRPC procedures or changing
the generic operation runtime send path.

The write set is:

- `packages/civ7-direct-control/src/play/operations/population-placement-proof.ts`
  for legacy request `verified`, proof confirmation, and outcome mapping over
  population-placement postcondition classifications;
- `packages/civ7-direct-control/src/proof/population-placement-proof-policy.ts`
  for future telemetry/procedure consumers that need no-repeat and
  pending-runtime-proof mapping;
- `packages/civ7-direct-control/src/play/operations/validate-request.ts` so the
  generic operation request wrapper consumes the request helper instead of
  owning inline population-placement verified logic;
- focused proof-policy tests and this OpenSpec record.

No operation router source, App UI/Tuner send code, postcondition classifier,
telemetry adapter, procedure descriptor, oRPC router/middleware/context,
transport, CLI/Studio bridge, runtime proof claim, Task 5.x/6.x acceptance, or
play-thread action is part of this slice.

## Boundary

Population placement postcondition classification remains owned by
`src/play/operations/population-postconditions.ts`. The new helpers consume
those source-owned classifications:

- legacy request `verified` behavior is preserved: `population-ready-cleared`,
  `placement-state-changed`, and `validation-changed` still report a true
  request-level boolean, while `not-sent` and `no-state-change` do not;
- proof confidence is stricter than the legacy boolean: `validation-changed`,
  `no-state-change`, `not-sent`, missing postcondition, and
  pending-runtime-proof remain no-repeat guarded;
- `placement-state-changed` is treated as confirmed state-change evidence but
  remains no-repeat guarded because readiness did not clearly clear;
- `population-ready-cleared` is the only repeat-safe confirmed population
  placement postcondition in this helper.

The helper records proof semantics for future native oRPC/effect-orpc
composition; it does not itself add a mutation procedure or telemetry
projection.

## Proof Captured

Verification run:

- `bun run --cwd packages/civ7-direct-control test -- population-placement-proof-policy.test.ts population-placement.test.ts`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control test`
- `bun run --cwd packages/civ7-direct-control build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

The focused proof covers every current population-placement postcondition
classification, request-level `verified` compatibility, sent-without-
postcondition evidence, omitted no-send/no-evidence postconditions, and
pending-runtime-proof over an otherwise cleared classification. Existing
population placement fake-tuner tests preserve the accepted `ASSIGN_WORKER` and
`EXPAND` request behavior without live-game proof claims.
