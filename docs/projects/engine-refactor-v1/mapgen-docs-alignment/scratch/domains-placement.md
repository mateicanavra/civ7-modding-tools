<toc>
  <item id="local-plan" title="Local plan"/>
  <item id="contracts" title="Contracts + artifacts"/>
  <item id="code-sources" title="Code sources"/>
  <item id="doc-sources" title="Doc/spec sources"/>
  <item id="drift" title="Drift + risks"/>
</toc>

# Scratch: MapGen domain — Placement

## Questions
- Domain contract surface (inputs/outputs)?
- What stage/step(s) does Placement own in the standard recipe?
- What cross-domain dependencies exist (and are they intended)?

## Local plan (this pass)
1. Confirm stage boundary + artifact shapes (`placementInputs` and `placementOutputs`).
2. Reconcile “decision vs field mutation” posture in `docs/system/libs/mapgen/placement.md` with current step implementations.
3. Cross-check engine-refactor-v1 placement ADRs against current reality (especially effects and verification contracts).
4. Note any “engine-coupled” placement calls that must be treated as adapters/effects in docs.

## Docs found

## Contracts + artifacts (standard recipe)

Stage module:
- `mods/mod-swooper-maps/src/recipes/standard/stages/placement/index.ts`
  - Stage id: `placement`
  - Steps (order): `derive-placement-inputs` → `plot-landmass-regions` → `placement`

Artifacts:
- `artifact:placementInputs` and `artifact:placementOutputs`
  - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/placement/artifacts.ts`

Step contracts:
- `derive-placement-inputs`
  - Phase: `placement`
  - Requires effect tags:
    - `effect:engine.riversModeled` (from `map-hydrology`)
    - `effect:engine.featuresApplied` (from `map-ecology`)
  - Provides artifacts: `artifact:placementInputs`
  - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/derive-placement-inputs/contract.ts`
- `plot-landmass-regions`
  - Phase: `gameplay`
  - Requires artifacts: `artifact:morphology.topography`, `artifact:morphology.landmasses`
  - Provides effect tags: `effect:map.landmassRegionsPlotted`
  - Provides artifacts:
    - `artifact:map.projectionMeta`
    - `artifact:map.landmassRegionSlotByTile`
  - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/plot-landmass-regions/contract.ts`
- `placement`
  - Phase: `placement`
  - Requires effect tags: `effect:map.landmassRegionsPlotted`
  - Provides effect tags: `effect:engine.placementApplied`
  - Requires artifacts:
    - `artifact:placementInputs`
    - `artifact:map.landmassRegionSlotByTile`
  - Provides artifacts: `artifact:placementOutputs`
  - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/contract.ts`

Verification posture:
- Some effect tags are “verified” by the adapter after the step completes (not just “logically satisfied”):
  - `mods/mod-swooper-maps/src/recipes/standard/tags.ts` uses `context.adapter.verifyEffect(...)` for verified tags.
  - `effect:engine.placementApplied` has a custom satisfies function that checks `artifact:placementOutputs` consistency.

## Code touchpoints
- Domain implementation (mod-owned): `mods/mod-swooper-maps/src/domain/placement/*`
- Domain ops (compile/runtime): `mods/mod-swooper-maps/src/domain/placement/ops.ts`
- Standard recipe stage: `mods/mod-swooper-maps/src/recipes/standard/stages/placement/index.ts`
- Placement artifacts: `mods/mod-swooper-maps/src/recipes/standard/stages/placement/artifacts.ts`

## Notes
- Standard recipe ordering: `placement` stage is last (see `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`).
- Notable artifact ids:
  - `artifact:placementInputs`
  - `artifact:placementOutputs`

## Doc/spec sources (authority)

- Domain conceptual doc: `docs/system/libs/mapgen/placement.md`
- Placement contracts + verification intent (target posture):
  - ADR-ER1-011: `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-011-placement-consumes-explicit-artifact-placementinputs-v1-implementation-deferred-per-def-006.md`
  - ADR-ER1-020: `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-020-effect-engine-placementapplied-is-verified-via-a-minimal-ts-owned-artifact-placementoutputs-v1.md`

## Drift + risks

- Placement currently mixes `phase: gameplay` (`plot-landmass-regions`) inside the `placement` stage for practical reasons. Canonical docs should acknowledge this as an *engineering choice* (projection helpers) so phase ≠ stage isn’t surprising.
