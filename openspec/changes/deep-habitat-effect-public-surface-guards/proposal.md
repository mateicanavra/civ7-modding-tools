# Proposal: Deep Habitat Effect Public Surface Guards

## Summary

Close the train by narrowing Habitat public exports and adding durable guards
that prevent regression to direct side effects, generic `src/lib` growth,
provider leaks, and authored-artifact boundary drift.

## What Changes

- Review and narrow `src/index.ts`, `package.json` `exports`, and `files`.
- Add Habitat/Grit/Biome/Nx-backed guards for forbidden imports and target tree
  boundaries.
- Update docs to point implementers at the final Effect-first architecture.

## What Does Not Change

- No new public command behavior.
- No authored artifact content migration.
- No generated-output hand edits.

## Verification Gates

- `bun run habitat check --tool habitat --json`
- `bun run --cwd tools/habitat-harness check`
- `bun run --cwd tools/habitat-harness test`
- `bun run openspec -- validate deep-habitat-effect-public-surface-guards --strict`
- `git diff --check`
