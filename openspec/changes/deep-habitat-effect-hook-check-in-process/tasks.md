# Tasks

## 1. Baseline

- [x] 1.1 Confirm hook service pre-commit shells to
  `bun tools/habitat-harness/bin/dev.ts check --staged`.
- [x] 1.2 Confirm the check service already exposes staged-path input.
- [x] 1.3 Confirm hook service tests pin the recursive subprocess behavior.

## 2. Implementation

- [x] 2.1 Add a service pre-commit path that runs staged checks through
  `StructuralCheck`.
- [x] 2.2 Pass known staged paths into in-process file-layer and pattern checks.
- [x] 2.3 Preserve the existing synchronous hook helper for legacy behavior tests.
- [x] 2.4 Update service tests to assert that pre-commit does not spawn Habitat
  check.

## 3. Verification

- [x] 3.1 `bun run --cwd tools/habitat-harness check`
- [x] 3.2 `bun run --cwd tools/habitat-harness test -- test/service/hook-service.test.ts test/lib/hooks.test.ts`
- [x] 3.3 `bun run openspec -- validate deep-habitat-effect-hook-check-in-process --strict`
- [x] 3.4 `bun run openspec:validate`
- [x] 3.5 `bun run biome:ci`
- [x] 3.6 `bun run check`
- [x] 3.7 `git diff --check`
