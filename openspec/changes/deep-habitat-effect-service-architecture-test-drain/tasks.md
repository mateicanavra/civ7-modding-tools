## 1. Baseline

- [x] 1.1 Confirm clean Graphite branch and current worktree.
- [x] 1.2 Identify `service-architecture.test.ts` as current-tree topology
  enforcement inside Vitest.

## 2. Implementation

- [x] 2.1 Add service/provider topology clauses to the Habitat public-surface
  guard.
- [x] 2.2 Add injected-file fixture coverage for the new guard clauses.
- [x] 2.3 Delete the live `service-architecture.test.ts` topology suite.
- [x] 2.4 Add OpenSpec records for the service architecture test drain.

## 3. Verification

- [x] 3.1 `bun run --cwd tools/habitat-harness test -- public-surface-guards.test.ts`
- [x] 3.2 `bun run habitat -- check --owner @internal/habitat-harness --json`
- [x] 3.3 `bun run --cwd tools/habitat-harness test`
- [x] 3.4 `bun run --cwd tools/habitat-harness check`
- [x] 3.5 `bun run --cwd tools/habitat-harness build`
- [x] 3.6 `bun run openspec -- validate deep-habitat-effect-service-architecture-test-drain --strict`
- [x] 3.7 `bun run openspec:validate`
- [x] 3.8 `git diff --check`
