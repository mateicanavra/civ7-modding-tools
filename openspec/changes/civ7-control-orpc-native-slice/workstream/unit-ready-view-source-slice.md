# Unit Ready-View Source Slice

Status: burned down after serving as local source proof.
Date: 2026-06-04.

Historical note: this is transitional proof of native in-process oRPC
mechanics, not a template for future facade-only read wrappers.
The control-oRPC `unit.ready.view` leaf has since been removed. Current
ready-unit service behavior is owned by `attention.current`, which consumes the
direct-control ready-unit source evidence from typed context. The
direct-control ready-unit atom and facade method remain historical source
evidence owners, not templates for new semantic runtime ports.

## Scope

This slice adds the third read-only native procedure module:
`unit.ready.view`.

The write set is:

- `packages/civ7-control-orpc/src/modules/unit/**` for the contract-first
  ready-unit procedure leaf and Effect/oRPC handler;
- root control-oRPC contract/router exports to compose the new `unit` router
  family;
- direct-control facade typing and live facade forwarding for
  `getCiv7ReadyUnitView`;
- a procedure-specific `ORPCTaggedError` named
  `Civ7ReadyUnitViewUnavailableError`;
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
- nested root contract/router shape `{ unit: { ready: { view } }, ... }`;
- handler implemented with `implementEffect` through the package implementer;
- dependency access through typed oRPC context and the direct-control facade;
- no endpoint, session, state, command, or raw command fields in procedure
  input;
- tagged safe failure projection through the native error map.

The direct-control package remains the owner of the ready-unit atom, App UI
command source, input bounds, result parsing, schema artifacts, and runtime
proof claims.

## Proof Captured

Focused tests prove:

- `unit.ready.view` calls a fake direct-control facade through the oRPC router
  without network transport;
- the server-side router client calls the same router graph;
- `unitId`, `radius`, and `maxOperations` keep the direct-control schema
  bounds;
- `host`, `port`, `state`, `stateName`, `session`, `command`, and
  `rawCommand` remain rejected procedure input and do not touch the fake
  runtime facade;
- direct-control facade failures become `READY_UNIT_VIEW_UNAVAILABLE` with
  safe structured data only;
- raw command-looking failure messages such as
  `CMD:65535:readReadyUnitView()` are not serialized into the public error;
- the contract metadata names `unit.ready.view`, `family: "unit"`,
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

This is still local package proof. It does not prove live App UI ready-unit
state, player progress, runtime availability, operation validation, or any
send/mutation behavior.

The repeated context-owned input and safe-error pattern is now clear across
three modules. The next middleware work, if taken, should promote only through
native oRPC/effect-orpc primitives; this slice does not add custom
direct-control or wrapper middleware plumbing.
