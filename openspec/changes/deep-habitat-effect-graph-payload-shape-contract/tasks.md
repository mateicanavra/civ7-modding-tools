# Tasks

## 1. Implementation

- [x] 1.1 Remove nullish fallback projection from graph service output.
- [x] 1.2 Add explicit graph payload shape failure for null graph payloads.
- [x] 1.3 Update graph service tests away from legacy fallback behavior.

## 2. Verification

- [x] 2.1 `bun run --cwd tools/habitat-harness test -- test/service/graph-service.test.ts`
- [x] 2.2 `bun run --cwd tools/habitat-harness check`
- [x] 2.3 `bun run openspec -- validate deep-habitat-effect-graph-payload-shape-contract --strict`
- [x] 2.4 `bun tools/habitat-harness/bin/dev.ts graph --json`
- [x] 2.5 `bun run openspec:validate`
- [x] 2.6 `bun run biome:ci`
- [x] 2.7 `git diff --check`
