# Tasks

## 1. Baseline

- [x] 1.1 Confirm pre-commit service execution still calls the shared
  synchronous Biome hook command path.
- [x] 1.2 Confirm `HookCheckRequirements` already includes `BiomeProvider`.
- [x] 1.3 Confirm service tests already use provider fake layers for hook
  vendors.

## 2. Implementation

- [x] 2.1 Route service pre-commit Biome format/check through `BiomeProvider`.
- [x] 2.2 Preserve pre-commit output, trace phases, formatter restage, and
  failure outcomes.
- [x] 2.3 Add focused provider-backed service coverage for staged Biome paths.

## 3. Verification

- [x] 3.1 `bun run --cwd tools/habitat-harness test -- test/service/hook-service.test.ts`
- [x] 3.2 `bun run --cwd tools/habitat-harness test -- test/lib/hooks.test.ts`
- [x] 3.3 `bun run --cwd tools/habitat-harness check`
- [x] 3.4 `bun run openspec -- validate deep-habitat-effect-hook-biome-provider-routing --strict`
- [x] 3.5 `bun run biome:ci`
- [x] 3.6 `git diff --check`
