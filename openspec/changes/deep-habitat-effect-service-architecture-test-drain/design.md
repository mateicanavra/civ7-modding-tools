# Design: Service Architecture Test Drain

## Frame

Habitat’s service layer is now authored as Effect-oRPC modules: the root service
seam creates the Effect runtime and implementer, root router composes modules,
and each module router owns procedure logic directly. That is source structure,
not unit behavior.

The old `service-architecture.test.ts` made Vitest scan source files, deleted
paths, and import topology. This duplicated Habitat’s job and made the test
suite slower while keeping enforcement in the wrong place.

## Ownership

- `tools/habitat-harness/src/domains/public-surface-guards/guard.js` owns
  Habitat public/internal/service/provider boundary enforcement.
- `.habitat/rules/habitat-public-surface-guards/rule.json` and sibling Habitat
  guard rules own current-tree execution.
- `tools/habitat-harness/test/lib/public-surface-guards.test.ts` owns
  fixture-level guard behavior, not current-tree topology enforcement.

## Implementation

The guard receives service architecture clauses:

- `implementEffect` / `ManagedRuntime.make` stay in approved runtime edges.
- Root service router cannot contain procedure `.effect` implementations or
  command orchestration.
- Service `module.ts` files bind `habitatServiceImplementer as impl` to their
  module only.
- Service `router.ts` files own procedure `.effect` logic directly and do not
  import `./run.js`, create nested routers, or construct runtime layers.
- Providers cannot import service/domain code or depend on effect-oRPC.
- Removed service/lib/provider compatibility paths remain deleted.

The deleted Vitest file is not replaced with another current-tree scanner.
The only new test is an injected-file guard fixture that proves the Habitat
guard rejects representative violations.

## Risks

- The guard is intentionally structural. Its test must stay fixture-based so
  Vitest does not become the enforcement mechanism again.
- Some old exact string assertions are intentionally not preserved; the durable
  boundary is ownership and dependency direction, not every historical symbol
  name from the deleted test.
