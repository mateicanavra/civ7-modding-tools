# Proposal: Deep Habitat Effect Hook Service Module

## Summary

Make `habitat hook` an owned Habitat service capability. Husky remains a thin
delegator, the CLI becomes a thin service client, and hook results remain local
workstation feedback only.

## What Changes

- Add a `hook` Habitat service module under `src/service/modules/hook/**`.
- Compose `hook` into the root Habitat service contract and router.
- Route `src/commands/hook.ts` through the in-process Habitat service client.
- Preserve the current hook result contract: `{ exitCode, stdout, stderr }`.
- Update architecture tests so hook joins the owned service-module surface.

## What Does Not Change

- `.husky/pre-commit` and `.husky/pre-push` continue to delegate to
  `bun run habitat hook`.
- Pre-commit may restage formatter-touched files only.
- CI remains authoritative.
- Full hook runtime provider/resource drainage is the next hook implementation
  unit: Git, Biome, Grit, filesystem, clock, and command execution remain owned
  by the hook runtime internals until that unit lands.

## Verification Gates

- `bun run --cwd tools/habitat-harness test -- test/lib/hooks.test.ts`
- `bun run --cwd tools/habitat-harness test -- test/service/hook-service.test.ts test/service/service-architecture.test.ts test/commands/habitat-commands.test.ts`
- `bun run habitat hook pre-commit`
- `bun run openspec -- validate deep-habitat-effect-hook-runtime-cutover --strict`
- `git diff --check`
