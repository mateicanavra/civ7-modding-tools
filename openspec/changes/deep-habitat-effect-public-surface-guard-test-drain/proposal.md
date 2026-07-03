# Change: Deep Habitat Effect Public Surface Guard Test Drain

## Why

`public-surface-guards.test.ts` validated guard behavior by creating temporary
files and shelling the root lint script. That made a package unit test pay for a
current-tree script wrapper and hid the actual guard model behind subprocess
behavior.

Habitat should keep the current-tree guard as a Habitat rule entrypoint while
testing the guard model directly.

## What Changes

- Extract public-surface guard logic into an owned Habitat source module.
- Reduce `scripts/lint/lint-habitat-public-surface-guards.mjs` to a CLI wrapper
  over that module.
- Replace subprocess/temp-directory test execution with direct guard-module
  calls over injected fixture files.

## Non-Goals

- Do not weaken or remove public-surface guard checks.
- Do not change `.habitat` rule metadata or current-tree Habitat check
  semantics.
- Do not add topology enforcement tests; the current-tree rule remains the
  structural enforcement path.

## Validation

- `bun scripts/lint/lint-habitat-public-surface-guards.mjs` must pass.
- `node scripts/lint/lint-habitat-public-surface-guards.mjs` must pass.
- `bun run --cwd tools/habitat-harness test -- public-surface-guards.test.ts`
  should exercise the guard module without shelling the lint script.
