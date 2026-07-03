# Tasks

## 1. Implementation

- [x] 1.1 Filter unscoped default current-tree local checks to local Habitat rule tools.
- [x] 1.2 Preserve explicit selector behavior for graph/hygiene proof rules.
- [x] 1.3 Preserve staged/hook check behavior.

## 2. Verification

- [x] 2.1 `bun run --cwd tools/habitat-harness test -- test/lib/rule-selection.test.ts test/service/check-service.test.ts`
- [x] 2.2 `bun run --cwd tools/habitat-harness check`
- [x] 2.3 `bun tools/habitat-harness/bin/dev.ts check --json`
- [x] 2.4 `bun tools/habitat-harness/bin/dev.ts check --rule import-boundaries --json`
- [x] 2.5 `bun run openspec -- validate deep-habitat-effect-local-check-lane-filter --strict`
- [x] 2.6 `bun run biome:ci`
- [x] 2.7 `git diff --check`
- [x] 2.8 `bun tools/habitat-harness/bin/dev.ts check --rule format-ci --json`
- [x] 2.9 `bun tools/habitat-harness/bin/dev.ts check --owner @internal/habitat-harness --json`
