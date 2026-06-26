# Change: Deep Habitat Effect Service Architecture Test Drain

## Why

`service-architecture.test.ts` recursively scanned live Habitat source files and
asserted topology rules in Vitest. That made the unit suite enforce structure
that belongs to Habitat structural rules and Nx-owned validation surfaces.

Habitat should not use ordinary tests as topology enforcement. The toolkit
itself should model service/provider/domain boundaries through its own guard
system, then keep Vitest focused on owned logic and fixture-level guard behavior.

## What Changes

- Move service architecture enforcement into the Habitat public-surface guard:
  service runtime construction stays in the root service seam, service module
  files only bind modules, service router files own procedure logic directly,
  providers stay below services/domains, and removed run/helper/lib paths remain
  deleted.
- Add injected-file fixture coverage for the guard logic.
- Delete the live current-tree `service-architecture.test.ts` topology suite.

## Non-Goals

- Do not add a replacement topology test suite.
- Do not change service module contracts or router behavior.
- Do not add compatibility shims, fallback paths, or duplicate service logic.

## Validation

- `bun run habitat -- check --owner @internal/habitat-harness --json` must pass.
- `bun run --cwd tools/habitat-harness test -- public-surface-guards.test.ts`
  must pass.
- Package tests/check/build and OpenSpec validation must stay green.
