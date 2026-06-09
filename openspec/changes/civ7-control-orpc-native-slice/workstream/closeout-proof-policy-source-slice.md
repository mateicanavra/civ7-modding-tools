# Closeout Proof Policy Source Slice

Status: implemented source modularization.
Date: 2026-06-04.

## Scope

This slice continues Task 5.2 with narrative and diplomacy closeout mutations.
It moves classifier-to-proof-confidence and outcome mapping out of telemetry
projection files and into focused proof-policy helpers.

The write set is:

- `packages/civ7-direct-control/src/proof/narrative-choice-proof-policy.ts`
  for narrative closeout proof postcondition and outcome mapping;
- `packages/civ7-direct-control/src/proof/diplomacy-response-proof-policy.ts`
  for diplomacy response proof postcondition and outcome mapping;
- `packages/civ7-direct-control/src/proof/narrative-choice-telemetry.ts` and
  `packages/civ7-direct-control/src/proof/diplomacy-response-telemetry.ts` so
  telemetry projections consume the helpers instead of owning private
  confirmation/outcome switches;
- focused direct-control proof-policy tests and this OpenSpec record.

No narrative/diplomacy runtime request code, App UI closeout code,
postcondition classifiers, schemas/descriptors, oRPC procedure/router/
middleware/context, transport, CLI/Studio bridge, runtime proof claim, Task
5.x/6.x acceptance, or play-thread action is part of this slice.

## Boundary

Runtime closeout classification remains owned by
`src/play/operations/narrative-postconditions.ts` and
`src/play/operations/diplomacy-postconditions.ts`. The proof-policy helpers
consume those source-owned classifications and decide telemetry postcondition
shape:

- `validation-changed`, `no-state-change`, `not-sent`, missing-postcondition,
  and pending-runtime-proof remain no-repeat guarded;
- current confirmed closeout semantics are preserved, including
  `narrative-panel-cleared` and `blocking-notification-changed` as confirmed
  state changes;
- legacy request `verified` behavior is not changed.

Telemetry remains a projection over proof-policy helpers, not the owner of
proof/no-repeat semantics.

## Proof Captured

Verification run:

- `bun run --cwd packages/civ7-direct-control test -- narrative-choice-proof-policy.test.ts narrative-choice-telemetry.test.ts narrative-choice.test.ts diplomacy-response-proof-policy.test.ts diplomacy-response-telemetry.test.ts diplomacy-response.test.ts`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control test`
- `bun run --cwd packages/civ7-direct-control build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

The focused proof covers every narrative and diplomacy closeout postcondition
classification, read-only closeout omission, missing postcondition evidence,
and pending-runtime-proof over otherwise confirmed classifications. Existing
telemetry and request tests preserve projection and runtime closeout behavior
without live-game proof claims.
