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
  base.ts
  impl.ts
  contract.ts
  router.ts
  client.ts
  modules/
    <capability>/
      contract.ts
      module.ts
      router.ts
      run.ts
      model/**        # only when the capability owns DTOs/policy/errors
      procedures/**   # only when a module needs multiple procedure files
```

The root service contract composes module contracts. The root router composes
module routers. `impl.ts` owns `implementEffect` and the `ManagedRuntime`.
Module `module.ts` files narrow the implementer to one contract subtree. Module
routers bind procedure atoms with `.effect(...)`.

## Capability Ownership

Initial owned service modules:

- `verify`: verification orchestration and receipt creation.
- `check`: structural check report orchestration and baseline expansion command
  behavior.

Required follow-on service modules:

- `fix`: repair/codemod orchestration.
- `graph`: workspace graph/orientation views.
- `hook`: hook runtime orchestration.
- `classify`: routing/classification views.
- `patterns`: pattern/generator/scaffolding authoring surfaces.
- `transactions`: transformation transaction lifecycle.

`src/lib/**` remains implementation material only while it is drained into
named modules/domains. New owned orchestration must not be added there.

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

- Runtime construction is allowed in `src/service/impl.ts` and `src/runtime/**`
  only.
- `effect-orpc` contract authoring is allowed in `src/service/**` only.
- Provider code must not import service or domain modules.
- Root service router must contain composition only, with no handler logic.
- CLI command handlers should call `createHabitatServiceClient()` for any
  capability that has a service module.
