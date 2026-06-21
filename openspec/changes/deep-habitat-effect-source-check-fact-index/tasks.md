# Tasks

## 1. Implementation

- [x] 1.1 Add a per-file source-check fact index to the runtime.
- [x] 1.2 Route common AST helpers through the fact index.
- [x] 1.3 Preserve the existing generated rule module API.

## 2. Verification

- [x] 2.1 `bun run --cwd tools/habitat-harness test -- test/lib/source-rules.test.ts`
- [x] 2.2 `bun tools/habitat-harness/bin/dev.ts check --tool source-check --json`
      - Captured source-check shared duration: 2334ms before this slice,
        1291ms after this slice.
- [x] 2.3 `bun run --cwd tools/habitat-harness check`
- [x] 2.4 `bun run openspec -- validate deep-habitat-effect-source-check-fact-index --strict`
- [x] 2.5 `bun run biome:ci`
- [x] 2.6 `git diff --check`
- [x] 2.7 `bun run --cwd tools/habitat-harness test`
