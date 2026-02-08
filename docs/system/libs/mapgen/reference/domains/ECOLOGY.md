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

Truth stage:
- `ecology`

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
- `artifact:ecology.featureIntents.vegetation`
- `artifact:ecology.featureIntents.wetlands`
- `artifact:ecology.featureIntents.reefs`
- `artifact:ecology.featureIntents.ice`

Projection posture:
- `map-ecology` is projection-only and publishes current runtime dependency tags (`field:*`) and effect tags.

## Key artifacts

Ecology artifacts are authored by the standard recipe:
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts`

Note: some Ecology artifact schemas are currently permissive (`Type.Any()` fields). Treat those as implementation detail until tightened.

## Ops surface

Ecology domain ops used by the standard recipe include:
- `classifyBiomes`
- `planPlotEffects`
- `applyFeatures`

Other ops exist and may be used by additional steps (see the domain contracts).

## Config posture

Current posture in the standard recipe:
- `ecology` stage compiles a strict public config surface into step configs with explicit key mapping.
- `map-ecology` stage compiles a strict public config surface into projection step configs.
- knobs are present but currently empty at the stage level.

## Engine projection notes (map-ecology)

The `map-ecology` stage:
- is `phase: "gameplay"` (projection-only),
- consumes Ecology truth artifacts (biomeClassification, featureIntents.*) and Morphology truth (topography),
- publishes `field:*` runtime dependency tags (e.g., `field:biomeId`, `field:featureType`),
- and publishes engine effect tags (e.g., `effect:engine.biomesApplied`).

## Ground truth anchors

- Stage definitions (compile mapping, step list):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/index.ts`
- Ecology truth artifacts: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts`
- Example step contracts (truth stage):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/pedology/contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts`
- Example step contracts (projection stage):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/contract.ts`
- Tag registry (effect tags, current `field:*` deps): `mods/mod-swooper-maps/src/recipes/standard/tags.ts`
- Policy: truth vs projection: `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`

## Open questions

- Tightening Ecology artifact schemas: which fields should be typed as typed arrays vs structured objects, and where should those schemas live (content vs SDK)?
