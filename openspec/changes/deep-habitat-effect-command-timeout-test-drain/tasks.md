## 1. Baseline

- [x] 1.1 Confirm clean worktree and Graphite branch state.
- [x] 1.2 Identify live process/time leakage in `command-runner.test.ts`.

## 2. Implementation

- [x] 2.1 Export command provider git-state capture, unavailable projection, and
  timeout transformation from the owning provider module.
- [x] 2.2 Reuse the exported provider helpers in live command execution.
- [x] 2.3 Replace live git-state and missing-binary tests with fake/provider
  policy coverage.
- [x] 2.4 Replace the never-ending live Node process test with an Effect
  `TestClock` test over `Effect.never`.
- [x] 2.5 Add OpenSpec records for the command-runner drain.

## 3. Verification

- [x] 3.1 `bun run --cwd tools/habitat-harness test -- command-runner.test.ts`
- [x] 3.2 `bun run --cwd tools/habitat-harness test`
- [x] 3.3 `bun run --cwd tools/habitat-harness check`
- [x] 3.4 `bun run --cwd tools/habitat-harness build`
- [x] 3.5 `bun run habitat -- check --owner @internal/habitat-harness --json`
- [x] 3.6 `bun run openspec -- validate deep-habitat-effect-command-timeout-test-drain --strict`
- [x] 3.7 `bun run openspec:validate`
- [x] 3.8 `git diff --check`
