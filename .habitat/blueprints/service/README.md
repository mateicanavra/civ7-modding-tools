# Service

`service` is the closed, contract-first Effect-oRPC package kind under
`services/<service>`.

The public source root exposes only `client.ts`, `contract.ts`, `index.ts`, and
the private `service/` implementation tree. Provider construction, transports,
runtime hosts, platform controllers, and product-specific facades belong to
their qualified host or niche owners; they are not optional service interiors.

The service spine separates contract authoring, context, implementation, and
router composition:

- `base.ts` owns the shared `eoc` contract-authoring base, metadata, and public
  error map.
- `context.ts` owns the service context and its port vocabulary.
- `contract.ts` composes module contracts.
- `impl.ts` privately creates the sole
  `implementEffect(contract, runtime).$context<Context>()` lineage and exports
  its configured `service` stage.
- each module descends from its matching configured service branch, authors
  Effect handlers in direct router leaves, and exposes a plain router tree from
  `router/index.ts`.
- root `router.ts` performs the sole aggregate implementation through the
  configured `service.router(...)` stage.

This shape is pinned to `@orpc/*` 1.14.6, the repository-patched
`effect-orpc` 0.5.0, Effect 3.21.3, and TypeBox 1.3.6. The patched
`effect-orpc` implementation preserves equal leading middleware by identity
and order when the configured service implements the root router. Native oRPC
middleware therefore precedes generator Effect middleware, and the same
callback is not attached again at a module or router boundary.

Module contract and router directories have one `index.ts` aggregate plus
direct semantic leaves. Optional middleware directories follow the same closed
shape. Optional `model` containers admit only direct `dto`, `errors`, `policy`,
and `ports` leaves. The required root `schema/` container owns only the
Standard Schema bridge and shared mechanical schema adapters. Reusable DTOs
belong in `model/dto`; private request, response, envelope, and helper schemas
remain with the contract leaf that owns them.

The pinned E2 provider gives public error authority to contract-declared
`ORPCTaggedError` values. Executable interiors use the provider's injected
`errors.*` constructors or yield those declared failures; they do not install
a parallel catch-all `ORPCError` translation middleware. `context.ts` is the
single context and port aggregation owner, and its implementation vocabulary
stays behind the package public face. Directly authored TypeBox object
properties carry static descriptions so the protocol vocabulary remains
self-describing.

Package proof lives only under the optional root `test/` categories
`behavior`, `mechanics`, `integration`, and `support`. Production source never
imports proof. Behavior tests own runtime ordering and preserved product
behavior; Habitat owns only filesystem topology and declared source
relationships.
