# Design: Deep Habitat Effect Native Platform Resource Drain

## Domain Boundary

Owner: Habitat runtime/resources substrate.

The resource substrate owns host primitive containment and Habitat-specific
translation. It does not own vendor behavior, command semantics, graph/check
domain decisions, or procedure routing.

## Target Shape

```text
tools/habitat-harness/src/resources/filesystem.ts
tools/habitat-harness/src/resources/temp-dir.ts
tools/habitat-harness/src/resources/time.ts
tools/habitat-harness/src/resources/cache.ts
tools/habitat-harness/src/runtime/layers.ts
tools/habitat-harness/src/runtime/test-layers.ts
tools/habitat-harness/test/support/fake-platform-file-system.ts
```

Deleted local services:

```text
tools/habitat-harness/src/resources/clock.ts
tools/habitat-harness/src/resources/scope.ts
tools/habitat-harness/src/resources/workspace-lock.ts
tools/habitat-harness/src/resources/write-set.ts
```

## Ownership Rules

- Effect flows use `Clock` and `@effect/platform/FileSystem` directly through
  the runtime layer.
- Resource filesystem helpers wrap platform filesystem failures into Habitat
  tagged errors when callers need Habitat error taxonomy.
- Sync import-time/classification paths call explicitly allowlisted sync helper
  functions from `resources/filesystem.ts` and `resources/time.ts`; direct
  `node:fs` and direct `Date` primitives do not spread into migrated domain
  code.
- Tests fake the official platform filesystem service rather than faking a
  Habitat-specific filesystem service.
- Runtime composition relies on `NodeContext.layer` for platform services and
  merges only Habitat-owned config, providers, reporters, and domain services.

## Stop Conditions

- A deleted local resource service is reintroduced.
- A fake Habitat filesystem or clock layer returns.
- New migrated domain code imports `node:fs`, imports sync filesystem helpers,
  calls `Date.now`, constructs `Date` directly, or imports native Effect `Clock`
  outside the guard allowlists.
- A provider implementation is exported as public package API to compensate for
  a missing resource service.
