# Tasks

## 1. Implementation

- [x] 1.1 Add a source-check scan-root normalization primitive.
- [x] 1.2 Use collapsed walk roots during source-check file collection.
- [x] 1.3 Preserve rule-level file matching and staged scan-root semantics.
- [x] 1.4 Add focused source-check planner behavior coverage.

## 2. Verification

- [x] 2.1 `bun run --cwd tools/habitat-harness test -- test/lib/source-scan-roots.test.ts`
- [x] 2.2 `bun run --cwd tools/habitat-harness check`
- [x] 2.3 `bun tools/habitat-harness/bin/dev.ts check --tool source-check --json`
- [x] 2.4 `bun run openspec -- validate deep-habitat-effect-source-check-scan-root-normalization --strict`
- [x] 2.5 `bun run biome:ci`
- [x] 2.6 `git diff --check`
