# Change: Deep Habitat Effect Public Surface Facade

## Why

The root Habitat barrel currently exports internal runtime, registry, rule, and
provider-adjacent types. Moving internals before classifying exports would turn
private implementation movement into accidental public API churn.

## What Changes

- Create `tools/habitat-harness/src/public/**` as the explicit package-facing
  facade.
- Classify every current `src/index.ts` export as public contract, internal
  callsite, explicit public adapter, test-only import, or removal candidate.
- Keep public adapters only when they have an owner and closure action.

## What Does Not Change

- No command, hook, JSON, or package behavior changes.
- No provider or domain implementation migration.

## Verification

- `bun run openspec -- validate deep-habitat-effect-public-surface-facade --strict`
- `git diff --check`
