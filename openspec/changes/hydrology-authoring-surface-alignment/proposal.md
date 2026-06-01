# Proposal: Hydrology Authoring Surface Alignment

## Summary

Replace the standard recipe Hydrology raw step/op envelope public surface with
semantic authoring groups that compile deterministically into the existing
internal Hydrology executable config. Hydrology currently leaks strategy
selectors and `config` envelopes for climate baseline, hydrography, and climate
refinement. This slice removes those persisted public internals, migrates
first-party shipped map configs in the same branch, and proves the migrated
configs compile to the same internal Hydrology output as the pre-slice configs.

## Authority

- `docs/projects/standard-recipe-authoring-surface/PROJECT.md`
- `docs/projects/standard-recipe-authoring-surface/taxonomy-and-slices.md`
- `openspec/changes/authoring-surface-corpus-and-taxonomy/`
- `openspec/changes/foundation-authoring-surface-alignment/`
- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
- `docs/system/libs/mapgen/policies/SCHEMAS-AND-VALIDATION.md`

## Requires

- Foundation and Morphology alignment branches below this branch.
- Existing Hydrology stage compile hooks and deterministic step/runtime config
  defaults.
- Current generated Studio recipe artifacts.

## Affected Owners

- `mods/mod-swooper-maps/src/domain/hydrology/`
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-*/`
- `mods/mod-swooper-maps/src/maps/configs/*.config.json`
- `mods/mod-swooper-maps/test/config/`
- `apps/mapgen-studio/test/config/defaultConfigSchema.test.ts`
- `docs/projects/standard-recipe-authoring-surface/`
- `openspec/changes/hydrology-authoring-surface-alignment/`

## Forbidden Owners

- Hydrology runtime algorithms.
- Projection ownership in `map-hydrology` or `map-rivers`.
- Persisted raw Hydrology `{ strategy, config }` public wrappers.
- Dual persisted config shapes or compatibility shims.
- Generated source artifact hand edits.

## Public Surface

The Hydrology public surface becomes:

- `hydrology-climate-baseline`: `knobs`, `seasonalCycle`, `solarForcing`,
  `thermalState`, `atmosphericCirculation`, `oceanCurrents`, `oceanGeometry`,
  `oceanThermalState`, `evaporation`, `moistureTransport`, `precipitation`
- `hydrology-hydrography`: `knobs`, `runoff`, `riverNetwork`, `lakes`
- `hydrology-climate-refine`: `knobs`, `precipitationRefinement`,
  `solarForcing`, `thermalState`, `albedoFeedback`, `cryosphereState`,
  `landWaterBudget`, `diagnostics`

Those groups keep expert numeric controls where first-party configs already
depend on exact values, but hide strategy selection and internal step names from
authors and Studio users.

## Consumer Impact

Authors and Studio users no longer author Hydrology through internal stage keys
such as `climate-baseline`, `rivers`, `climate-refine`, or op envelope
selectors. `hydrology-hydrography.lakes` remains a semantic public group; the
legacy nested `lakes.planLakes.{strategy,config}` shape is removed. First-party
configs are migrated to the new semantic keys and must still validate. Removed
legacy Hydrology public keys fail strict validation as unknown keys.

## Stop Conditions

- Any Hydrology public schema exposes raw `{ strategy, config }` envelopes.
- Any Hydrology public schema exposes legacy internal step keys as public keys.
- Any Hydrology public numeric leaf lacks both `minimum` and `maximum`.
- Any Hydrology public field lacks author-facing schema documentation.
- Shipped configs or presets fail validation after migration.
- Migrated shipped configs compile to different stable Hydrology output without
  an explicit behavior-change proof record.

## Verification Gates

- Focused shipped config/schema tests.
- Hydrology runtime compile tests that author config through semantic public
  keys.
- Studio generated schema/default test.
- Stable compiled-config equivalence for shipped Hydrology configs.
- Unknown-key tests for removed legacy Hydrology raw envelope keys and stale
  strategy selectors.
- Ledger summary showing Hydrology public fields documented, bounded, and free
  of raw envelope rows.
- OpenSpec validation.
- Peer-agent review and repair of accepted P1/P2 findings.
- `git diff --check`.
