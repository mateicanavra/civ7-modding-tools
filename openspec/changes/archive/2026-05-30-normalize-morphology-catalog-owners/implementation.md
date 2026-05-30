# normalize-morphology-catalog-owners Implementation Record

Date: 2026-05-30
Branch: `codex/normalize-morphology-catalog-owners-impl`
Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-normalize-authority-routing`

## Scope

This slice removes morphology catalog/config ownership drift without changing
map-generation behavior.

## Inventory And Disposition

- `mods/mod-swooper-maps/src/domain/morphology/config.ts` was a multi-owner
  schema catalog. It is now only a recipe-facing facade for morphology knobs
  and knob multipliers.
- Morphology op strategy schemas now live with their owning op or named op
  family:
  - `compute-base-topography/config.ts`: `ReliefConfigSchema`
  - `compute-coastline-metrics/config.ts`: coast carving schemas
  - `compute-geomorphic-cycle/config.ts`: geomorphology/world-age schemas
  - `compute-sea-level/config.ts`: hypsometry schema
  - `plan-island-chains/config.ts`: island-chain schema
  - `plan-volcanoes/config.ts`: volcano schema
  - `mountains-shared/config.ts`: shared mountain/foothill schema
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/artifacts.ts`
  remains as an explicit shared surface for morphology truth artifact schemas.
- `mods/mod-swooper-maps/src/recipes/standard/tags.ts` remains the standard
  recipe tag registry, but milestone-prefixed catalog names were replaced with
  owner/surface names:
  - `FIELD_DEPENDENCY_TAGS`
  - `STANDARD_ENGINE_EFFECT_TAGS`
  - `MAP_PROJECTION_EFFECT_TAGS`
  - `CANONICAL_FIELD_AND_ENGINE_TAGS`

## Shared Surface Exceptions

- `ops/mountains-shared/config.ts` is retained because ridge and foothill
  planning need one terrain-classification posture across `plan-ridges`,
  `plan-foothills`, and `plan-ridges-and-foothills`.
- `stages/morphology/artifacts.ts` is retained because morphology truth
  artifacts are shared publish/consume contracts across morphology truth
  stages and downstream projection stages.
- Domain-root `/config.ts` facades are allowed only as recipe-facing public
  surfaces or explicitly documented shared config owners. This slice did not
  treat `/config` as the required home for strategy-owned schemas.

## Guardrails

- Added a categorical domain-refactor lint guard:
  - all refactored domain ops are checked for imports back to a domain-root
    `config.js` facade;
  - the standard recipe tree is checked for milestone-prefixed tag catalogs.
- Added a focused morphology catalog ownership test that exercises the same
  categories in the local test suite and keeps morphology's domain config
  facade pinned to knobs/multipliers.

## Docs

- Updated the Morphology reference to point schema anchors at op-local owners
  and to document retained shared surfaces.
- Updated the import policy to state that domain `/config.js` surfaces are
  recipe-facing facades unless they explicitly own a shared invariant.
- Updated tag docs/examples from milestone catalog names to owner/surface names.

## Verification

Commands run from the worktree:

- `bun run --cwd mods/mod-swooper-maps test -- test/morphology/catalog-ownership.test.ts test/pipeline/artifacts.test.ts test/pipeline/map-stamping.contract-guard.test.ts test/morphology/contract-guard.test.ts`
- `bun run --cwd mods/mod-swooper-maps check`
- `bun run --cwd mods/mod-swooper-maps build`
- `bun run lint:mapgen-recipe-imports`
- `bun run lint:domain-refactor-guardrails`
- `rg -n "from [\"'](?:\\.\\./){2,3}config\\.js[\"']" mods/mod-swooper-maps/src/domain/morphology/ops -g '*.ts' || true`
- `rg -n "\\bM[0-9]+_(DEPENDENCY|EFFECT|CANONICAL)|M[0-9]+_EFFECT_TAGS|M[0-9]+_DEPENDENCY_TAGS|M[0-9]+_CANONICAL|M3_DEPENDENCY_TAGS|M4_EFFECT_TAGS|M10_EFFECT_TAGS" mods/mod-swooper-maps/src docs/system/libs/mapgen mods/mod-swooper-maps/test -g '!**/_archive/**' || true`
- `bun run openspec -- validate normalize-morphology-catalog-owners --strict`
- `bun run openspec:validate`
- `git diff --check`
