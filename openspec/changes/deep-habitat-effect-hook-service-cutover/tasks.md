# Tasks

## 1. Baseline

- [x] 1.1 Confirm production hook CLI calls the service client.
- [x] 1.2 Confirm `runPreCommit` is only consumed by tests.
- [x] 1.3 Confirm the service path already owns in-process structural checks
  and Biome provider execution.

## 2. Implementation

- [x] 2.1 Remove the synchronous pre-commit export and direct staged Habitat
  check command helper.
- [x] 2.2 Migrate hook behavior tests to `runHookService` with fake providers.
- [x] 2.3 Collapse staged hook check result parsing to the in-process service
  shape.

## 3. Verification

- [x] 3.1 `bun run --cwd tools/habitat-harness test -- test/lib/hooks.test.ts`
- [x] 3.2 `bun run --cwd tools/habitat-harness test -- test/service/hook-service.test.ts`
- [x] 3.3 `bun run --cwd tools/habitat-harness check`
- [x] 3.4 `bun run openspec -- validate deep-habitat-effect-hook-service-cutover --strict`
- [x] 3.5 `bun run biome:ci`
- [x] 3.6 `git diff --check`
