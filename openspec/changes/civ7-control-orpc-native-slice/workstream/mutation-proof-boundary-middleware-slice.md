# Mutation Proof Boundary Middleware Slice

Status: implemented local package source seed.
Date: 2026-06-05.

## Purpose

Promote the repeated mutation proof/no-repeat output boundary into native
oRPC/effect-oRPC middleware without adding a custom procedure framework or
moving direct-control proof ownership.

The middleware runs after a mutation procedure handler through native
`.use(...)` composition. It reads the documented oRPC middleware result wrapper
(`result.output`) and returns the native result unchanged when the public
mutation output preserves the proof boundary.

## Write Set

- `packages/civ7-control-orpc/src/middleware/mutation-proof-boundary.ts`
- `packages/civ7-control-orpc/src/middleware/mutation-procedure.ts`
- `packages/civ7-control-orpc/src/errors.ts`
- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/test/mutation-result-policy.test.ts`
- this OpenSpec record and `tasks.md`

## Behavior Boundary

The middleware enforces only the common post-handler output invariant for
mutation procedures:

- mutation outputs must include a postcondition summary;
- the postcondition summary must expose `noRepeatAfterUnverified`;
- unverified or pending-runtime-proof postconditions must not appear
  repeat-safe;
- `sent-unverified` and `sent-guarded` outputs must carry an explicit
  `do-not-repeat` next step.

The middleware does not call direct-control, choose validators, classify domain
postconditions, infer success from legacy `verified`, serialize telemetry,
change procedure schemas, or add transport/context plumbing.

## Non-Goals

- no approval mechanic, approval replacement, or caller-provided send reason;
- no custom oRPC/effect-oRPC middleware wrapper or router framework;
- no validator-first middleware promotion;
- no telemetry sink, persistence, AI ingestion, CLI, Studio, bridge, or
  OpenAPI edge work;
- no runtime/live-game proof claim;
- no Task 5.x/6.x/7.x parent acceptance.

## Proof

Focused local proof covers the new output-boundary helper and the existing
mutation leaves under the shared middleware chain:

- `mutation-result-policy.test.ts`
- `notification-dismissal-procedure.test.ts`
- `narrative-choice-procedure.test.ts`
- `diplomacy-response-procedure.test.ts`
- `progression-choice-procedure.test.ts`
- `turn-completion-procedure.test.ts`
- `unit-target-action-procedure.test.ts`
- `city-production-choice-procedure.test.ts`

Planned closure gates:

- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `git diff --check`

These are local package/source proofs only.

## Residual Risk

Validator-first middleware and telemetry/evidence sinks remain pending. The
domain postcondition classifiers remain direct-control/source-owned; this
middleware consumes their summarized output and rejects unsafe public mutation
projections.
