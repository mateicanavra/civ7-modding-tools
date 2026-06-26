# Change: Deep Habitat Effect Fix Service Module

## Why

`habitat fix` is an owned Habitat transformation capability. Its command-level
orchestration should live in the Effect-oRPC service module, not in a generic
`lib` wrapper or the CLI. Habitat commands should enter owned behavior through
the service surface before the deeper transaction and protected-zone domain
drain proceeds.

## What Changes

- Add a `fix` Habitat service module under `src/service/modules/fix/**`.
- Compose `fix` into the root Habitat service contract and router.
- Route `src/commands/fix.ts` through the in-process Habitat service client.
- Move fix intent/admission orchestration into the fix service module and
  delete the old `src/lib/fix.ts` wrapper path.
- Move pattern apply contracts, transaction input resolution, refusal records,
  rendering, and worktree observation into
  `src/domains/transformation-transaction/**`; delete active
  `src/lib/pattern-apply/**` feature logic instead of preserving wrappers.
- Handle D0 public-surface row `D0-package-export-symbol-runfix` as `refuse`:
  no replacement package helper export is introduced.
- Preserve the current fix result contract: `{ exitCode, stdout, stderr }`.
- Record protected-zone domain drainage as a later implementation unit.

## What Does Not Change

- No live write escalation beyond current dry-run/refusal behavior.
- No protected-zone policy relaxation.
- No movement of protected-zone internals in this slice.

## Verification

- `bun run --cwd tools/habitat-harness test -- test/service/fix-service.test.ts test/service/service-architecture.test.ts test/commands/habitat-commands.test.ts test/lib/pattern-apply.test.ts`
- `bun run --cwd tools/habitat-harness check`
- `bun run --cwd tools/habitat-harness test`
- `bun run biome:ci`
- `bun run openspec -- validate deep-habitat-effect-transformation-transaction-domain --strict`
- `bun run openspec:validate`
- `git diff --check`
