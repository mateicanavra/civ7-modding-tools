# Civ7 oRPC Service And Projection Shape

## Authority Boundary

This reference owns only Civ7 placement and dependency direction. Load global
`dev:orpc` for oRPC mechanics. When Effect crosses a procedure boundary, also
load `dev:effect-orpc` and `dev:effect-ts`. Load `dev:inngest` and, when
applicable, `dev:effect-inngest` only after a durable workflow has earned its
boundary.

The workspace manifest and lockfile identify the installed package tuple.
Choose concrete builders, adapters, context mechanisms, error mapping,
interruption behavior, and runtime/scoping only after inspecting that exact
published source and declarations and passing a discriminating fixture. This
reference deliberately freezes none of that syntax.

## Standalone Service

The accepted Civ7 service packet has one authority with three views:

```text
services/<service>/
  src/
    client.ts                  # public caller and construction face
    service/                   # private service authority
      base.ts
      contract.ts
      impl.ts
      router.ts
      modules/<module>/
```

- The contract is public boundary truth owned by the service.
- The client is the public callable projection and may re-export that contract.
- The complete router and implementation remain private.
- A qualified app composition root supplies ready typed dependencies and
  receives the resulting client. Ordinary callers and API context receive only
  the bound client.
- A service never acquires a provider, starts a host, mounts transport, imports
  an app, or asks a caller to assemble its dependency context.

These are views of one authority, not parallel method vocabularies. Consumers
do not derive types from private contract leaves, define look-alike interfaces,
or import router implementation.

## Selected Service Dependencies

```text
qualified app
  -> acquires Tuner and window-capture providers
  -> supplies ready resource values to civ7-control construction
  -> supplies the bound control client to civ7-play construction
  -> supplies exact app adapters and bound capabilities to mapgen-runs
  -> gives ordinary consumers the resulting public clients
```

`civ7-control` owns exactly `{app,game,map,ui}`. `civ7-play` owns exactly
`{attention,automation,city,diplomacy,notifications,progression,planning,turn,unit}`
and depends only on the public control client. `mapgen-runs` owns exactly
`{autoplay,operations,run-in-game,save-deploy}` and remains separate from both
live-control semantics and pure MapGen definition truth.

Public service dependency descriptors may be implemented by qualified app
adapters. The app constructs the ready adapter from public definitions, pure
packages, and its host APIs, then supplies it to service-client construction.
The service never imports the app or another app's targets.

## Server API Plugin

A network caller receives an API projection with its own caller contract:

```text
plugins/server/api/<api>/
  src/
    client.ts                  # public caller face
    api.ts                     # public server-registration face
    service/                   # private API-owned projection packet
      base.ts
      contract.ts
      impl.ts
      router.ts
      modules/<projection>/
```

The API contract owns each caller-facing leaf. Its private routers delegate
explicitly through public service clients and exact public capabilities
supplied in API context. The API may add caller policy, auth, transport
metadata, and translation, but it owns no product state or provider lifecycle.

The API does not copy a whole service contract subtree or expose a private
service router. `client.ts` is for callers; `api.ts` is the app-mounted
registration face. The qualified app materializes request context from bound
clients and app-selected adapters before registration.

## App Composition

The qualified app owns the concrete process graph:

1. Select and acquire providers.
2. Construct ready resource values and qualified app adapters.
3. Bind the control, play, and MapGen-runs public clients in dependency order.
4. Materialize API context from those bound clients and exact public
   capabilities.
5. Mount API, CLI, web, or native host roles.
6. Observe interruption and dispose every admitted scope.

This composition is not semantic product authority. Services retain their
facts and policies; API plugins retain caller meaning; providers retain foreign
lifecycle facts.

## Durable Workflow Gate

A multi-step service operation stays service-owned while one retained process
is sufficient. A workflow is considered only when stable intent must survive a
request or process and resume with retry, waits, replay, scheduling, fanout, or
durable progress. It calls public clients and reconciles stable effect
identities on re-entry; it does not mount private routers or become a second
writer of service facts.
