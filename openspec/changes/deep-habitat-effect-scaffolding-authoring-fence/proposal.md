# Change: Deep Habitat Effect Scaffolding Authoring Fence

## Why

Generators, scaffold refusal logic, and authored authority-data fences are the places
most likely to smuggle product-specific authoring language into generic
Habitat. They need a named domain boundary before the Effect-first train closes.

## What Changes

- Move generic scaffolding/refusal ownership to `src/domains/scaffolding/**`.
- Keep Nx generator host mechanics in provider/plugin/generator entrypoints.
- Enforce that generic Habitat refuses unsupported product authoring instead of
  parsing Civ7/MapGen semantics.

## What Does Not Change

- No generator names or Nx plugin entrypoints change.
- No MapGen/Civ7 authoring parser is introduced.

## Verification

- `bun run openspec -- validate deep-habitat-effect-scaffolding-authoring-fence --strict`
- `git diff --check`
