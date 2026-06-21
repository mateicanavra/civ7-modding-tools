# Tasks

## 1. Implementation

- [x] 1.1 Classify Habitat rule artifact paths by registry owner tool.
- [x] 1.2 Route source-check rule artifacts to `source:check` without also
      requesting owner `habitat:check`.
- [x] 1.3 Route non-source rule artifacts to `habitat:rule:<id>`.
- [x] 1.4 Cover source-only, non-source-only, and mixed artifact diffs in hook
      service tests.

## 2. Verification

- [x] 2.1 `bun run --cwd tools/habitat-harness test -- test/service/hook-service.test.ts`
- [x] 2.2 `bun run --cwd tools/habitat-harness check`
- [x] 2.3 `bun run openspec -- validate deep-habitat-effect-prepush-artifact-source-dedup --strict`
- [x] 2.4 `bun run openspec:validate`
- [x] 2.5 `bun run biome:ci`
- [x] 2.6 `git diff --check`
