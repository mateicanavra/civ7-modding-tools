# Notification Dismissal Proof Policy Source Slice

Status: implemented source modularization.
Date: 2026-06-04.

## Scope

This slice continues Task 5.2 with notification dismissal, a write-capable
direct-control atom. It moves notification-dismissal proof/no-repeat mapping
out of the telemetry projection and into a focused proof-policy helper.

The write set is:

- `packages/civ7-direct-control/src/proof/notification-dismissal-proof-policy.ts`
  for notification-dismissal proof postcondition and outcome mapping;
- `packages/civ7-direct-control/src/proof/notification-dismissal-telemetry.ts`
  so telemetry projection consumes the proof-policy helper instead of owning
  duplicate confirmation/outcome switches;
- focused direct-control proof-policy tests and this OpenSpec record.

No notification runtime classifier, dismissal command source, verification
polling, oRPC procedure/router/middleware/context, transport, CLI/Studio
bridge, runtime proof claim, Task 5.x/6.x acceptance, or play-thread action is
part of this slice.

## Boundary

Runtime outcome classification remains owned by
`src/play/notifications/postconditions.ts`, including the confirmed/unconfirmed
classification used by dismissal verification. The proof-policy helper consumes
that source-owned classification and decides the operation telemetry
postcondition shape:

- confirmed classifications summarize as confirmed and repeat-safe;
- `not-sent`, `missing-after`, `engine-front-still-live`, `no-state-change`,
  missing postcondition, and pending-runtime-proof remain no-repeat guarded;
- telemetry remains a projection over the proof-policy helper, not the owner of
  proof/no-repeat semantics.

## Proof Captured

Verification run:

- `bun run --cwd packages/civ7-direct-control test -- notification-dismissal-proof-policy.test.ts notification-dismissal-telemetry.test.ts notification-dismissal.test.ts`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control test`
- `bun run --cwd packages/civ7-direct-control build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization
  --strict`
- `git diff --check`

The focused proof covers every
`Civ7NotificationDismissalPostconditionClassification`, sent records without
postcondition evidence, and pending-runtime-proof over otherwise confirmed
classifications. Existing telemetry and request tests still preserve projection
and runtime-send behavior without live-game proof claims.
