# Safe Error Middleware Native Slice

Status: implemented local package slice.
Date: 2026-06-05.

## Purpose

Promote the repeated public safe-error boundary into one native
`packages/civ7-control-orpc` effect-oRPC middleware without adding a custom
procedure runner, error bus, correlation bus, context composer, or transport
adapter.

This slice intentionally does not move raw direct-control runtime-port failure
classification into middleware. The installed effect-orpc runtime executes
Effect handlers and converts failed Effect causes into thrown `ORPCError`
instances after the Effect exits. That means native oRPC middleware can safely
project downstream public errors, but it cannot inspect the original
direct-control exception once effect-orpc has converted the failure. Procedure
handlers continue to use native Effect error mapping for procedure-specific
direct-control failures.

## Write Set

- `packages/civ7-control-orpc/src/procedure.ts`
- `packages/civ7-control-orpc/test/city-production-choice-procedure.test.ts`
- this OpenSpec record and `tasks.md`

## Behavior Boundary

The shared middleware:

- is created with `civ7ControlOrpcBaseImplementer.middleware(...)`, the native
  effect-oRPC builder middleware primitive;
- wraps the shared contract implementer before module procedures add leaf
  middleware;
- preserves existing `ORPCError` instances, including typed effect-oRPC tagged
  errors and readiness errors;
- projects unknown downstream failures into a bounded `INTERNAL_SERVER_ERROR`
  with no raw command/session/tuner/cause details in public JSON;
- remains package-internal and does not add a caller-facing middleware API.

The direct-control package remains the runtime/proof authority for socket
framing, state selection, command serialization, validators, postcondition
classification, and proof/no-repeat policy. Control-oRPC keeps owning the public
typed projection and service procedure composition.

## Non-Goals

- no direct-control procedure-core, custom middleware runner, context composer,
  correlation bus, error bus, router registry, or transport adapter;
- no raw direct-control failure classification moved into oRPC middleware;
- no correlation context, telemetry sink, evidence sink, request-id propagation,
  validator-first middleware, or postcondition/proof middleware;
- no CLI, Studio, HTTP/RPCLink, OpenAPI, global bridge, or in-game UIScript
  adapter work;
- no runtime/live-game proof claim from local package tests;
- no Task 5.x/6.x parent acceptance beyond the recorded subitem.

## Proof Collected

Focused proof covers:

- shared middleware preserving existing readiness and runtime-port tagged errors before the
  direct-control mutation port runs;
- shared middleware catching an unexpected procedure-local middleware failure and
  returning a bounded `INTERNAL_SERVER_ERROR` without raw implementation,
  command, session, or tuner details;
- procedure-specific direct-control facade failures still mapping to their
  existing typed tagged errors without raw command details.

Verification run:

- `bun run --cwd packages/civ7-control-orpc test city-production-choice-procedure.test.ts readiness-current-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

## Residual Risk

This is local package proof only. It does not prove Civ7 runtime behavior,
runtime availability,  or correlation behavior.

Raw direct-control runtime-port failure classification remains intentionally
handler-local until a lower-level Effect service/port boundary can expose those
failures as typed Effect errors before effect-orpc converts them. Correlation,
validator-first, postcondition/proof, runtime proof sinks, and caller policy
middleware remain pending.
