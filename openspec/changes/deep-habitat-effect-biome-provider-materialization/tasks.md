# Tasks

## 1. Baseline

- [x] 1.1 Identify that `BiomeProvider` requests executable `biome` directly.
- [x] 1.2 Confirm `biome` is not registered as a workspace tool while
  `format-check` is.
- [x] 1.3 Confirm direct Habitat invocation can miss Bun script PATH.

## 2. Implementation

- [x] 2.1 Register Biome as a workspace-managed tool.
- [x] 2.2 Add behavior coverage for Biome command materialization.
- [x] 2.3 Keep BiomeProvider public command-vector helpers unchanged.

## 3. Verification

- [x] 3.1 `bun run --cwd tools/habitat-harness check`
- [x] 3.2 `bun run --cwd tools/habitat-harness test -- test/lib/vendor-providers.test.ts`
- [x] 3.3 `bun tools/habitat-harness/bin/dev.ts check --tool format-check --json`
- [x] 3.4 `bun run check`
- [x] 3.5 `bun run biome:ci`
- [x] 3.6 `bun run openspec -- validate deep-habitat-effect-biome-provider-materialization --strict`
- [x] 3.7 `bun run openspec:validate`
- [x] 3.8 `git diff --check`
