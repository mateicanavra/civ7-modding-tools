# Tasks

## 1. Baseline

- [x] 1.1 Confirm `runPrePush` still exposes a synchronous hook execution path.
- [x] 1.2 Confirm hook service pre-push already has Git/Nx provider execution.
- [x] 1.3 Confirm pre-push tests still exercise the synchronous helper path.

## 2. Implementation

- [x] 2.1 Remove exported synchronous pre-push dispatch from the hook service module.
- [x] 2.2 Replace unknown-hook service fallback with a direct service result.
- [x] 2.3 Move pre-push behavior coverage onto `runHookService` with fake
  Git/Nx providers.
- [x] 2.4 Keep pre-commit synchronous helper coverage unchanged for the follow-on
  staged mutation provider drain.

## 3. Verification

- [x] 3.1 `bun run --cwd tools/habitat-harness test -- test/service/hook-service.test.ts test/lib/hooks.test.ts`
- [x] 3.2 `bun run --cwd tools/habitat-harness check`
- [x] 3.3 `bun run openspec -- validate deep-habitat-effect-hook-prepush-provider-drain --strict`
- [x] 3.4 `git diff --check`
