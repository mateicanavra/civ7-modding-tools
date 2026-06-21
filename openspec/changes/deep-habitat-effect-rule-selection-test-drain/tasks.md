## 1. Baseline

- [x] 1.1 Confirm clean Graphite branch and current worktree.
- [x] 1.2 Identify `rule-selection.test.ts` as retaining broad runtime coverage
  for narrow selector/disposition contracts.

## 2. Implementation

- [x] 2.1 Export the structural-check selector-refusal report seam.
- [x] 2.2 Add an owned staged Grit not-applicable execution-record helper.
- [x] 2.3 Reuse the helper inside `executeSelectedRulesEffect` before resolving
  `SourceCheck`.
- [x] 2.4 Replace full-runtime selector refusal coverage with direct
  structural-check report coverage.
- [x] 2.5 Replace the 90s staged Grit runtime test with deterministic
  disposition coverage.
- [x] 2.6 Add OpenSpec records for the rule-selection drain.

## 3. Verification

- [x] 3.1 `bun run --cwd tools/habitat-harness test -- rule-selection.test.ts`
- [x] 3.2 `bun run --cwd tools/habitat-harness test`
- [x] 3.3 `bun run --cwd tools/habitat-harness check`
- [x] 3.4 `bun run --cwd tools/habitat-harness build`
- [x] 3.5 `bun run habitat -- check --owner @internal/habitat-harness --json`
- [x] 3.6 `bun run openspec -- validate deep-habitat-effect-rule-selection-test-drain --strict`
- [x] 3.7 `bun run openspec:validate`
- [x] 3.8 `git diff --check`
