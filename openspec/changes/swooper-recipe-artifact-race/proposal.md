## Why

After the catalog-order proof repair, H4 full root-test proof still fails in
`mod-swooper-maps:test`, but in a new class:

- `test/config/standard-recipe-artifact-guards.test.ts` imports
  `mod-swooper-maps/recipes/standard-artifacts`, which resolves to
  `dist/recipes/standard-artifacts.js`.
- During full root execution, another target can clean/rebuild
  `mod-swooper-maps:build:studio-recipes`, briefly removing that generated
  artifact while the package test imports it.

The guard is structural and should eventually move into Habitat-owned
enforcement, but H4 still needs the inherited root test path stable enough to
prove the Biome transition.

## What Changes

- Make `mod-swooper-maps:test` depend on the package's own
  `build:studio-recipes` target because the test suite imports generated
  recipe package exports.
- Preserve the existing generated artifact guard and its assertions.
- Record the dependency/race repair and the later harness-migration note in H4
  evidence.

## What Does Not Change

- No generated `dist/`, `mod/`, or `src/maps/generated/` files are hand-edited.
- No Swooper Maps runtime, recipe, artifact generator, or Studio behavior
  changes.
- No structural guard is weakened or retired in H4.

## Affected Owners

- `mods/mod-swooper-maps/package.json`
- Habitat H4 proof records

## Verification Gates

- Inspect the Nx project target to confirm `test` depends on
  `build:studio-recipes`.
- Run a focused root-load reproduction involving `mod-swooper-maps:test` and
  `mapgen-studio:test`.
- Run full root `test`.
- OpenSpec validation for this change and H4.
- `git diff --check`
- Generated/protected drift grep.

## Stop Conditions

- The repair requires source/runtime changes instead of target dependency
  ordering.
- The generated artifact guard still fails with ENOENT under a focused
  root-load reproduction.
- The target dependency introduces a cycle or weakens root-test coverage.
