# Tasks

## 1. Implementation

- [x] 1.1 Remove scan-root fallback from source-check file matching.
- [x] 1.2 Add structured source-check failure for native rules without exact
      coverage.
- [x] 1.3 Preserve scan roots as file collection hints.
- [x] 1.4 Add focused rule execution coverage for the missing-exact-coverage
      state.

## 2. Verification

- [x] 2.1 `bun run --cwd tools/habitat-harness test -- test/lib/source-rules.test.ts`
- [x] 2.2 `bun tools/habitat-harness/bin/dev.ts check --tool source-check --json`
- [x] 2.3 `bun run --cwd tools/habitat-harness check`
- [x] 2.4 `bun run openspec -- validate deep-habitat-effect-source-check-exact-coverage-only --strict`
- [x] 2.5 `bun run biome:ci`
- [x] 2.6 `git diff --check`
- [x] 2.7 `bun run --cwd tools/habitat-harness test`
