# Tasks

## 1. Implementation

- [x] 1.1 Remove live `Layer` construction from the source-check domain service.
- [x] 1.2 Move `SourceCheck` live layer assembly into the runtime boundary.
- [x] 1.3 Remove unused fake/live source-check layer exports from the domain
      barrel.
- [x] 1.4 Preserve source-rule execution behavior.

## 2. Verification

- [x] 2.1 `bun run --cwd tools/habitat-harness test -- test/lib/source-rules.test.ts test/service/check-service.test.ts`
- [x] 2.2 `bun run --cwd tools/habitat-harness check`
- [x] 2.3 `bun run openspec -- validate deep-habitat-effect-source-check-live-layer-drain --strict`
- [x] 2.4 `bun run biome:ci`
- [x] 2.5 `git diff --check`
