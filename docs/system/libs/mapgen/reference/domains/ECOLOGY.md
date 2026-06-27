<toc>
  <item id="purpose" title="Purpose"/>
  <item id="stages" title="Stages (standard recipe)"/>
  <item id="contract" title="Contract (requires/provides)"/>
  <item id="artifacts" title="Key artifacts"/>
  <item id="ops" title="Ops surface"/>
  <item id="config" title="Config posture"/>
  <item id="projection" title="Engine projection notes (map-ecology)"/>
  <item id="anchors" title="Ground truth anchors"/>
  <item id="open-questions" title="Open questions"/>
</toc>

# Ecology domain

## Purpose

Ecology turns climate + terrain truth into biosphere truth and engine-facing surfaces:
- biome classification,
- soils/pedology,
- resource basin candidates,
- feature intents (planned placements),
and projection steps that bind those products into Civ7 engine buffers and effects.

## Stages (standard recipe)

Truth stages:
- `ecology-pedology`
- `ecology-biomes`
- `ecology-features`

Projection stage:
- `map-ecology`

See: [`docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`](/system/libs/mapgen/reference/STANDARD-RECIPE.md).

## Contract (requires/provides)

Ecology requires (truth inputs):
- Hydrology climate field + cryosphere products.
- Morphology topography truth.
- Hydrology hydrography truth snapshot.

Ecology provides (truth artifacts):
- `artifact:ecology.soils`
- `artifact:ecology.resourceBasins`
- `artifact:ecology.biomeClassification`
- `artifact:ecology.scoreLayers`
- `artifact:ecology.featureIntents.vegetation`
- `artifact:ecology.featureIntents.wetlands`
- `artifact:ecology.featureIntents.reefs`
- `artifact:ecology.featureIntents.ice`
- `artifact:ecology.plotEffectPlan`

Projection posture:
- `map-ecology` is projection-only: it projects biome, feature-intent, and plot-effect-plan artifacts into engine state and publishes current runtime dependency tags (`field:*`) and effect tags.

## Key artifacts

Ecology artifacts are authored by the standard recipe:
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts`

Note: some Ecology artifact schemas are currently permissive (`Type.Any()` fields). Treat those as implementation detail until tightened.

## Ops surface

Ecology domain ops used by the standard recipe are split along the target architecture boundaries:
- Compute substrate ops (shared compute layers used by multiple planners):
  - `computeFeatureSubstrate`
- Pedology/biome truth planners:
  - `classifyPedology`, `aggregatePedology`
  - `planResourceBasins`, `scoreResourceBasins`
  - `classifyBiomes`, `refineBiomeEdges`
- Feature intent planners (truth stage `ecology-features`):
  - Vegetation signals (compute) used by step-owned picking: `computeVegetationSubstrate`, `scoreVegetation*`
  - Other intent planners: `planWetlands`, `planReefs`, `planIce`
  - Planner-local `policies/` files own score-to-intent admission for each feature family. Do not route
    feature admission through generic `shared` helpers or projection code.
- Plot effect planners (truth stage `ecology-features`):
  - `planPlotEffects`
- Atomic per-feature placement planners (truth stage, disabled-by-default; see config posture):
  - Wet placements: `planWetPlacement*`
- Projection ops (projection stage `map-ecology`):
  - `applyFeatures`

Other ops exist and may be used by additional steps (see the domain contracts).

## Config posture

Current posture in the standard recipe:
- `ecology-pedology`, `ecology-biomes`, and `ecology-features` expose flat step-scoped config surfaces.
- `map-ecology` stage compiles a strict public config surface into projection step configs.
- knobs are present but currently empty at the stage level.

Key contract point: strategy config schemas stay with their owning op contracts or named op-family modules. The shared Ecology artifact surface is allowed because multiple truth and projection stages consume the same artifact invariants; it is not a dumping ground for strategy-owned config.

Feature scoring and planning stay separate:
- Score ops produce continuous physical suitability fields. A positive score is not itself a placement command.
- Planner-local policies decide whether a suitability candidate is strong enough to become an intent.
- Reef-family habitat eligibility is reef-owned: warm reefs use warm shallow near-coast shelf water, cold reefs use colder deeper shelf/edge water, atolls use isolated warm shallow banks, and `FEATURE_LOTUS` uses warm shallow near-land water.
- Wetland-family habitat eligibility is wet-feature-owned through named substrate masks: marsh and tundra bog require hydromorphic substrate, mangrove requires intertidal coast, and oasis/watering-hole features require isolated lowland water-source substrate plus arid scoring.

## Engine projection notes (map-ecology)

The `map-ecology` stage:
- is `phase: "gameplay"` (projection-only),
- consumes Ecology truth artifacts (biomeClassification, featureIntents.*, plotEffectPlan) and Morphology truth (topography),
- publishes `field:*` runtime dependency tags (e.g., `field:biomeId`, `field:featureType`),
- and publishes engine effect tags (e.g., `effect:engine.biomesApplied`).

## Ground truth anchors

- Stage definitions (compile mapping, step list):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-pedology/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-biomes/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-features/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/index.ts`
- Ecology truth artifacts: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts`
- Ecology domain op catalog (contracts + implementations):
  - `mods/mod-swooper-maps/src/domain/ecology/ops/contracts.ts`
  - `mods/mod-swooper-maps/src/domain/ecology/ops/index.ts`
- Example step contracts (truth stage):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-pedology/steps/pedology/contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-biomes/steps/biomes/contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-features/steps/plan-vegetation/contract.ts`
- Example step contracts (projection stage):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/contract.ts`
- Tag registry (effect tags, current `field:*` deps): `mods/mod-swooper-maps/src/recipes/standard/tags.ts`
- Policy: truth vs projection: `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
- Architecture guardrails (import bans and parity gates):
  - `.habitat/civ7/mapgen/domain/blueprints/ecology-domain/boundary/check/require_public_ecology_surfaces_and_retired_topology_removal/require_public_ecology_surfaces_and_retired_topology_removal.rule.json`
  - `mods/mod-swooper-maps/test/ecology/earthlike-balance-smoke.test.ts`

## Open questions

- Tightening Ecology artifact schemas: which fields should be typed as typed arrays vs structured objects, and where should those schemas live (content vs SDK)?
