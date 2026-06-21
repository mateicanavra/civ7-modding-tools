# Tasks

## 1. Implementation

- [x] 1.1 Export the Grit adapter failure schema and tag list from the Grit
      provider failure module.
- [x] 1.2 Re-export provider-owned failure vocabulary from the diagnostic
      catalog under existing diagnostic names.
- [x] 1.3 Remove the duplicate diagnostic failure literal list and renderer.
- [x] 1.4 Preserve existing rendered failure text and diagnostic schema names.

## 2. Verification

- [x] 2.1 `bun run --cwd tools/habitat-harness test -- test/lib/grit-adapter.test.ts test/lib/check-summaries.test.ts`
- [x] 2.2 `bun run --cwd tools/habitat-harness check`
- [x] 2.3 `bun run openspec -- validate deep-habitat-effect-grit-failure-taxonomy-enclosure --strict`
- [x] 2.4 `bun run biome:ci`
- [x] 2.5 `git diff --check`
