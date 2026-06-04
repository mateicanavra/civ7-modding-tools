# Production Choice Native Procedure Slice

Status: implemented local package slice.
Date: 2026-06-04.

## Purpose

Seed the first write-capable native `packages/civ7-control-orpc` procedure
without copying direct-control procedure-core wiring or adding transport edges.
`city.production.choice.request` owns the caller-facing oRPC service contract
for a production choice while `@civ7/direct-control` remains the runtime,
validator, command-serialization, postcondition, and proof-policy owner.

## Write Set

- `packages/civ7-direct-control/src/index.ts`
- `packages/civ7-control-orpc/src/context.ts`
- `packages/civ7-control-orpc/src/dependencies/direct-control.ts`
- `packages/civ7-control-orpc/src/errors.ts`
- `packages/civ7-control-orpc/src/modules/city/contract.ts`
- `packages/civ7-control-orpc/src/modules/city/procedures/production-choice-request.ts`
- `packages/civ7-control-orpc/src/modules/city/router.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/test/city-production-choice-procedure.test.ts`
- this OpenSpec record and `tasks.md`

## Behavior Boundary

`city.production.choice.request`:

- accepts only the source-owned production choice input shape: `cityId` and
  production `args`;
- takes explicit mutation approval from typed oRPC context, not normal
  procedure input;
- uses native effect-oRPC leaf `.use(...)` middleware to reject missing or
  empty approval before the direct-control mutation port runs;
- calls the direct-control `requestCiv7ProductionChoice` runtime port with
  endpoint defaults and approved context;
- consumes direct-control production proof helpers for confirmed/unverified
  postcondition and no-repeat classification;
- returns a semantic normal output with send status, validation booleans,
  postcondition summary, no-repeat guard, and next steps;
- omits raw `host`, `port`, `state`, session, command text, command results,
  raw validation payloads, and raw telemetry records from normal output.

## Non-Goals

- no direct-control-local procedure-core, middleware runner, correlation bus,
  error bus, router registry, or context composer;
- no shared approval/validator/postcondition middleware promotion beyond the
  leaf-scoped native middleware proof;
- no CLI, Studio, HTTP/RPCLink, OpenAPI, global bridge, or in-game UIScript
  adapter work;
- no runtime/live-game proof claim from local package tests;
- no Task 5.x or 6.x parent acceptance beyond the recorded subitems;
- no notification dismissal, unit-target action, turn-send, or broad mutation
  catalog.

## Proof Collected

- `bun run --cwd packages/civ7-direct-control build`
- `bun run --cwd packages/civ7-control-orpc test city-production-choice-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc check`

Focused proof covers in-process procedure calls, server-side router client
calls, approval middleware refusal before mutation, endpoint/session/raw
command input rejection, safe tagged error projection, confirmed production
postconditions, unverified/no-repeat guarded postconditions, and validator
blocked not-sent projection. These are local package proofs only.

## Residual Risk

The middleware is intentionally leaf-scoped until a second mutation procedure
needs the same approval policy. Shared validator-first and postcondition/proof
middleware remain pending; this slice proves the native oRPC/effect-orpc hook
point and the first semantic mutation projection without claiming runtime/live
closure.
