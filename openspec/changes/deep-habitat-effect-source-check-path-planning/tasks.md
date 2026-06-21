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
- [x] 2.6 Plan candidate file paths before file reads so source-check does not
  load files that no selected rule can inspect.
- [x] 2.7 Dispatch source-check diagnostics from each planned file to applicable
  rules instead of running every selected rule against every loaded file.

## 3. Verification

- [x] 3.1 `bun run check`
- [x] 3.2 `bun run --cwd tools/habitat-harness test -- registry/facts.test.ts --reporter=verbose`
- [x] 3.3 `bun run --cwd tools/habitat-harness check`
- [x] 3.4 `bun run --cwd tools/habitat-harness build`
- [x] 3.5 `bun run openspec -- validate deep-habitat-effect-source-check-path-planning --strict`
- [x] 3.6 `bun run openspec:validate`
- [x] 3.7 `git diff --check`
- [x] 3.8 `bun tools/habitat-harness/bin/dev.ts check --tool source-check --json`
- [x] 3.9 `nx affected --targets=check,boundaries,generated:check,source:check,validate:boundary-taxonomy,validate:grit-patterns --base agent-DRA-effect-rule-input-scope-fastpath --head HEAD --outputStyle=static --excludeTaskDependencies`
