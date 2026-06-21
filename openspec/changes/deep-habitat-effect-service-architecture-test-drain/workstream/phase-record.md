# Phase Record: Deep Habitat Effect Service Architecture Test Drain

## Frame

- Objective: remove service architecture current-tree enforcement from Vitest
  and consolidate it under Habitat structural guards.
- Hard core: topology enforcement belongs to Habitat/Nx/Grit/Biome surfaces,
  not ordinary tests.
- Exterior: no service behavior changes, no replacement topology test suite, no
  compatibility shims or duplicate service logic.
- Falsifier: Habitat owner check fails, package tests fail, or deleted topology
  assertions are merely recreated as another live current-tree test.

## Workstream State

- Graphite branch: `agent-DRA-effect-service-architecture-test-drain`
- Write set:
  - `tools/habitat-harness/src/domains/public-surface-guards/guard.js`
  - `tools/habitat-harness/test/lib/public-surface-guards.test.ts`
  - `tools/habitat-harness/test/service/service-architecture.test.ts`
  - `openspec/changes/deep-habitat-effect-service-architecture-test-drain/**`

## Verification Log

- `bun run --cwd tools/habitat-harness test -- public-surface-guards.test.ts --reporter=verbose`
  passed; injected guard fixture covered service topology violations in 33ms.
- `bun run habitat -- check --owner @internal/habitat-harness --json` passed;
  Habitat public-surface guard remained green on the current tree.
