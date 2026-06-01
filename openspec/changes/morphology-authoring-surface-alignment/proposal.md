# Proposal: Morphology Authoring Surface Alignment

## Summary

Bring the existing standard recipe Morphology public surface up to the
authoring-surface bar established by the corpus/taxonomy and Foundation slices.
Morphology already uses semantic public keys and deterministic compile
functions, so this slice does not rename or migrate public fields. It tightens
the remaining public field documentation and numeric ranges, adds exhaustive
schema guards, and proves shipped configs compile to the same executable
Morphology config as before the slice.

## Authority

- `docs/projects/standard-recipe-authoring-surface/PROJECT.md`
- `docs/projects/standard-recipe-authoring-surface/taxonomy-and-slices.md`
- `openspec/changes/authoring-surface-corpus-and-taxonomy/`
- `openspec/changes/morphology-public-config-surface/`
- `openspec/changes/guard-morphology-public-config-boundary/`
- `openspec/changes/migrate-swooper-morphology-public-configs/`
- `docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md`
- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
- `docs/system/libs/mapgen/policies/SCHEMAS-AND-VALIDATION.md`

## Requires

- Foundation alignment branch below this branch.
- Existing Morphology public+compile surface and migrated first-party configs.
- Current generated Studio recipe artifacts.

## Affected Owners

- `mods/mod-swooper-maps/src/domain/morphology/`
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-*/`
- `mods/mod-swooper-maps/test/config/`
- `apps/mapgen-studio/test/config/defaultConfigSchema.test.ts`
- `docs/projects/standard-recipe-authoring-surface/`
- `openspec/changes/morphology-authoring-surface-alignment/`

## Forbidden Owners

- Morphology runtime algorithms.
- Shipped map config shape or values.
- Generated map source artifacts unless config values change.
- Compatibility shims or dual persisted config shapes.
- `map-morphology` projection ownership.

## Public Surface

The Morphology public surface remains:

- `morphology-coasts`: `knobs`, `substrate`, `relief`, `waterCoverage`,
  `continents`, `coastlineShape`, `shelf`
- `morphology-routing`: `knobs`
- `morphology-erosion`: `knobs`, `geomorphicCycle`
- `morphology-features`: `knobs`, `islandChains`, `mountainRanges`,
  `volcanoes`

This slice keeps that shape and requires every public field under those keys to
have author-facing documentation and numeric min/max bounds where applicable.

## Consumer Impact

Authors and Studio users see the same Morphology keys and defaults, but the
generated schema becomes more intentional: descriptions explain map/gameplay
impact and numeric leaves reject out-of-range values instead of accepting
unbounded implementation numbers.

## Stop Conditions

- Any Morphology public schema exposes raw `{ strategy, config }` envelopes.
- Any Morphology public field lacks schema description.
- Any Morphology public numeric leaf lacks both `minimum` and `maximum`.
- Shipped configs or presets fail validation after range tightening.
- Compiled Morphology output for shipped configs differs from the pre-slice
  compiled output without a behavior-change proof record.

## Verification Gates

- Focused shipped config/schema tests.
- Studio generated schema/default test.
- Stable compiled-config equivalence for shipped Morphology config.
- Ledger summary showing Morphology public fields documented, bounded, and free
  of raw envelope rows.
- OpenSpec validation.
- Peer-agent review and repair of accepted P1/P2 findings.
- `git diff --check`.
