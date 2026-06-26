## 1. Baseline

- [x] 1.1 Confirm clean Graphite branch and current worktree.
- [x] 1.2 Identify live filesystem coupling in Grit scan-root validation tests.

## 2. Implementation

- [x] 2.1 Add explicit `pathExists` input to Grit scan-root validation options.
- [x] 2.2 Use `pathExists` in scan-root discovery and decision logic while
  preserving the `existsSync` live default.
- [x] 2.3 Replace live-filesystem validation fixture expectations with injected
  existence facts.
- [x] 2.4 Add OpenSpec records for the Grit scan-root filesystem drain.

## 3. Verification

- [x] 3.1 `bun run --cwd tools/habitat-harness test -- grit-adapter.test.ts`
- [x] 3.2 `bun run --cwd tools/habitat-harness test`
- [x] 3.3 `bun run --cwd tools/habitat-harness check`
- [x] 3.4 `bun run --cwd tools/habitat-harness build`
- [x] 3.5 `bun run habitat -- check --owner @internal/habitat-harness --json`
- [x] 3.6 `bun run openspec -- validate deep-habitat-effect-grit-scan-root-fs-drain --strict`
- [x] 3.7 `bun run openspec:validate`
- [x] 3.8 `git diff --check`
