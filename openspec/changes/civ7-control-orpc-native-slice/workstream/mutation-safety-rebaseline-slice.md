# Mutation Safety Rebaseline Slice

Status: implemented local package slice.
Date: 2026-06-05.

## Purpose

Retire caller-provided approval as a product concept across the native
control-oRPC and direct-control support workstreams. Validator/postcondition/no-repeat safety now rests
on the remaining real boundaries: playable/readiness preconditions,
validator-first runtime ports, source-owned postcondition/proof/no-repeat
classification, controller lifecycle/local-player/hotseat proof, bounded
correlation, and raw command/session output bans.

This record supersedes the earlier local middleware proof that required callers
to satisfy a caller-provided mutation precondition before mutation procedures could run. That earlier
proof is historical evidence that repeated mutation policies should use native
oRPC middleware when they are real; it is not current product authority and is
not a template for future procedures.

## Write Set

- `packages/civ7-control-orpc/src/middleware/mutation-procedure.ts`
- `packages/civ7-control-orpc/src/middleware/mutation-approval.ts` deletion
- `packages/civ7-control-orpc/src/context.ts`
- `packages/civ7-control-orpc/src/errors.ts`
- mutation procedure modules and tests in `packages/civ7-control-orpc`
- direct-control mutation runtime ports, telemetry records, and tests in
  `packages/civ7-direct-control`
- CLI command surfaces and tests in `packages/cli`
- OpenSpec proposal/design/spec/tasks/workstream records

## Behavior Boundary

The current mutation procedure path:

- uses native effect-oRPC procedure/middleware composition for retained
  readiness preconditions;
- does not accept or require caller-provided approval;
- keeps validator-first checks inside the direct-control runtime/proof ports
  until a real repeated native middleware boundary is proven;
- keeps source-owned postcondition, no-repeat, stale/unknown, and
  pending-runtime-proof semantics intact;
- keeps controller mutation ingress gated by context-owned lifecycle,
  local-player, and hotseat proof before router dispatch;
- keeps raw host, port, session, state, command, Tuner, payload, and
  direct-control envelopes out of normal procedure and bridge output.

## Non-Goals

- no restoration of caller-provided approval under another name;
- no custom middleware framework, procedure-core scaffold, context composer,
  correlation bus, or before-handler wiring;
- no shared validator-first or postcondition/proof middleware promotion in
  this slice;
- no CLI, Studio, HTTP/RPCLink, OpenAPI, global bridge, or in-game UIScript
  scope expansion;
- no runtime/live-game proof claim from local package tests;
- no Task 5.x, 6.x, or 7.3 parent acceptance by implication.

## Proof Collected

- `bun run --cwd packages/civ7-direct-control test`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run check:cli`
- `bun run test:cli:play`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- source/test/docs scan for retired approval vocabulary
- `git diff --check`

These are local package and documentation proofs only. They do not claim live
Civ7 runtime proof.

## Residual Risk

Shared validator-first, postcondition/proof, runtime proof sink, and caller
policy middleware remain pending. The next shared middleware slice should
promote only a repeated native policy boundary that is visible across multiple
procedures and should avoid recreating effect-oRPC router or context
machinery.
