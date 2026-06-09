# Tagged Error Projection Source Slice

Status: implemented local source slice.
Date: 2026-06-04.

## Scope

This slice makes the repeated direct-control facade failure boundary use native
effect-orpc tagged error constructors in the read procedure handlers.

The write set is:

- existing `runtime.playable.status`, `notifications.view`, and
  `unit.ready.view` procedure leaves to catch facade promise failures with
  `Effect.tryPromise`;
- handler-local calls to the procedure `errors` map constructors for
  `DIRECT_CONTROL_UNAVAILABLE`, `NOTIFICATION_VIEW_UNAVAILABLE`, and
  `READY_UNIT_VIEW_UNAVAILABLE`;
- OpenSpec task/spec/workstream records that keep shared middleware promotion
  pending until it is proven through native oRPC/effect-orpc behavior without
  custom wrapper plumbing.

No direct-control procedure-core implementation, custom router/middleware
pipeline, correlation framework, approval middleware, validator/postcondition
middleware, mutation procedure, transport edge, CLI caller, Studio caller,
in-game bridge, OpenAPI surface, Task 2.9.4/5.x/6.x acceptance, runtime proof,
or play-thread action is part of this slice.

## Native oRPC/Effect Shape

Each procedure remains a native effect-orpc handler under
`packages/civ7-control-orpc`. Facade calls are still supplied by typed context;
public failure projection is now constructed through the handler's native
`errors` parameter instead of direct `new ORPCTaggedError` instances or a
custom middleware factory.

The direct-control package remains the owner of runtime behavior, command
serialization, atom schemas, and runtime proof claims. The oRPC package owns
only the public typed error projection boundary for these procedure leaves.

## Middleware Disposition

The attempted shared error-projection middleware is not part of this closure.
Shared safe-error middleware remains a candidate, but it should be promoted
only after the installed oRPC/effect-orpc APIs prove an error path that does
not duplicate framework wiring or hide handler failure semantics.

This slice deliberately leaves OpenSpec 5.1 and the shared-middleware portion
of 5.4 pending.

## Proof Captured

Focused tests prove:

- existing no-network procedure calls still map raw facade failures to typed
  tagged errors with bounded procedure/source data;
- raw command-looking failure messages such as `CMD:...Game.turn`,
  `CMD:...readPlayNotifications()`, and `CMD:...readReadyUnitView()` are not
  serialized into public errors;
- the same in-process router graph and server-side client calls remain intact.

Verification run:

- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization
  --strict`
- `git diff --check`

## Remaining Boundaries

This is local package proof only. It does not prove Civ7 runtime behavior,
runtime availability, or mutation safety.

Correlation, approval, validator-first, postcondition/proof, mutation
procedures, edge adapters, and runtime proof remain pending.
