# Runtime Playable-Status Source Slice

Status: replaced after serving as local source proof.
Date: 2026-06-04.

Historical note: this was transitional proof of native in-process oRPC
mechanics, not a template for future facade-only read wrappers.

The control-oRPC `runtime.playable.status` leaf has since been removed.
Current readiness service behavior is owned by `readiness.current`, which
projects the direct-control playable-status runtime port into semantic
readiness, capability, source-summary, and next-step output without exposing
raw host, port, state, Tuner snapshot, or runtime error details.

## Scope

This slice creates the first tracked `packages/civ7-control-orpc` source rung
and implements one read-only native procedure:
`runtime.playable.status`.

The write set is:

- `packages/civ7-control-orpc/package.json`, package `tsconfig`, and Vitest
  config;
- source files for public contract, context, direct-control facade
  dependency, Effect/oRPC implementer, router, server-side client, TypeBox
  Standard Schema adapter, and procedure metadata;
- `src/modules/runtime/**` for the first runtime procedure module;
- focused local no-network tests;
- root `bun.lock` dependency entries for `@orpc/*`, `effect-orpc`,
  `@standard-schema/spec`, and existing workspace dependencies.

No transport edge, CLI caller, Studio caller, in-game bridge, OpenAPI surface,
Task 2.9.4/5.x/6.x acceptance, runtime proof, or play-thread action is part of
this slice.

## Native oRPC/Effect Shape

The slice uses native oRPC/effect-orpc concepts:

- contract-first procedure leaves built with `eoc`;
- `implementEffect(contract, ManagedRuntime.make(Layer.empty))` for Effect
  handlers;
- typed oRPC context carrying a direct-control facade and endpoint defaults;
- `createRouterClient` / `call` for server-side no-network proof;
- a real `ORPCTaggedError` named
  `Civ7DirectControlUnavailableError` with code
  `DIRECT_CONTROL_UNAVAILABLE`.

The direct-control package still owns runtime behavior and the playable-status
atom. The oRPC package composes that atom through context; it does not create
socket/session providers or raw command execution.

## Proof Captured

Focused tests prove:

- `runtime.playable.status` calls a fake direct-control facade through the
  oRPC router without network transport;
- the server-side router client calls the same router graph;
- `host`, `port`, `state`, `stateName`, `session`, `command`, and
  `rawCommand` remain rejected procedure input and do not touch the fake
  runtime facade;
- direct-control facade failures become the tagged
  `DIRECT_CONTROL_UNAVAILABLE` error with safe structured data only;
- raw command-looking failure messages such as `CMD:1:Game.turn` are not
  serialized into the public error.

Verification run:

- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`

## Remaining Boundaries

Middleware candidates remain pending until at least two modules need the same
policy and the implementation uses oRPC/effect-orpc middleware primitives.
This slice does not implement approval, validator-first, postcondition,
telemetry, relationship-authority, readiness, or correlation middleware.

Mutation procedures remain blocked until approval-first, validator-first,
postcondition/no-repeat, and pending-runtime-proof semantics are implemented
and proved through the native router.
