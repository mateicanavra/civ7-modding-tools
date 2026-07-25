<toc>
  <item id="purpose" title="Purpose"/>
  <item id="stages" title="Stages (standard recipe)"/>
  <item id="contract" title="Contract (requires/provides)"/>
  <item id="artifacts" title="Key artifacts"/>
  <item id="ops" title="Ops surface"/>
  <item id="config" title="Config posture"/>
  <item id="projection" title="Engine projection notes (map-ecology)"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Ecology domain

## Purpose

Ecology turns climate + terrain truth into biosphere truth and engine-facing surfaces:
- biome classification,
- soils/pedology,
- feature intents (planned placements),
and projection steps that bind those products into Civ7 engine state and publish evidence.

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
- `artifact:ecology.biomeClassification`
- `artifact:ecology.scoreLayers`
- `artifact:ecology.featureIntents.vegetation`
- `artifact:ecology.featureIntents.wetlands`
- `artifact:ecology.featureIntents.floodplains`
- `artifact:ecology.featureIntents.reefs`
- `artifact:ecology.featureIntents.ice`
- `artifact:ecology.plotEffectPlan`

Projection posture:
- `map-ecology` is projection-only: it projects biome, feature-intent, and plot-effect-plan artifacts into engine state, owns and publishes `artifact:ecology.biomeBindings` and `artifact:ecology.featureEngineSnapshot` as immutable projection evidence, and declares effect tags for completed mutations.

## Key artifacts

Ecology's semantic data products are owned by the module that produces them:
- Pedology: `mods/mod-swooper-maps/src/domain/ecology/modules/pedology/artifacts/index.ts`
- Biomes: `mods/mod-swooper-maps/src/domain/ecology/modules/biomes/artifacts/index.ts`
- Features: `mods/mod-swooper-maps/src/domain/ecology/modules/features/artifacts/index.ts`
- Plot effects: `mods/mod-swooper-maps/src/domain/ecology/modules/plot-effects/artifacts/index.ts`

There is deliberately no root Ecology artifact aggregate. Steps import the exact producing module's
catalog, keeping artifact ownership visible and preventing the root domain from becoming a second
discovery surface.

Projection-only engine evidence remains with its map-stage owner:
- `mods/mod-swooper-maps/src/recipes/standard/stages/map/ecology/artifacts/index.ts`

Projection evidence has distinct semantics: `biomeBindings` records symbolic-to-engine biome
binding outcomes, while `featureEngineSnapshot` records exactly one post-Ecology engine feature ID per
tile after feature stamping and terrain validation. Neither artifact is mutation authority.

## Ops surface

The root contract composes four semantic modules in causal order. Runtime consumers use the matching
root router; neither surface flattens module ownership:

- `pedology`: soil classification and published pedology fields
- `biomes`: biome classification with its owned edge refinement
- `features`: shared substrate derivation, feature-family scoring, feature-intent planning, and
  `applyFeatures`
- `plotEffects`: plot-effect scoring and `planPlotEffects`

Cross-operation feature scoring and selection policy lives under
`modules/features/model/policy/`. Planner-specific admission and substrate derivation remain private
rules of their owning operation, without introducing operation-local policy folders or routing domain
decisions through projection code.

Other ops exist and may be used by additional steps (see the domain contracts).

## Config posture

Current posture in the standard recipe:
- `ecology-pedology`, `ecology-biomes`, and `ecology-features` expose their
  step schemas and bound operation envelopes directly; profiles are strategy
  selections rather than a second stage-owned schema.
- `map-ecology` defines neither an author-facing configuration schema nor a `compile` callback. Its
  projection steps have no authored tuning to translate, while fixed biome projection policy stays
  beside `plot-biomes` and uses official identities from Civ7 policy.

Key contract point: each strategy owns its configuration schema, while each semantic module owns the
artifacts and model vocabulary its operations share. Cross-stage consumption does not move artifact
authority to the root domain.

Feature scoring and planning stay separate:
- Score ops produce continuous physical suitability fields. A positive score is not itself a placement command.
- Planner-local policies decide whether a suitability candidate is strong enough to become an intent.
- Reef-family habitat eligibility is reef-owned: warm reefs use warm shallow near-coast shelf water, cold reefs use colder deeper shelf/edge water, atolls use isolated warm shallow banks, and `FEATURE_LOTUS` uses warm shallow near-land water.
- Wetland-family habitat eligibility is wet-feature-owned through named substrate masks: marsh and tundra bog require hydromorphic substrate, mangrove requires intertidal coast, and oasis/watering-hole features require isolated lowland water-source substrate plus arid scoring.

## Engine projection notes (map-ecology)

The `map-ecology` stage:
- is a projection-only stage whose exact identity comes from recipe composition,
- consumes Ecology truth artifacts (biomeClassification, featureIntents.*, plotEffectPlan) and Morphology truth (topography),
- publishes biome-binding and post-Ecology feature-surface artifact evidence,
- and publishes engine effect tags (e.g., `effect:engine.biomesApplied`).

## Ground truth anchors

- Stage definitions (compile mapping, step list):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/pedology/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/biomes/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/features/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map/ecology/index.ts`
- Ecology domain composition:
  - `mods/mod-swooper-maps/src/domain/ecology/contract.ts`
  - `mods/mod-swooper-maps/src/domain/ecology/router.ts`
- Ecology module contracts, routers, operations, and artifact catalogs:
  - `mods/mod-swooper-maps/src/domain/ecology/modules/pedology/`
  - `mods/mod-swooper-maps/src/domain/ecology/modules/biomes/`
  - `mods/mod-swooper-maps/src/domain/ecology/modules/features/`
  - `mods/mod-swooper-maps/src/domain/ecology/modules/plot-effects/`
- Example step contracts (truth stage):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/pedology/steps/pedology/config.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/biomes/steps/biomes/config.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/features/steps/plan-vegetation/config.ts`
- Example step contracts (projection stage):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map/ecology/steps/plot-biomes/config.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map/ecology/steps/features-apply/config.ts`
- Effect tag registry: `mods/mod-swooper-maps/src/recipes/standard/tags.ts`
- Policy: truth vs projection: `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
- Architecture guardrails (import bans and parity gates):
  - `.habitat/blueprints/domain/require_public_domain_surfaces_in_recipes_and_maps/rule.json`
  - `.habitat/blueprints/domain-operation/require_domain_operation_contract_file_shape/rule.json`
  - `.habitat/blueprints/recipe-stage/require_recipe_stage_source_topology/rule.json`
  - `mods/mod-swooper-maps/src/recipes/standard/metrics/studies/benchmarks/earthlike-ecology.study.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/metrics/targets/ecology.ts`
