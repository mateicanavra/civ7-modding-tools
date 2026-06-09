# Unit Target Action Native Procedure Slice

Status: implemented local package slice.
Date: 2026-06-04.

## Purpose

Seed a native `packages/civ7-control-orpc` unit-domain procedure for an
approved unit target action without copying direct-control procedure-core wiring
or adding transport edges. `unit.target.action.request` owns the caller-facing
oRPC service contract for a unit target action under the unit router while
`@civ7/direct-control` remains the runtime, validator, command-serialization,
bounded verification, postcondition, and proof/no-repeat owner.

## Write Set

- `packages/civ7-direct-control/src/index.ts`
- `packages/civ7-control-orpc/src/contract.ts`
- `packages/civ7-control-orpc/src/dependencies/direct-control.ts`
- `packages/civ7-control-orpc/src/errors.ts`
- `packages/civ7-control-orpc/src/metadata.ts`
- `packages/civ7-control-orpc/src/router.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/src/modules/unit/contract.ts`
- `packages/civ7-control-orpc/src/modules/unit/router.ts`
- `packages/civ7-control-orpc/src/modules/unit/procedures/target-action-request.ts`
- `packages/civ7-control-orpc/test/unit-target-action-procedure.test.ts`
- this OpenSpec record and `tasks.md`

## Behavior Boundary

`unit.target.action.request`:

- lives under the semantic `unit` router family and keeps
  `procedureKey: "unit.target.action.request"` as the stable capability key;
- accepts only the source-owned unit target input shape: `unitId`, `x`, and
  `y`;
- takes explicit mutation approval from typed oRPC context through the shared
  native effect-oRPC approval middleware, not normal procedure input;
- calls the direct-control `requestCiv7UnitTargetAction` runtime port with
  endpoint defaults and approved context;
- consumes the direct-control unit-target proof helper for confirmed,
  unverified, missing-postcondition, and no-repeat classification;
- returns semantic normal output with target, send status, candidate validation
  summary, postcondition summary, no-repeat guard, and next steps;
- distinguishes repeat-safe confirmed sends from confirmed-but-guarded
  `path-shortfall` sends with `sent-guarded`;
- keeps unverified, missing-postcondition, not-sent, and guarded paths
  no-repeat guarded;
- omits raw `host`, `port`, `state`, session, command text, command result
  payloads, candidate raw `result`, `sendResult`, legacy `verified`, raw
  telemetry, and command-source internals from normal output.

## Non-Goals

- no direct-control procedure-core, middleware runner, context composer,
  router registry, correlation bus, error bus, or transport adapter;
- no broad operations catalog or operations entry router;
- no setup, restart, autoplay, turn-send, reveal-map, generic operation, or
  read-only facade-wrapper claim;
- no shared validator/postcondition middleware promotion in this slice;
- no CLI, Studio, HTTP/RPCLink, OpenAPI, global bridge, or in-game UIScript
  adapter work;
- no runtime/live-game proof claim from local package tests;
- no Task 2.9.4, 5.x, or 6.x parent acceptance beyond the recorded subitems;
- no play-thread action.

## Proof Collected

- `bun run --cwd packages/civ7-direct-control build`
- `bun run --cwd packages/civ7-control-orpc test unit-target-action-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control test -- unit-target-proof-policy.test.ts unit-target-action.test.ts`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization
  --strict`
- `git diff --check`

Focused proof covers in-process procedure calls, server-side router client
calls, shared approval middleware refusal before mutation, endpoint/session/raw
command input rejection, safe tagged error projection, confirmed target-reached
repeat-safe postconditions, confirmed `path-shortfall` no-repeat guarded
postconditions, unverified `no-state-change` no-repeat guarded postconditions,
missing-postcondition guarding, and validator-blocked not-sent projection.
These are local package proofs only.

## Residual Risk

Shared validator-first, postcondition/proof, safe-error, and correlation
middleware remain pending. This slice adds a concrete unit-domain mutation
procedure, but it does not claim a broad operation catalog, operations entry
router, or parent Task 5.x/6.x acceptance. Runtime proof remains pending until
a support-owned real-game verification slice explicitly exercises the procedure
against a responsive Civ7 session.
