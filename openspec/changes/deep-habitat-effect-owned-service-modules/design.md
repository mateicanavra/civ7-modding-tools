# Design: Deep Habitat Effect Owned Service Modules

## Target Shape

```text
host adapter -> service module procedure -> domain/service logic -> provider/resource
```

Host adapters parse flags and render output. Service modules own Habitat
capability procedures. Domain/service logic decides Habitat outcomes. Providers
acquire and execute vendor/resource capabilities.

## Service Module Tree

Each owned Habitat capability follows this shape:

```text
tools/habitat-harness/src/service/
  context.ts
  impl.ts
  contract.ts
  router.ts
  client.ts
  modules/
    <capability>/
      context.ts
      contract.ts
      router.ts
      model/**        # only when the capability owns DTOs/policy/errors
      procedures/**   # only when a module needs multiple procedure files
```

The root service contract composes module contracts. The root router composes
module routers. `context.ts` owns service context, runtime requirements, and
the service layer. `impl.ts` owns the `ManagedRuntime` and `implementEffect`
binding. Module `context.ts` files decorate one implementer subtree and export
it as `module`. Module routers bind procedure atoms with `.effect(...)` and own
procedure logic directly.

## Capability Ownership

Initial owned service modules:

- `verify`: verification orchestration and receipt creation.
- `check`: structural check report orchestration and baseline expansion command
  behavior.
- `classify`: orientation/classification procedure boundary and command route.
- `fix`: repair/codemod orchestration.
- `graph`: workspace graph/orientation views.
- `hook`: hook runtime orchestration.
- `transactions`: admitted transformation transaction lifecycle.

Required follow-on service modules:

- `patterns`: pattern/generator/scaffolding authoring surfaces.

`src/lib/**` remains implementation material only while it is drained into
named modules/domains. New owned orchestration must not be added there.

Pattern-apply schema, rendering, and worktree observation may remain under
`src/lib/pattern-apply/**` until the transformation-domain split moves those
DTOs and presenters into their final homes. Pattern-apply execution must not
live there: transaction application is owned by
`src/service/modules/transactions/router.ts` and exposed through the
`transactions.apply` Effect-oRPC procedure.

## Provider Relationship

Providers are explicit Effect resources for Git, Grit, Biome, Nx, Husky,
command execution, filesystem, clock, reporter, and workspace tooling. They
return typed provider observations/errors. They do not decide Habitat product
outcomes, render command output, own CLI behavior, or import service modules.

## Error And Config Relationship

Expected failures cross service procedure boundaries as typed outputs or
registered service errors. Defects can still throw only for impossible internal
invariants. Config, filesystem, clock, command execution, and reporters are
available through Effect layers/resources, not through ambient process globals
inside service modules.

## Guardrails

- Runtime construction is allowed in `src/service/context.ts`,
  `src/service/impl.ts`, and `src/runtime/**` only.
- `effect-orpc` contract authoring is allowed in `src/service/**` only.
- Provider code must not import service or domain modules.
- Root service router must contain composition only, with no handler logic.
- CLI command handlers should call `createHabitatServiceClient()` for any
  capability that has a service module.
- `src/lib/pattern-apply/run.ts` must not exist; `fix` must call the
  transactions service module instead of a lib runner.
