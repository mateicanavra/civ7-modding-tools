# Civ7 oRPC Integration Boundary

## Authority Boundary

Load global `dev:orpc` for native oRPC contracts, builders, routers,
middleware, context, transports, clients, testing, and current vendor guidance.
When an Effect computation crosses the procedure boundary, load global
`dev:effect-orpc` and the matching `dev:effect-ts` lane after identifying the
exact installed package tuple.

This reference owns only Civ7-specific integration facts. The workspace
manifest and lockfile own installed versions; the global skills do not authorize
an implicit dependency upgrade. Do not add vendor documentation summaries or
generic oRPC examples here.

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

## Civ7 Caller Boundary

Start with the shared router/procedure core, then choose the caller boundary.
CLI and tests should normally use server-side/in-process calls
(`createCiv7ControlOrpcServerClient`). Studio browser clients should call the
same router through an HTTP `RPCHandler`/`RPCLink` boundary. Keep
`OpenAPIHandler` separate for external/documented consumers where
REST/OpenAPI compatibility matters more than native TypeScript RPC
ergonomics.
