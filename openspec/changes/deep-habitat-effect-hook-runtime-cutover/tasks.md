# Tasks

## 1. Hook Service Module

- [x] 1.1 Add hook service contract, module binding, router, and run function.
- [x] 1.2 Compose `hook` into the root Habitat service contract and router.
- [x] 1.3 Route `habitat hook` CLI through the Habitat service client.
- [x] 1.4 Move hook command orchestration into the service module and remove the
      obsolete `src/lib/hooks.ts` wrapper.
- [x] 1.5 Update D0 public-surface authority to refuse the old `runHook`
      package helper export instead of preserving a wrapper.
- [x] 1.6 Update D0 public-surface authority to refuse the old `lib/hooks`
      aggregate helper/type facade instead of preserving a wrapper.

## 2. Preserve Behavior

- [x] 2.1 Keep local hook notice in human output.
- [x] 2.2 Preserve partial-staging refusal.
- [x] 2.3 Preserve formatter restage-only behavior.
- [x] 2.4 Preserve pre-push target sequence unless changed by verify/Nx packet.
- [x] 2.5 Preserve unknown hook name exit and stderr behavior.

## 3. Explicit Remaining Drain

- [x] 3.1 Record that Git, Biome, Grit, filesystem, clock, and command execution
      are still in lower-level hook runtime material after this service-module
      ownership slice.
- [x] 3.2 Keep hook runtime provider drainage as the next hook implementation unit.

## 4. Verification

- [x] 4.1 Run `bun run --cwd tools/habitat-harness test -- test/lib/hooks.test.ts`.
- [x] 4.2 Run focused hook service/command/architecture tests.
- [x] 4.3 Run `bun run habitat hook pre-commit`.
- [x] 4.4 Run `bun run --cwd tools/habitat-harness check`.
- [x] 4.5 Run `bun run --cwd tools/habitat-harness test`.
- [x] 4.6 Run `bun run biome:ci`.
- [x] 4.7 Run `bun run openspec -- validate deep-habitat-effect-hook-runtime-cutover --strict`.
- [x] 4.8 Run `bun run openspec:validate`.
- [x] 4.9 Run `git diff --check`.
