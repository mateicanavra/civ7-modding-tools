# Unit Summary Read Source Slice

Status: implemented local source slice.
Date: 2026-06-04.

Historical note: this is transitional proof of native in-process oRPC
mechanics, not a template for future facade-only read wrappers.

## Scope

This slice adds the next read-only native procedure module:
`unit.summary.read`.

The write set is:

- `packages/civ7-control-orpc/src/modules/unit/**` for the contract-first
  unit-summary procedure leaf and Effect/oRPC handler under the existing
  `unit` router family;
- direct-control facade typing and live facade forwarding for
  `getCiv7UnitSummary`;
- a procedure-specific `ORPCTaggedError` named
  `Civ7UnitSummaryUnavailableError`;
- focused local no-network tests for direct `call` and in-process server-side
  router client behavior.

No direct-control procedure-core implementation, custom middleware/context
pipeline, transport edge, CLI caller, Studio caller, in-game bridge, OpenAPI
surface, Task 2.9.4/5.x/6.x acceptance, runtime proof, or play-thread action
is part of this slice.

## Native oRPC/Effect Shape

The procedure is a native module under `packages/civ7-control-orpc`:

- contract leaf built from the direct-control TypeBox input/output schemas
  through the existing Standard Schema adapter;
- nested root contract/router shape `{ unit: { summary: { read } }, ... }`;
- handler implemented with `implementEffect` through the package implementer;
- dependency access through typed oRPC context and the direct-control facade;
- no endpoint, session, state, command, or raw command fields in procedure
  input;
- tagged safe failure projection through the native error map.

The direct-control package remains the owner of the unit-summary atom, Tuner
state selection, command source, input bounds, result parsing, schema
artifacts, and runtime proof claims.

## Proof Captured

Focused tests prove:

- `unit.summary.read` calls a fake direct-control facade through the oRPC
  router without network transport;
- the server-side router client calls the same router graph;
- `unitIds`, `playerId`, and `maxItems` keep the direct-control schema bounds;
- `host`, `port`, `state`, `stateName`, `session`, `command`, and
  `rawCommand` remain rejected procedure input and do not touch the fake
  runtime facade;
- direct-control facade failures become `UNIT_SUMMARY_UNAVAILABLE` with safe
  structured data only;
- raw command-looking failure messages such as `CMD:1:Units.get(id)` are not
  serialized into the public error;
- the contract metadata names `unit.summary.read`, `family: "unit"`,
  `risk: "read-only"`, and `proofBoundary: "local-package-test"`.

Verification run:

- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization
  --strict`
- `git diff --check`

## Remaining Boundaries

This is still local package proof. It does not prove live Tuner unit state,
runtime availability, hidden unit facts, transport behavior, operation
validation, or any send/mutation behavior.

Middleware, correlation, approval, validator-first, postcondition/proof,
transport edges, and runtime proof remain pending.
