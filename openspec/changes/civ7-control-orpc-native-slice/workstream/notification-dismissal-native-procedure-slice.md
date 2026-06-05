# Notification Dismissal Native Procedure Slice

Status: implemented local package slice.
Date: 2026-06-04.

## Purpose

Seed the second write-capable native `packages/civ7-control-orpc` procedure
without copying direct-control procedure-core wiring or adding transport edges.
`notifications.dismiss.request` owns the caller-facing oRPC service contract
for a reviewed notification dismissal while `@civ7/direct-control` remains the
runtime, App UI command,  postcondition, verification, and proof-policy
owner.

## Write Set

- `packages/civ7-direct-control/src/index.ts`
- `packages/civ7-control-orpc/src/dependencies/direct-control.ts`
- `packages/civ7-control-orpc/src/errors.ts`
- `packages/civ7-control-orpc/src/modules/notifications/contract.ts`
- `packages/civ7-control-orpc/src/modules/notifications/procedures/dismiss-request.ts`
- `packages/civ7-control-orpc/src/modules/notifications/router.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/test/notification-dismissal-procedure.test.ts`
- this OpenSpec record and `tasks.md`

## Behavior Boundary

`notifications.dismiss.request`:

- accepts only the source-owned notification dismissal input shape:
  `notificationId`;
- takes explicit readiness from typed oRPC context, not normal
  procedure input;
- uses native effect-oRPC leaf `.use(...)` middleware to reject missing or
  failed readiness before the direct-control mutation port runs;
- calls the direct-control `requestCiv7NotificationDismissal` runtime port with
  endpoint defaults and readiness context;
- consumes the direct-control notification dismissal proof helper for
  confirmed/unverified postcondition and no-repeat classification;
- returns a semantic normal output with send status, pre/post validation
  summary, postcondition summary, no-repeat guard, and next steps;
- omits raw `host`, `port`, `state`, session, command text, route result
  payloads, legacy `verified`, verification attempts, raw telemetry, and
  closeout-route internals from normal output.

## Non-Goals

- no direct-control-local procedure-core, middleware runner, correlation bus,
  error bus, router registry, or context composer;
- no shared validator/postcondition middleware promotion beyond the repeated
  leaf-scoped native middleware proof; shared readiness promotion is recorded in
  the later readiness-middleware slice;
- no CLI, Studio, HTTP/RPCLink, OpenAPI, global bridge, or in-game UIScript
  adapter work;
- no runtime/live-game proof claim from local package tests;
- no Task 5.x or 6.x parent acceptance beyond the recorded subitems;
- no broad notification catalog, narrative/diplomacy closeout, unit-target
  action, turn-send, or play-thread action.

## Proof Collected

- `bun run --cwd packages/civ7-direct-control build`
- `bun run --cwd packages/civ7-control-orpc test notification-dismissal-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control test`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization
  --strict`
- `git diff --check`

Focused proof covers in-process procedure calls, server-side router client
calls, readiness middleware refusal before mutation, endpoint/session/raw command
input rejection, safe tagged error projection, confirmed notification dismissal
postconditions, stale/unverified no-repeat guarded postconditions, and
validator-blocked not-sent projection. These are local package proofs only.

## Residual Risk

Validator/postcondition/no-repeat safety is now repeated across two mutation procedure leaves, making shared
native readiness middleware the next policy-layering candidate. The later
readiness-middleware slice owns that cross-leaf promotion. Shared validator-first
and postcondition/proof middleware also remain pending until a clean common
shape is proven without custom wrapper plumbing.
