# Proposal: Deep Habitat Effect Hook Service And Runtime Domain

## Summary

Make `habitat hook` an owned Habitat service capability backed by a named hook
runtime domain. Husky remains a thin delegator, the CLI becomes a thin service
client, and hook results remain local workstation feedback only.

## What Changes

- Add a `hook` Habitat service module under `src/service/modules/hook/**`.
- Compose `hook` into the root Habitat service contract and router.
- Route `src/commands/hook.ts` through the in-process Habitat service client.
- Move hook name dispatch, pre-commit orchestration, and pre-push orchestration
  into the hook service module and delete the old `src/lib/hooks.ts` wrapper.
- Move active hook runtime contracts, staged worktree helpers, resource
  decisions, pre-push base selection, lifecycle capture, and command tracing
  into `src/domains/hook-runtime/**`.
- Delete the active `src/lib/hook-runtime/**` feature module instead of keeping
  a compatibility wrapper or fallback path.
- Handle D0 public-surface row `D0-package-export-symbol-runhook` as `refuse`:
  no replacement package helper export is introduced.
- Handle D0 source row `D0-package-export-source-hooks-internal` as `refuse`:
  no aggregate compatibility wrapper is introduced for old hook helper/type
  exports.
- Preserve the current hook result contract: `{ exitCode, stdout, stderr }`.
- Update architecture tests so hook joins the owned service-module surface.

## What Does Not Change

- `.husky/pre-commit` and `.husky/pre-push` continue to delegate to
  `bun run habitat hook`.
- Pre-commit may restage formatter-touched files only.
- CI remains authoritative.
- Hook runtime behavior is domain-owned in this change; deeper provider/resource
  substitutions for Git, Biome, Grit, filesystem, clock, and command execution
  remain later drains.

## Verification Gates

- `bun run --cwd tools/habitat-harness test -- test/lib/hooks.test.ts`
- `bun run --cwd tools/habitat-harness test -- test/service/hook-service.test.ts test/service/service-architecture.test.ts test/commands/habitat-commands.test.ts`
- `bun run habitat hook pre-commit`
- `bun run openspec -- validate deep-habitat-effect-hook-runtime-cutover --strict`
- `git diff --check`
