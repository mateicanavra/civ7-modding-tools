# Tasks

## 1. Implementation

- [x] 1.1 Add a validation-routing domain for graph-check, verify, and pre-push lane target policy.
- [x] 1.2 Move pre-push changed-path target planning out of hook-runtime.
- [x] 1.3 Keep Nx target helpers as provider-facing wrappers over the routing domain.
- [x] 1.4 Preserve current target membership for this ownership slice.

## 2. Verification

- [x] 2.1 `bun run --cwd tools/habitat-harness test -- test/service/hook-service.test.ts test/lib/verify-receipt.test.ts`
- [x] 2.2 `bun run --cwd tools/habitat-harness check`
- [x] 2.3 `bun run openspec -- validate deep-habitat-effect-validation-lane-routing --strict`
- [x] 2.4 `bun run biome:ci`
- [x] 2.5 `git diff --check`
- [x] 2.6 `bun tools/habitat-harness/bin/dev.ts check --owner @internal/habitat-harness --json`
