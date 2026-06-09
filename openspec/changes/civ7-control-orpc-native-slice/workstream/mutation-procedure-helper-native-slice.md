# Mutation Procedure Helper Native Slice

Status: implemented local package source seed.
Date: 2026-06-05.

## Purpose

Promote the repeated approval-plus-readiness mutation procedure chain into a
small native oRPC/effect-oRPC helper while preserving each mutation leaf as the
domain owner of service behavior and result projection.

The helper composes the existing shared approval and playable-readiness
middleware on the selected procedure leaf. It does not create a root mutation
implementer, dispatcher, router, or operation catalog.

## Write Set

- `packages/civ7-control-orpc/src/middleware/mutation-procedure.ts`
- `packages/civ7-control-orpc/src/middleware/mutation-procedure-key.ts`
- `packages/civ7-control-orpc/src/middleware/mutation-approval.ts`
- `packages/civ7-control-orpc/src/middleware/mutation-readiness.ts`
- existing mutation procedure leaves under `notifications`, `narrative`,
  `diplomacy`, `progression`, `city`, `unit`, and `turn`
- this OpenSpec record, `tasks.md`, and
  `specs/civ7-control-orpc/spec.md`

## Behavior Boundary

The shared helper:

- reuses native `.use(...)` middleware composition for approval and readiness;
- applies the middleware chain to concrete procedure leaves, not to the root
  implementer;
- preserves bad-input rejection before readiness reads or direct-control
  mutation ports are called;
- shares procedure-key extraction between mutation approval and readiness
  middleware;
- leaves each procedure's direct-control runtime port, typed error, proof
  projection, no-repeat semantics, and semantic output unchanged.

The initial root-implementer approach was rejected because focused procedure
tests showed it could run readiness before invalid input was rejected. That
ordering is a falsifier for future middleware promotion.

## Non-Goals

- no new procedures or router roots;
- no `decisions` or `operations` compatibility roots;
- no custom procedure runner, dispatcher, context bus, error bus, or
  correlation wrapper;
- no validator-first middleware promotion;
- no postcondition/proof middleware promotion;
- no telemetry propagation or persistence;
- no controller/CLI/Studio/OpenAPI edge adapter;
- no runtime/live-game proof, play-thread action, or parent Task 5.x/6.x/7.x
  acceptance.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/notification-dismissal-procedure.test.ts test/turn-completion-procedure.test.ts test/city-production-choice-procedure.test.ts test/city-population-placement-procedure.test.ts test/unit-target-action-procedure.test.ts test/narrative-choice-procedure.test.ts test/diplomacy-response-procedure.test.ts test/progression-choice-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

These are local package/source proofs only.

## Residual Risk

Validator-first policy, postcondition/proof middleware, telemetry sinks, and
runtime/live proof remain pending. Additional controller mutation ingress still
requires explicit approval/proof/lifecycle gating before dispatch.
