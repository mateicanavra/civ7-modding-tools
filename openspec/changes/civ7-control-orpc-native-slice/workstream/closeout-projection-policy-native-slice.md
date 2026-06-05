# Closeout Projection Policy Native Slice

Status: implemented local package slice.
Date: 2026-06-05.

## Purpose

Promote the repeated closeout-style postcondition projection in
`packages/civ7-control-orpc` into one shared service policy helper without
creating a custom procedure framework or accepting shared
validator/postcondition middleware prematurely.

The repeated behavior is narrow: after a notification dismissal, narrative
choice, or diplomacy response runtime port returns source-owned direct-control
postcondition evidence, control-oRPC derives the caller-facing confirmation
boolean and no-repeat guard fields for semantic procedure output.

## Write Set

- `packages/civ7-control-orpc/src/policy/mutation-result.ts`
- `packages/civ7-control-orpc/src/modules/notifications/procedures/dismiss-request.ts`
- `packages/civ7-control-orpc/src/modules/decisions/procedures/narrative-choice-request.ts`
- `packages/civ7-control-orpc/src/modules/decisions/procedures/diplomacy-response-request.ts`
- `packages/civ7-control-orpc/test/mutation-result-policy.test.ts`
- this OpenSpec record, `tasks.md`, and `specs/civ7-control-orpc/spec.md`

## Behavior Boundary

The shared helper:

- consumes already-classified direct-control proof postconditions;
- treats missing postconditions as unverified and no-repeat guarded;
- preserves `pending-runtime-proof` as unconfirmed and no-repeat guarded;
- marks a summary confirmed only when confidence is `confirmed` and
  `noRepeatAfterUnverified` is false;
- keeps request status and next-step derivation in the existing mutation-result
  policy owner.

Direct-control remains the source authority for notification, narrative, and
diplomacy classifications, proof outcomes, and proof-boundary confidence. The
procedures still own semantic service output and still exclude raw
command/session/payload/UI-closeout/legacy `verified` fields from normal I/O.

## Non-Goals

- no shared validator-first middleware or postcondition/proof middleware
  acceptance;
- no direct-control procedure-core scaffold, operation catalog, or raw operation
  result public type;
- no new procedure leaf, transport, CLI, Studio, bridge, or runtime/live proof;
- no inference from legacy `verified`;
- no Task 5.x or 6.x parent acceptance beyond the recorded subitem.

## Proof Collected

Planned closure gates:

- `bun run --cwd packages/civ7-control-orpc test test/mutation-result-policy.test.ts test/notification-dismissal-procedure.test.ts test/decisions-narrative-choice-procedure.test.ts test/decisions-diplomacy-response-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

These are local package/OpenSpec proofs only. Runtime proof and live mutation
closure remain out of scope.

## Residual Risk

The shared projection helper is not yet a native oRPC middleware because the
current mutation outputs remain domain-shaped. A future middleware slice should
move only an accepted common proof envelope after the service output boundary is
stable enough to avoid generic raw operation envelopes or duplicated procedure
wiring.
