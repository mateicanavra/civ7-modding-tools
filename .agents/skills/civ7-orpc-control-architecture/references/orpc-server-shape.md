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

`services/civ7-control` realizes `@civ7/control-orpc` as a closed service:

- **Public root:** `src/client.ts`, `src/contract.ts`, and `src/index.ts` are the
  only public source files; `src/service/` contains the private implementation.
  The package exports `.` and `./contract`, not a runtime/provider subpath.
- **Service spine:** `src/service/base.ts` owns the shared `eoc` base and error
  map; `context.ts` aggregates context; `contract.ts` composes module
  contracts; `impl.ts` creates the sole
  `implementEffect(contract, ManagedRuntime.make(Layer.empty)).$context<Context>()`
  lineage and installs root middleware; `router.ts` realizes the aggregate
  router from that configured service.
- **Modules:** every `src/service/modules/<domain>/` contains `contract/`,
  `router/`, and `module.ts`. Contract leaves author the TypeBox-backed
  protocol, `module.ts` selects `service.<domain>`, router leaves attach Effect
  handlers through that branch, and each `index.ts` composes a plain tree.
- **Contracts and errors:** TypeBox schemas cross the Standard Schema bridge in
  `src/service/schema/typebox-standard-schema.ts`. Contract-declared
  `ORPCTaggedError` values live in
  `src/service/model/errors/control.ts`; router leaves use the provider-injected
  `errors.*` constructors rather than a second error portal.
- **Effect behavior:** router leaves use
  `module.<key>.effect(function* ({ context, errors, input }) { ... })` and wrap
  direct-control port calls in `Effect.tryPromise`. Multi-step flows use
  `Effect.acquireUseRelease` / `Effect.ensuring` for guaranteed cleanup and
  `Effect.iterate` / `Schedule` for loops (reference implementation:
  `src/service/modules/display/router/explore-request.ts`).
- **Effect's library is in-bounds:** queues, schedules, PubSub, `Ref`, and
  fibers are preferred over hand-rolled async coordination when service
  orchestration grows.

## Civ7 Caller Boundary

Start with the shared router/procedure core, then choose the caller boundary.
CLI and tests should normally use server-side/in-process calls
(`createCiv7ControlOrpcServerClient`) and provision the service's low-level
port explicitly:

```ts
import {
  type Civ7ControlOrpcContext,
  createCiv7ControlOrpcServerClient,
} from "@civ7/control-orpc";
import { liveCiv7DirectControl } from "@civ7/direct-control/live";

const client = createCiv7ControlOrpcServerClient({
  directControl:
    liveCiv7DirectControl as Civ7ControlOrpcContext["directControl"],
  endpointDefaults,
});
```

Setup lifecycles also provision `directLifecycle: liveCiv7LifecycleControl`
from the same `@civ7/direct-control/live` entrypoint. Never import the deleted
`@civ7/control-orpc/runtime` surface or make the service construct its host
providers.

Studio browser clients should call the same router through an HTTP
`RPCHandler`/`RPCLink` boundary. Keep `OpenAPIHandler` separate for
external/documented consumers where REST/OpenAPI compatibility matters more
than native TypeScript RPC ergonomics.
