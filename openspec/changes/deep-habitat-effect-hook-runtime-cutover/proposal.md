# Proposal: Deep Habitat Effect Hook Runtime Cutover

## Summary

Move Habitat hook runtime under Effect services while preserving Husky as a
delegator and preserving hook results as local workstation checks only.

## What Changes

- Move hook runtime source into `src/domains/local-feedback/**`.
- Replace local `HookRuntime` ad hoc seams with Effect services and fake Layers.
- Route Biome, Grit, Git, and Habitat command invocations through providers.

## What Does Not Change

- `.husky/pre-commit` and `.husky/pre-push` continue to delegate to
  `bun run habitat hook`.
- Pre-commit may restage formatter-touched files only.
- CI remains authoritative.

## Verification Gates

- `bun run --cwd tools/habitat-harness test -- test/lib/hooks.test.ts`
- `bun run habitat hook pre-commit`
- `bun run openspec -- validate deep-habitat-effect-hook-runtime-cutover --strict`
- `git diff --check`
