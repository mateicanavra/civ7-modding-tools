# Change: Deep Habitat Effect Owned Service Modules

## Why

Habitat's owned capabilities must be the product surface over provider
capabilities, not incidental `src/lib` workflows or provider-shaped APIs. The
Effect-oRPC spine introduced for `verify` needs to become the controlling shape
for Habitat commands, hooks, checks, fixes, graph/orientation, scaffolding, and
transformation orchestration.

## What Changes

- Establish `src/service/modules/*` as the home for owned Habitat capability
  procedures.
- Keep `src/providers/*` as resource/vendor dependencies consumed by service
  modules, not as product modules.
- Add the `check` service module and route `habitat check` through the
  in-process Habitat service client.
- Add the `transactions` service module and move pattern-apply execution out of
  `src/lib` into the owned service-module layer.
- Add service architecture tests that keep runtime construction, module
  bindings, and provider imports in their assigned homes.

## What Does Not Change

- No public CLI output contract changes.
- No CheckReport v1 schema change.
- No provider owns Habitat policy decisions.
- No final compatibility shim, fallback, or duplicate active implementation is
  introduced by this packet.

## Affected Owners

- `tools/habitat-harness/src/service/**`
- `tools/habitat-harness/src/commands/check.ts`
- `tools/habitat-harness/src/lib/check/**` as implementation material only
- `tools/habitat-harness/src/lib/pattern-apply/**` as DTO/render material only
- `tools/habitat-harness/test/service/**`

## Stop Conditions

- A service module is only a provider wrapper and does not represent an owned
  Habitat capability.
- A provider imports `src/service/**` or `src/domains/**`.
- Runtime construction escapes `src/service/impl.ts` or `src/runtime/**`.
- CLI commands bypass an available service module for owned orchestration.
- New code preserves stale behavior through fallbacks, shims, or dual paths.

## Verification

- Service architecture guard tests.
- Focused check service/CLI tests.
- `bun run --cwd tools/habitat-harness check`
- `bun run --cwd tools/habitat-harness test`
- `bun run openspec -- validate deep-habitat-effect-owned-service-modules --strict`
- `bun run openspec:validate`
