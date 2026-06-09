# Approval Middleware Native Slice

Status: implemented local package slice.
Date: 2026-06-04.

## Purpose

Promote the repeated mutation approval gate from the production-choice and
notification-dismissal procedure leaves into one native `packages/civ7-control-orpc`
effect-oRPC middleware. This retires duplicated approval wiring without adding a
custom procedure runner, context composer, transport adapter, or direct-control
facade layer.

## Write Set

- `packages/civ7-control-orpc/src/middleware/mutation-approval.ts`
- `packages/civ7-control-orpc/src/modules/city/procedures/production-choice-request.ts`
- `packages/civ7-control-orpc/src/modules/notifications/procedures/dismiss-request.ts`
- `packages/civ7-control-orpc/test/city-production-choice-procedure.test.ts`
- `packages/civ7-control-orpc/test/notification-dismissal-procedure.test.ts`
- this OpenSpec record and `tasks.md`

## Behavior Boundary

The shared middleware:

- is created with `civ7ControlOrpcImplementer.middleware(...)`, the native
  effect-oRPC builder middleware primitive;
- reads explicit mutation approval from typed oRPC context;
- rejects missing approval, non-approved approval, and empty approval reasons
  before the direct-control mutation port runs;
- passes the approved context value forward with `next({ context: { approval } })`;
- derives the error `procedureKey` from native procedure metadata, with the oRPC
  path as a fallback evidence label.

The production-choice and notification-dismissal procedures continue to own
their service output projection, while `@civ7/direct-control` continues to own
runtime authority, validators, command serialization, postcondition
classification, and proof/no-repeat semantics.

## Non-Goals

- no custom middleware framework, procedure-core scaffold, context composer,
  correlation bus, or before-handler wiring;
- no validator-first or postcondition/proof middleware promotion in this slice;
- no CLI, Studio, HTTP/RPCLink, OpenAPI, global bridge, or in-game UIScript
  adapter work;
- no runtime/live-game proof claim from local package tests;
- no Task 5.x or 6.x parent acceptance beyond the recorded subitems;
- no new mutation procedure leaf or broad mutation catalog.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test city-production-choice-procedure.test.ts notification-dismissal-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

Focused proof covers both mutation leaves rejecting missing and empty approval
before direct-control mutation ports run, preserving approved context pass-through,
and retaining each procedure's semantic output/no-repeat projection. These are
local package proofs only.

## Residual Risk

Shared validator-first, postcondition/proof, runtime proof sink, and caller policy
middleware remain pending. The next shared middleware slice should promote only a
repeated native policy boundary that is already visible across multiple mutation
procedures and should avoid recreating effect-oRPC router or context machinery.
