# Tasks

## 1. Fix Service Module

- [x] 1.1 Add fix service contract, module binding, router, and run function.
- [x] 1.2 Compose `fix` into the root Habitat service contract and router.
- [x] 1.3 Route `habitat fix` CLI through the Habitat service client.
- [x] 1.4 Move fix command orchestration into the service module and remove the
      obsolete `src/lib/fix.ts` wrapper/export.
- [x] 1.5 Update D0 public-surface authority to refuse the old `runFix`
      package helper export instead of preserving a wrapper.

## 2. Preserve Behavior

- [x] 2.1 Preserve dry-run intent projection.
- [x] 2.2 Preserve live-write intent projection.
- [x] 2.3 Preserve missing-admission refusal behavior.

## 3. Explicit Remaining Drain

- [x] 3.1 Record that lower-level pattern apply and protected-zone internals
      remain in existing modules after this service-module slice.
- [x] 3.2 Keep transformation transaction/protected-zone domain drainage as the
      next implementation unit.

## 4. Verification

- [x] 4.1 Run focused fix service/command/architecture tests.
- [x] 4.2 Run pattern apply transaction tests.
- [x] 4.3 Run `bun run --cwd tools/habitat-harness check`.
- [x] 4.4 Run `bun run --cwd tools/habitat-harness test`.
- [x] 4.5 Run `bun run biome:ci`.
- [x] 4.6 Run `bun run openspec -- validate deep-habitat-effect-transformation-transaction-domain --strict`.
- [x] 4.7 Run `bun run openspec:validate`.
- [x] 4.8 Run `git diff --check`.
