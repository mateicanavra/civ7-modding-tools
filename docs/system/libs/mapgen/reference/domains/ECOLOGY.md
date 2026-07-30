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
and projection steps that bind those products into Civ7 engine state while emitting current
trace, metrics, and visualization evidence.

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
- `artifact:ecology.featureSuitability`
- `artifact:ecology.floodplainIntents`
- `artifact:ecology.iceIntents`
- `artifact:ecology.reefIntents`
- `artifact:ecology.wetlandIntents`
- `artifact:ecology.vegetationIntents`
- `artifact:ecology.plotEffectPlan`

Projection posture:
- `map-ecology` is projection-only: it projects biome, feature-intent, and plot-effect-plan
  artifacts into engine state, declares only the earned completions consumed downstream, and emits
  invocation-local projection and engine-observation evidence through trace, metrics, and
  visualization facets.

## Key artifacts

Ecology's semantic data products are owned by the module that produces them:
- Pedology: `mods/mod-swooper-maps/src/domain/ecology/modules/pedology/artifacts/index.ts`
- Biomes: `mods/mod-swooper-maps/src/domain/ecology/modules/biomes/artifacts/index.ts`
- Features: `mods/mod-swooper-maps/src/domain/ecology/modules/features/artifacts/index.ts`
- Plot effects: `mods/mod-swooper-maps/src/domain/ecology/modules/plot-effects/artifacts/index.ts`

There is deliberately no root Ecology artifact aggregate. Steps import the exact producing module's
catalog, keeping artifact ownership visible and preventing the root domain from becoming a second
discovery surface.

The projection stage does not define artifacts. Biome-binding outcomes and feature-application
counts are step metrics and trace events. The projected biome grid is derived from the selected
bindings and applied writes, while the feature grid is current engine observation captured after
terrain validation; both remain invocation-local visualization evidence. Downstream logic that
needs current Civ7 state reads it through its declared adapter surface rather than consuming a
stale snapshot.

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
  at `map-ecology` stage scope under `model/policy/` and uses official identities from Civ7 policy.

Key contract point: each strategy owns its configuration schema, while each semantic module owns the
artifacts and model vocabulary its operations share. Cross-stage consumption does not move artifact
authority to the root domain.

Feature scoring and planning stay separate:
- Score ops produce continuous physical suitability fields. A positive score is not itself a placement command.
- Planner-local policies decide whether a suitability candidate is strong enough to become an intent.
- Floodplain scoring combines admitted river tier, alluvial substrate, local relief, fertility, and
  biome identity into the ten family score fields; the floodplain planner separately chooses which
  scored identity, if any, becomes intent.
- Reef-family habitat eligibility is reef-owned: warm reefs use warm shallow near-coast shelf water, cold reefs use colder deeper shelf/edge water, atolls use isolated warm shallow banks, and `FEATURE_LOTUS` uses warm shallow near-land water.
- Wetland-family habitat eligibility is wet-feature-owned through named substrate masks: marsh and tundra bog require hydromorphic substrate, mangrove requires intertidal coast, and oasis/watering-hole features require isolated lowland water-source substrate plus arid scoring.

## Engine projection notes (map-ecology)

The `map-ecology` stage:
- is a projection-only stage whose exact identity comes from recipe composition,
- consumes Ecology truth artifacts (biome classification, feature intents, and plot effects) plus
  Morphology topography,
- emits biome-binding and post-Ecology feature-surface evidence through trace, metrics, and visualization facets,
- and provides `completion:engine.biomes-applied` before feature viability reads current biomes,
  then `completion:engine.features-applied` for downstream wonder planning.

## Ground truth anchors

- Stage definitions (compile mapping, step list):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/pedology/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/biomes/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/features/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/projection/index.ts`
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
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/projection/steps/plot-biomes/config.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/projection/steps/features-apply/config.ts`
- Stage-owned biome projection policy:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/projection/model/policy/biome-projection.ts`
- Completion catalog: `mods/mod-swooper-maps/src/recipes/standard/completions.ts`
- Policy: truth vs projection: `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
- Architecture guardrails (import bans and parity gates):
  - `.habitat/blueprints/domain/require_public_domain_surfaces_in_recipes_and_maps/rule.json`
  - `.habitat/blueprints/domain-operation/require_domain_operation_contract_file_shape/rule.json`
  - `.habitat/blueprints/recipe-stage/require_recipe_stage_source_topology/rule.json`
  - `mods/mod-swooper-maps/src/recipes/standard/metrics/studies/benchmarks/earthlike-ecology.study.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/metrics/targets/ecology.ts`
