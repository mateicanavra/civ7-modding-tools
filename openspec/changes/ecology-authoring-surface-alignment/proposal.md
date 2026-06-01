# Proposal: Ecology Authoring Surface Alignment

## Summary

Replace the standard recipe Ecology raw step/op envelope authoring surface with
semantic public groups for pedology, biome classification, feature suitability,
feature-family planning, and plot-effect coverage. Ecology currently exposes
strategy selectors, `config` envelopes, raw planning step ids, empty vegetation
scoring ops, and plot-effect selector identifiers. This slice keeps behavior
deterministic by compiling semantic public groups into the existing internal
Ecology executable config, migrates first-party shipped map configs, and proves
the migrated configs compile to the same internal Ecology output as the
pre-slice raw-envelope configs.

## Authority

- `docs/projects/standard-recipe-authoring-surface/PROJECT.md`
- `docs/projects/standard-recipe-authoring-surface/taxonomy-and-slices.md`
- `openspec/changes/authoring-surface-corpus-and-taxonomy/`
- `openspec/changes/foundation-authoring-surface-alignment/`
- `openspec/changes/morphology-authoring-surface-alignment/`
- `openspec/changes/hydrology-authoring-surface-alignment/`
- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
- `docs/system/libs/mapgen/policies/SCHEMAS-AND-VALIDATION.md`
- `docs/system/mods/swooper-maps/`

## Requires

- Foundation, Morphology, and Hydrology alignment branches below this branch.
- Existing Ecology stage compile hooks and deterministic step/runtime config
  defaults.
- Current generated Studio recipe artifacts.

## Affected Owners

- `mods/mod-swooper-maps/src/domain/ecology/`
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-*/`
- `mods/mod-swooper-maps/src/maps/configs/*.config.json`
- `mods/mod-swooper-maps/test/config/`
- `apps/mapgen-studio/src/ui/data/defaultConfig.ts`
- `apps/mapgen-studio/test/config/defaultConfigSchema.test.ts`
- `docs/projects/standard-recipe-authoring-surface/`
- `openspec/changes/ecology-authoring-surface-alignment/`

## Forbidden Owners

- Ecology runtime algorithms.
- Projection ownership in `map-ecology`.
- Persisted raw Ecology `{ strategy, config }` public wrappers.
- Persisted plot-effect engine selector identifiers.
- Dual persisted config shapes or compatibility shims.
- Generated source artifact hand edits.

## Public Surface

The Ecology public surface becomes:

- `ecology-pedology`: `knobs`, `soilClassification`,
  `resourceBasinPlanning`, `resourceBasinScoring`
- `ecology-biomes`: `knobs`, `biomeClassification`
- `ecology-features`: `knobs`, `substrateScoring`, `wetlandScoring`,
  `reefScoring`, `iceScoring`, `icePlanning`, `reefPlanning`,
  `wetlandPlanning`, `vegetationPlanning`, `plotEffectScoring`,
  `plotEffectCoverage`

The public surface keeps exact expert numeric controls where shipped maps already
depend on exact values, adds semantic profiles where authors previously had to
choose strategy ids, hides empty vegetation scoring ops, and keeps plot-effect
engine selector identifiers selected by the recipe rather than persisted in map
configs.

## Consumer Impact

Authors and Studio users no longer author Ecology through internal stage keys
such as `pedology`, `resource-basins`, `biomes`, `score-layers`, `plan-ice`,
`plan-reefs`, `plan-wetlands`, `plan-vegetation`, or `plan-plot-effects`.
First-party configs are migrated to semantic keys and must still validate.
Removed legacy Ecology step keys, public strategy selectors, raw config wrappers,
and plot-effect selectors fail strict validation as unknown keys.

## Stop Conditions

- Any Ecology public schema exposes raw `{ strategy, config }` envelopes.
- Any Ecology public schema exposes legacy internal step keys as public keys.
- Any Ecology public schema exposes plot-effect selector identifiers.
- Any Ecology public numeric leaf lacks both `minimum` and `maximum`.
- Any Ecology public field lacks author-facing schema documentation.
- Shipped configs or presets fail validation after migration.
- Migrated shipped configs compile to different stable Ecology output without an
  explicit behavior-change proof record.

## Verification Gates

- Focused shipped config/schema tests.
- Ecology compile tests that author config through semantic public keys.
- Studio generated schema/default tests.
- Stable compiled-config equivalence for shipped Ecology configs.
- Unknown-key tests for removed legacy Ecology raw envelope keys, stale strategy
  selectors, plot-effect selectors, and out-of-range public controls.
- Ledger summary showing Ecology public fields documented, bounded, and free of
  raw envelope rows.
- OpenSpec validation.
- Peer-agent review and repair of accepted P1/P2 findings.
- `git diff --check`.
