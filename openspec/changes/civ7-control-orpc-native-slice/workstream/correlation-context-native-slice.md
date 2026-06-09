# Correlation Context Native Slice

## Purpose

Promote request/evidence correlation from a pending policy candidate into a
narrow native control-oRPC context/error boundary without adding custom
correlation plumbing.

This slice follows the installed oRPC model: callers provide initial context,
middleware may validate or enrich execution context, and typed errors carry
schema-backed public data. It does not use direct-control procedure-core
correlation diagnostics as the control-oRPC runtime model.

## Write Set

- `packages/civ7-control-orpc/src/context.ts`
- `packages/civ7-control-orpc/src/model/correlation.ts`
- `packages/civ7-control-orpc/src/procedure.ts`
- `packages/civ7-control-orpc/src/errors.ts`
- Existing procedure error projections that may include validated correlation
  data.
- Focused city production-choice procedure proof.
- OpenSpec task/workstream records for this bounded native context slice.

## Behavior Boundary

The service context now accepts optional `correlation.correlationId`. A native
effect-oRPC middleware validates the ID before procedure handlers run. Invalid
IDs fail with `CORRELATION_ID_INVALID` and do not echo the invalid value.

Validated IDs may appear in package-owned typed error data for approval and
direct-control runtime-port failures. Normal procedure inputs and outputs do
not gain correlation fields, and successful procedure calls do not claim runtime
telemetry propagation.

## Non-Goals

- no custom correlation bus, event emitter, procedure runner, context composer,
  transport adapter, or wrapper client;
- no header/RPCLink/Studio/CLI/global bridge propagation;
- no direct-control `procedure-core` dependency or caller-local runtime
  plumbing;
- no telemetry/evidence sink implementation;
- no runtime/live-game proof claim;
- no Task 5.x or 6.x parent acceptance beyond the specific 6.4.3 row.

## Proof

Focused package proof covers:

- valid service correlation is attached to typed approval and facade-failure
  error data;
- invalid service correlation is rejected before the direct-control mutation
  port runs;
- invalid values are not echoed in serialized errors;
- the typed procedure error map includes `CORRELATION_ID_INVALID`.

Planned closure gates:

- `bun run --cwd packages/civ7-control-orpc test city-production-choice-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

## Residual Risk

This is not trace stitching across transports or live-game telemetry. Edge
adapters may later map headers or bridge metadata into `context.correlation`,
and direct-control telemetry may later consume validated IDs through an accepted
runtime port, but those are separate slices.
