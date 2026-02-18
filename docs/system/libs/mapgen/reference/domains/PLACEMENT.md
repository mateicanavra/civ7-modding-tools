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

Placement provides:
- `effect:engine.placementApplied` (verified effect tag)

Placement artifacts:
- Provides `artifact:placementInputs` (derived from config + placement ops)
- Provides deterministic plan artifacts: `artifact:placement.resourcePlan`, `artifact:placement.naturalWonderPlan`, `artifact:placement.discoveryPlan`
- Requires `artifact:placementInputs` and `artifact:map.landmassRegionSlotByTile` for final placement
- Provides `artifact:placementOutputs` (verification/debug surface)

Runtime semantics:
- Placement apply is fail-hard.
- Natural wonders still use deterministic full-stamp-or-fail semantics.
- Discoveries/resources run through official Civ generators; generator invocation failures and invalid placement metrics abort the placement step with explicit context.
- Owned deterministic resource planning artifacts are retained for diagnostics/parity work but are non-primary at runtime and currently parity-incomplete for age/eligibility behavior.

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

## Config posture

Placement stage config is currently minimal:
- placement inputs are derived from runtime config and placement ops,
- resource/discovery planning consumes adapter-owned manual catalogs (`packages/civ7-adapter/src/manual-catalogs`) that are verified against the official tables via `scripts/placement/verify-manual-catalogs.ts`, so there are no runtime GameInfo/Database lookups for these catalogs,
- runtime apply uses official Civ generators for discovery/resources and deterministic stamping for natural wonders.

## Ground truth anchors

- Target absorption posture (Gameplay owns Placement): `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/plans/gameplay/APPENDIX-SCOPE-AND-ABSORPTION.md`
- Stage definition: `mods/mod-swooper-maps/src/recipes/standard/stages/placement/index.ts`
- Step contracts:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/derive-placement-inputs/contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/plot-landmass-regions/contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/contract.ts`
- Placement artifacts: `mods/mod-swooper-maps/src/recipes/standard/stages/placement/artifacts.ts`
- Projection artifacts (inputs): `mods/mod-swooper-maps/src/recipes/standard/map-artifacts.ts`
- Tag registry (effect tags): `mods/mod-swooper-maps/src/recipes/standard/tags.ts`

## Open questions

- Which placement outputs should be considered part of a stable contract surface vs ad-hoc debugging counters?
