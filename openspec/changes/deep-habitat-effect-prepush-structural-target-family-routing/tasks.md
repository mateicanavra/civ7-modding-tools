# Tasks

## 1. Implementation

- [x] 1.1 Split Habitat tooling pre-push structural target selection by changed
      path family.
- [x] 1.2 Keep ordinary Habitat harness source edits on the owner-local package
      check without unrelated structural affected targets.
- [x] 1.3 Preserve structural target validation for boundary-taxonomy
      implementation and target declaration edits.
- [x] 1.4 Skip Nx affected execution when no affected targets were selected.

## 2. Verification

- [x] 2.1 `bun run --cwd tools/habitat-harness test -- test/service/hook-service.test.ts`
- [x] 2.2 `bun run --cwd tools/habitat-harness check`
- [x] 2.3 `bun run openspec -- validate deep-habitat-effect-prepush-structural-target-family-routing --strict`
- [x] 2.4 `bun run openspec:validate`
- [x] 2.5 `bun run biome:ci`
- [x] 2.6 `git diff --check`
