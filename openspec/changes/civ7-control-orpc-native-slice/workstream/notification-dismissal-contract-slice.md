# Notification Dismissal Service Contract Slice

Status: implemented local package/contract ownership slice.
Date: 2026-06-05.

## Purpose

Move the caller-facing `notifications.dismiss.request` input schema and normal
postcondition classification enum into `packages/civ7-control-orpc` service
ownership.

This continues the separation between service contracts and direct-control
runtime/proof ports. The procedure still calls the direct-control notification
dismissal runtime facade and consumes the direct-control proof helper for
postcondition/no-repeat semantics.

## Write Set

- `packages/civ7-control-orpc/src/modules/notifications/contract.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/test/notification-dismissal-procedure.test.ts`
- this OpenSpec record, `tasks.md`, and `specs/civ7-control-orpc/spec.md`

## Behavior Boundary

The service package now owns:

- `Civ7NotificationDismissInputSchema`
- `Civ7NotificationDismissalPostconditionClassificationSchema`

The input remains the semantic notification dismissal request shape:

- `notificationId`

It remains closed against raw command/session/tuner endpoint fields. The
classification enum is the normal service projection vocabulary; the
direct-control proof helper remains the source authority for runtime
classification and no-repeat semantics.

## Non-Goals

- no notification dismissal procedure behavior change;
- no direct-control runtime/proof helper change;
- no telemetry, persistence, CLI/Studio/browser/controller change;
- no runtime/live-game proof claim;
- no play-thread action;
- no Task 5.x/6.x/7.x parent acceptance.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/notification-dismissal-procedure.test.ts test/primitive-schemas.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- notification contract direct-control import scan
- `git diff --check`

These are local package/contract and OpenSpec proofs only.

## Residual Risk

Other mutation procedure contracts still import direct-control operation input
schemas or proof vocabularies. Those should be separated through similarly
small domain-specific slices when their service-owned caller shape is clear.
