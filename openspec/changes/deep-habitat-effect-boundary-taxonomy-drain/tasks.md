## 1. Baseline

- [x] 1.1 Confirm clean worktree and Graphite stack state.
- [x] 1.2 Identify the live Nx graph audit inside `boundary-taxonomy.test.ts`
  as the dominant package-test cost.

## 2. Implementation

- [x] 2.1 Add a dedicated boundary taxonomy validation script.
- [x] 2.2 Add a cacheable Nx target for the validation script.
- [x] 2.3 Remove live workspace graph resolution from unit tests.
- [x] 2.4 Wire boundary taxonomy validation into root check and Habitat
  verify/pre-push target planning.
- [x] 2.5 Update docs/OpenSpec records for the new ownership.

## 3. Verification

- [x] 3.1 `nx run @internal/habitat-harness:validate:boundary-taxonomy`
- [x] 3.2 `bun run --cwd tools/habitat-harness test`
- [x] 3.3 `bun run --cwd tools/habitat-harness check`
- [x] 3.4 `bun run habitat -- check --json`
- [x] 3.5 `bun run openspec -- validate deep-habitat-effect-boundary-taxonomy-drain --strict`
- [x] 3.6 `bun run openspec:validate`
- [x] 3.7 `git diff --check`
