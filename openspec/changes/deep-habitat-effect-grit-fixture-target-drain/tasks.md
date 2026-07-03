## 1. Baseline

- [x] 1.1 Confirm clean worktree and Graphite branch state.
- [x] 1.2 Measure current `validate:grit-patterns` behavior and identify the
  large JSON stderr output from `grit patterns test --json`.

## 2. Implementation

- [x] 2.1 Add a cacheable `validate:grit-patterns` Nx target.
- [x] 2.2 Switch the package validation script to concise native Grit fixture
  output.
- [x] 2.3 Wire the target into root check and Habitat verify/pre-push planning.
- [x] 2.4 Replace live Grit execution in unit tests with command
  materialization coverage.
- [x] 2.5 Update docs/OpenSpec records for the new ownership.

## 3. Verification

- [x] 3.1 `nx run @internal/habitat-harness:validate:grit-patterns`
- [x] 3.2 `bun run --cwd tools/habitat-harness test -- workspace-tools.test.ts`
- [x] 3.3 `bun run --cwd tools/habitat-harness test`
- [x] 3.4 `bun run --cwd tools/habitat-harness check`
- [x] 3.5 `bun run habitat -- verify --base HEAD~1 --json`
- [x] 3.6 `bun run openspec -- validate deep-habitat-effect-grit-fixture-target-drain --strict`
- [x] 3.7 `bun run openspec:validate`
- [x] 3.8 `git diff --check`
