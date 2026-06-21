# Tasks

## 1. Implementation

- [x] 1.1 Add a pre-push target plan that separates owner-local Nx targets from affected targets.
- [x] 1.2 Route Habitat tooling-only changes through `@internal/habitat-harness:check`.
- [x] 1.3 Keep structural affected targets for Habitat tooling changes without generic `check`.
- [x] 1.4 Preserve artifact-only and ordinary repo change behavior.

## 2. Verification

- [x] 2.1 `bun run --cwd tools/habitat-harness test -- test/service/hook-service.test.ts`
- [x] 2.2 `bun run --cwd tools/habitat-harness check`
- [x] 2.3 `bun tools/habitat-harness/bin/dev.ts check --owner @internal/habitat-harness --json`
- [x] 2.4 `bun run openspec -- validate deep-habitat-effect-prepush-habitat-tooling-fastpath --strict`
- [x] 2.5 `bun run biome:ci`
- [x] 2.6 `git diff --check`
