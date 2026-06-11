# ORPC Server Shape

## Version And Source Posture

Official docs were checked on 2026-06-02. The current npm version observed for
`@orpc/server`, `@orpc/client`, and `@orpc/openapi` was `1.14.4`.
Re-check versions and official docs before implementation because oRPC moves
quickly.

Primary official docs:

- Procedure: https://orpc.dev/docs/procedure
- Router: https://orpc.dev/docs/router
- Middleware: https://orpc.dev/docs/middleware
- Context: https://orpc.dev/docs/context
- RPC handler: https://orpc.dev/docs/rpc-handler
- RPC link: https://orpc.dev/docs/client/rpc-link
- Server-side clients: https://orpc.dev/docs/client/server-side
- Testing and mocking: https://orpc.dev/docs/advanced/testing-mocking

## Concepts To Apply

**Procedure:** a typed function-like unit with optional input/output validation,
middleware, dependency injection, handler logic, and callable/server-action
helpers. Only `.handler` is required, but Civ7 control procedures should usually
declare input/output shape explicitly to keep command/API drift visible.

**Router:** a plain, nestable object of procedures. Routers can be wrapped with
middleware, but do not apply the same middleware at router and procedure levels
without checking for duplicate execution.

**Middleware:** reusable code that calls `next`, can run before/after a handler,
can inject or guard context, can inspect typed input, can modify output, and can
be concatenated/mapped. This is the right place for repeated Civ7 policy:
readiness, approval, validator-first mutation, proof collection, relationship
label authority, and error normalization.

**Context:** type-safe dependency injection. Initial context is passed by the
caller/handler invocation; execution context is computed during procedure
execution, usually via middleware. For Civ7, use context for direct-control
facades, endpoint defaults, live-session policy, approval metadata, logger/proof
sinks, clocks, and fakes.

**Server-side clients:** oRPC supports local procedure invocation without a
network proxy using `.callable`, `call`, and `createRouterClient`. This is the
default migration target for CLI, tests, and Studio server-side code that does
not cross a browser/network boundary.

**RPC HTTP boundary:** oRPC also supports `RPCHandler` plus `RPCLink` over
HTTP/Fetch. This is the natural Studio browser-to-server boundary: the browser
gets a typed client, the server keeps the same router/procedure policy, and the
runtime direct-control surface stays server-side.

**Testing/mocking:** official docs support direct procedure invocation in tests
and alternative implementations through the implementer. Use this to test
procedure atoms with fake direct-control dependencies before wiring CLI/Studio
callers.

## In-Repo Implementation (effect-orpc)

`packages/civ7-control-orpc` realizes these concepts through `effect-orpc`,
which lets procedures be Effect programs instead of plain async handlers:

- **Implementer:** `src/procedure.ts` builds
  `implementEffect(Civ7ControlOrpcContract, civ7ControlOrpcEffectRuntime)
  .$context<...>()` over a shared `ManagedRuntime` (currently
  `Layer.empty` — note this means a `TestClock` cannot be injected in tests
  without restructuring the implementer; time-driven tests run on the real
  clock at schema-minimum intervals).
- **Procedures:** `civ7ControlOrpcImplementer.<key>.effect(function* ({
  context, errors, input }) { ... })` — facade calls wrapped in
  `Effect.tryPromise({ try, catch: () => errors.SOME_CODE({ data }) })`.
- **Contracts:** contract-first TypeBox schemas bridged via
  `toStandardSchema` (`src/typebox-standard-schema.ts`); typed error classes
  via `ORPCTaggedError` registered in `civ7ControlOrpcErrorMap`.
- **Lifecycles:** multi-step flows use `Effect.acquireUseRelease` /
  `Effect.ensuring` for guaranteed cleanup and `Effect.iterate` /
  `Schedule` for loops (reference implementation:
  `src/modules/display/procedures/explore-request.ts`).
- **Effect's library is in-bounds:** queues, schedules, PubSub, `Ref`,
  fibers — prefer them over hand-rolled async coordination when orchestration
  grows.

## Civ7 Implication

Start with the shared router/procedure core, then choose the caller boundary.
CLI and tests should normally use server-side/in-process calls
(`createCiv7ControlOrpcServerClient`). Studio browser clients should call the
same router through an HTTP `RPCHandler`/`RPCLink` boundary. Keep
`OpenAPIHandler` separate for external/documented consumers where
REST/OpenAPI compatibility matters more than native TypeScript RPC
ergonomics.
