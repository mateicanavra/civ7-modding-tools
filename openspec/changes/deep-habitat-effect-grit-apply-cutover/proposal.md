# Proposal: Deep Habitat Effect Grit Apply Cutover

## Summary

Move Grit check and apply execution onto the provider/resource substrate while
preserving Grit as the owner of pattern semantics.

## What Changes

- `src/adapters/grit/*` consumes `GritProvider`, command model, and typed errors.
- Grit cache directories are acquired through scoped resources.
- Pattern apply dry-run records use typed command observations.

## What Does Not Change

- No new Grit language semantics.
- No live-write implementation for `habitat fix` unless a later packet accepts
  it with protected-zone and host-policy proof.
- No broad rewrite of `.habitat/patterns/**`.

## Verification Gates

- `bun run --cwd tools/habitat-harness test -- test/lib/grit-adapter.test.ts test/lib/pattern-apply.test.ts`
- `bun run --cwd tools/habitat-harness validate:grit-patterns`
- `bun run habitat check --tool pattern-check --json`
- `bun run openspec -- validate deep-habitat-effect-grit-apply-cutover --strict`
- `git diff --check`
