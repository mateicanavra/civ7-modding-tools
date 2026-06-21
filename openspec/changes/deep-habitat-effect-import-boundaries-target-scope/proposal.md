# Change: Deep Habitat Effect Import Boundaries Target Scope

## Why

Habitat's diagnostic check loop is still paying for broad workspace gates as if
they were ordinary rule rows. The worst current example is `import-boundaries`:
the rule is correctly owned by Nx and `@nx/enforce-module-boundaries`, but the
target scans the whole repo and reuses broad Habitat inputs, so unrelated docs
and harness edits can invalidate an expensive project-plane proof.

This undermines Habitat's product goal. Habitat should help humans and agents
understand the repo's enforceable structure quickly, while full repo gates stay
owned by their vendor/tool layer.

## What Changes

- Give the `boundaries` Nx target a boundary-specific source corpus and input
  set instead of inheriting all Habitat inputs.
- Route the `format-ci` structural rule through `BiomeProvider` instead of
  re-entering Nx for a single Biome command.
- Keep Nx and `@nx/enforce-module-boundaries` as the project-plane authority.
- Record the split between fast Habitat diagnostics and graph-owned full gates.
- Inventory remaining topology-as-test rows as migration debt for source-check,
  Grit/file-layer, or package behavioral test ownership.

## What Does Not Change

- No taxonomy or dependency constraint weakening.
- No Habitat-native replacement for Nx module-boundary semantics.
- No hidden fallback, shim, compatibility lane, or silent skip.
- No new topology tests.

## Affected Owners

- `tools/habitat-harness/src/plugin/target-definitions.ts`
- `tools/habitat-harness/docs/**`
- `docs/projects/habitat-harness/taxonomy.md`
- `.habitat/rules/import-boundaries/rule.json`
- This OpenSpec packet.

## Stop Conditions

- The boundary target can pass with an empty or missing source corpus.
- A source-bearing workspace path covered by the previous `eslint .` command is
  no longer linted by the boundary target.
- Nx cache inputs omit files that can change project-plane boundary outcomes.
- A package architecture test becomes the only topology enforcement owner.

## Verification

- `nx run @internal/habitat-harness:boundaries --skipNxCache`
- `bun run habitat -- check --tool import-boundaries --json`
- `bun run habitat -- check --json`
- `bun run --cwd tools/habitat-harness check`
- OpenSpec strict validation for this packet and all changes.
