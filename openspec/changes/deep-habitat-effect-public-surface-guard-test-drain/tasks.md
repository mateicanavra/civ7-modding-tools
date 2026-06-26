## 1. Baseline

- [x] 1.1 Confirm clean worktree and Graphite branch state.
- [x] 1.2 Identify subprocess execution in `public-surface-guards.test.ts`.

## 2. Implementation

- [x] 2.1 Extract public-surface guard logic into an owned Habitat source module.
- [x] 2.2 Keep the root lint script as a wrapper over the source module.
- [x] 2.3 Convert unit tests to call the guard module directly with injected
  fixture files.
- [x] 2.4 Update OpenSpec records for the ownership change.

## 3. Verification

- [x] 3.1 `bun run --cwd tools/habitat-harness test -- public-surface-guards.test.ts`
- [x] 3.2 `bun scripts/lint/lint-habitat-public-surface-guards.mjs`
- [x] 3.3 `node scripts/lint/lint-habitat-public-surface-guards.mjs`
- [x] 3.4 `bun run --cwd tools/habitat-harness test`
- [x] 3.5 `bun run --cwd tools/habitat-harness check`
- [x] 3.6 `bun run --cwd tools/habitat-harness build`
- [x] 3.7 `bun run habitat -- check --json`
- [x] 3.8 `bun run openspec -- validate deep-habitat-effect-public-surface-guard-test-drain --strict`
- [x] 3.9 `bun run openspec:validate`
- [x] 3.10 `git diff --check`
