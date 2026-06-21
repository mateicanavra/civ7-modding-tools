# Tasks

## 1. Implementation

- [x] 1.1 Update pre-push target planning so Habitat tooling source edits do
      not schedule affected `habitat:check` or `source:check`.
- [x] 1.2 Preserve owner-local `@internal/habitat-harness:check` for Habitat
      tooling source edits.
- [x] 1.3 Preserve distinct affected structural guards for Habitat tooling
      source edits.
- [x] 1.4 Preserve artifact-only and ordinary repo target planning.
- [x] 1.5 Mark the owner-check input-scope follow-up domino as closed by this
      slice.

## 2. Verification

- [x] 2.1 `bun run --cwd tools/habitat-harness test -- test/service/hook-service.test.ts`
- [x] 2.2 `bun run --cwd tools/habitat-harness check`
- [x] 2.3 `bun run openspec -- validate deep-habitat-effect-prepush-duplicate-structural-drain --strict`
- [x] 2.4 `bun run biome:ci`
- [x] 2.5 `git diff --check`
