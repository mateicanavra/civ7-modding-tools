## 1. Baseline

- [x] 1.1 Confirm active pattern rules have broad shared scan roots.
- [x] 1.2 Confirm rule registry records already carry `pathCoverage`.
- [x] 1.3 Confirm `RulePatternFacts` dropped `pathCoverage` before source-check
  execution.

## 2. Implementation

- [x] 2.1 Add `pathCoverage` to pattern-rule facts.
- [x] 2.2 Move path coverage matching into the rule-registry domain.
- [x] 2.3 Use exact path coverage to prefilter files before policy invocation.
- [x] 2.4 Preserve scan-root fallback for non-exact coverage.
- [x] 2.5 Add OpenSpec records for the source-check planning repair.

## 3. Verification

- [x] 3.1 `bun run check`
- [x] 3.2 `bun run --cwd tools/habitat-harness test -- registry/facts.test.ts --reporter=verbose`
- [x] 3.3 `bun run --cwd tools/habitat-harness check`
- [x] 3.4 `bun run --cwd tools/habitat-harness build`
- [x] 3.5 `bun run openspec -- validate deep-habitat-effect-source-check-path-planning --strict`
- [x] 3.6 `bun run openspec:validate`
- [x] 3.7 `git diff --check`
