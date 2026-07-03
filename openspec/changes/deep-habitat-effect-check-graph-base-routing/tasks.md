# Tasks

## 1. Implementation

- [x] 1.1 Route root `check:graph` through Habitat verify.
- [x] 1.2 Prefer Graphite parent in verify base resolution.
- [x] 1.3 Preserve explicit `--base` and remote merge-base fallback behavior.
- [x] 1.4 Add `graphite-parent` as a receipt base source.

## 2. Verification

- [x] 2.1 `bun run --cwd tools/habitat-harness test -- test/lib/verify-base.test.ts test/lib/verify-receipt.test.ts test/commands/habitat-commands.test.ts`
- [x] 2.2 `bun run --cwd tools/habitat-harness check`
- [x] 2.3 `bun run openspec -- validate deep-habitat-effect-check-graph-base-routing --strict`
- [x] 2.4 `bun run biome:ci`
- [x] 2.5 `git diff --check`
- [x] 2.6 `bun run check:graph -- --json`
