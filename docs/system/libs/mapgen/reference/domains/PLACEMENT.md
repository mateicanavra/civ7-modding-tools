<toc>
  <item id="purpose" title="Purpose"/>
  <item id="stages" title="Stages (standard recipe)"/>
  <item id="contract" title="Contract (requires/provides)"/>
  <item id="artifacts" title="Key artifacts"/>
  <item id="ops" title="Ops surface"/>
  <item id="config" title="Config posture"/>
  <item id="anchors" title="Ground truth anchors"/>
  <item id="open-questions" title="Open questions"/>
</toc>

# Placement domain

## Purpose

Placement is legacy naming for the **Gameplay** domain’s “placement phase”: the pipeline boundary where “map content” becomes “gameplay outcomes”:

- assign starts,
- place wonders/resources/discoveries,
- and publish placement outputs for verification and debugging.

Placement is intentionally **projection/engine-facing**: it depends on prior projection steps (engine rivers/features) and uses engine adapters to apply gameplay outcomes.

Target posture: Gameplay absorbs Placement. See:

- [`docs/system/libs/mapgen/reference/domains/GAMEPLAY.md`](/system/libs/mapgen/reference/domains/GAMEPLAY.md)

## Stages (standard recipe)

Standard recipe stage(s):

- `placement`

See: [`docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`](/system/libs/mapgen/reference/STANDARD-RECIPE.md).

## Contract (requires/provides)

Placement requires (dependency tags):

- `effect:engine.riversModeled` (from `map-hydrology`)
- `effect:engine.featuresApplied` (from `map-ecology`)
- `effect:map.landmassRegionsPlotted` (from `plot-landmass-regions`)
- `effect:placement.naturalWondersPlaced` (from `place-natural-wonders`, required by final placement)

Placement provides:

- `effect:placement.naturalWondersPlaced` (natural-wonder product boundary)
- `effect:engine.placementApplied` (verified effect tag)

Placement artifacts:

- Provides `artifact:placementInputs` (derived from config + placement ops)
- Provides deterministic plan artifacts: `artifact:placement.resourcePlan`, `artifact:placement.naturalWonderPlan`, `artifact:placement.discoveryPlan`
- Provides `artifact:placement.naturalWonderPlacement` after all planned natural wonders stamp successfully
- Requires `artifact:placementInputs`, `artifact:placement.naturalWonderPlacement`, and `artifact:map.landmassRegionSlotByTile` for final placement
- Provides `artifact:placementOutputs` (verification/debug surface)

Runtime semantics:

- Placement apply is fail-hard.
- Natural wonders use deterministic full-stamp-or-fail semantics in their own product/effect step.
- Resources and discoveries are deterministic plan artifacts materialized through typed adapter intent APIs.
- Resource/discovery placement publishes typed outcome artifacts; typed rejections are auditable, resource readback mismatches are fail-hard, and aggregate official-generator count equality is not a contract gate.
- Terrain validation, area recalculation, water cache storage, landmass-region restamping, and fertility recalculation remain transactional inside final placement because no independent consumer currently exists.

## Key artifacts

Placement artifacts are authored by the standard recipe:

- `mods/mod-swooper-maps/src/recipes/standard/stages/placement/artifacts.ts`

Placement also depends on gameplay-owned projection artifacts:

- `mods/mod-swooper-maps/src/recipes/standard/map-artifacts.ts`

## Ops surface

Placement domain ops used by the standard recipe:

- `planWonders`
- `planFloodplains`
- `planNaturalWonders`
- `planDiscoveries`
- `planResources`
- `planStarts`

These ops produce placement plans/inputs which are then applied in the placement step.

Natural-wonder placement is the first promoted product boundary: the plan
artifact is materialized by `place-natural-wonders`, and final placement
requires its effect/artifact before continuing. Resource and discovery
reconciliation remains in final placement but publishes typed outcomes instead
of treating official generator output as accepted truth.

## Config posture

Placement stage config is currently minimal:

- placement inputs are derived from runtime config and placement ops,
- resource/discovery planning consumes adapter-owned manual catalogs (`packages/civ7-adapter/src/manual-catalogs`) that are verified against the official tables via `scripts/placement/verify-manual-catalogs.ts`, so there are no runtime GameInfo/Database lookups for these catalogs,
- runtime apply uses typed adapter intent materialization for discovery/resources and deterministic stamping for natural wonders.

## Ground truth anchors

- Target absorption posture (Gameplay owns Placement): `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/plans/gameplay/APPENDIX-SCOPE-AND-ABSORPTION.md`
- Stage definition: `mods/mod-swooper-maps/src/recipes/standard/stages/placement/index.ts`
- Step contracts:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/derive-placement-inputs/contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/plot-landmass-regions/contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/place-natural-wonders/contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/contract.ts`
- Placement artifacts: `mods/mod-swooper-maps/src/recipes/standard/stages/placement/artifacts.ts`
- Projection artifacts (inputs): `mods/mod-swooper-maps/src/recipes/standard/map-artifacts.ts`
- Tag registry (effect tags): `mods/mod-swooper-maps/src/recipes/standard/tags.ts`

## Open questions

- Which placement outputs should be considered part of a stable contract surface vs ad-hoc debugging counters?
