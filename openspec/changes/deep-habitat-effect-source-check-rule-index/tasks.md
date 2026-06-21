# Tasks

## 1. Implementation

- [x] 1.1 Compile rule/file matchers once per selected source-check rule.
- [x] 1.2 Exclude unsupported source-check rules from file planning while
  preserving unsupported-rule diagnostics.
- [x] 1.3 Attach matching rule plans to each planned source file before file
  reads complete.
- [x] 1.4 Dispatch diagnostics only to a file's matching rule plans.

## 2. Verification

- [x] 2.1 `bun run biome check --write tools/habitat-harness/src/domains/source-check/source-rules.ts`
- [x] 2.2 `bun run --cwd tools/habitat-harness check`
- [x] 2.3 `bun tools/habitat-harness/bin/dev.ts check --tool source-check --json`
- [x] 2.4 `bun run openspec -- validate deep-habitat-effect-source-check-rule-index --strict`
- [x] 2.5 `git diff --check`

## 3. Follow-Up Dominoes

- [ ] 3.1 Move source-check policy dispatch to a generated per-rule predicate
  table so path checks and text/AST prerequisites happen before entering each
  diagnostic function.
- [ ] 3.2 Add Habitat profile spans for policy load, scan-root traversal, file
  reads, rule dispatch count, and AST parse count.
