<toc>
  <item id="local-plan" title="Local plan"/>
  <item id="contracts" title="Contracts + artifacts"/>
  <item id="code-sources" title="Code sources"/>
  <item id="doc-sources" title="Doc/spec sources"/>
  <item id="drift" title="Drift + risks"/>
</toc>

# Scratch: MapGen domain — Morphology

## Questions
- Domain contract surface (inputs/outputs)?
- What stage/step(s) does Morphology own in the standard recipe?
- What cross-domain dependencies exist (and are they intended)?

## Local plan (this pass)
1. Confirm per-stage public config + knobs posture (pre/mid/post + map-morphology stages).
2. Enumerate artifacts + “buffer handles” (topography, routing, substrate, landmasses, coastline metrics).
3. Cross-check the conceptual doc posture:
   - `docs/system/libs/mapgen/morphology.md` (explicitly not Phase 2 contract authority)
   - Phase 2 specs referenced from that doc.
4. Note any mismatches between “aspirational morphology” docs and the current staged implementation.

## Docs found

## Contracts + artifacts (standard recipe)

Stages + step contracts (Morphology “truth” stages):

- `morphology-pre`
  - Stage module: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/index.ts`
  - Knobs: `seaLevel` (applies last)
  - Step: `landmass-plates`
    - Requires artifacts: `artifact:foundation.plates`, `artifact:foundation.crustTiles`
    - Provides artifacts: `artifact:morphology.topography`, `artifact:morphology.substrate`
    - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/steps/landmassPlates.contract.ts`

- `morphology-mid`
  - Stage module: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/index.ts`
  - Knobs: `erosion`, `coastRuggedness` (apply last)
  - Steps (order): `rugged-coasts` → `routing` → `geomorphology`
    - `rugged-coasts`
      - Requires artifacts: `artifact:foundation.plates`, `artifact:morphology.topography`
      - Provides artifacts: `artifact:morphology.coastlineMetrics`
      - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/ruggedCoasts.contract.ts`
    - `routing`
      - Requires artifacts: `artifact:morphology.topography`
      - Provides artifacts: `artifact:morphology.routing`
      - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/routing.contract.ts`
    - `geomorphology`
      - Requires artifacts:
        - `artifact:morphology.topography`
        - `artifact:morphology.routing`
        - `artifact:morphology.substrate`
      - Provides artifacts: —
      - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/geomorphology.contract.ts`

- `morphology-post`
  - Stage module: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/index.ts`
  - Knobs: `volcanism` (applies last)
  - Steps (order): `islands` → `volcanoes` → `landmasses`
    - `islands`
      - Requires artifacts: `artifact:foundation.plates`, `artifact:morphology.topography`
      - Provides artifacts: —
      - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/islands.contract.ts`
    - `volcanoes`
      - Requires artifacts: `artifact:foundation.plates`, `artifact:morphology.topography`
      - Provides artifacts: `artifact:morphology.volcanoes`
      - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/volcanoes.contract.ts`
    - `landmasses`
      - Requires artifacts: `artifact:morphology.topography`
      - Provides artifacts: `artifact:morphology.landmasses`
      - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/landmasses.contract.ts`

Gameplay projection stage:

- `map-morphology`
  - Stage module: `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/index.ts`
  - Phase: `gameplay`
  - Provides effect tags used by downstream gameplay steps:
    - `effect:map.coastsPlotted`
    - `effect:map.continentsPlotted`
    - `effect:map.mountainsPlotted`
    - `effect:map.volcanoesPlotted`
    - `effect:map.elevationBuilt`
  - Step contracts:
    - `plot-coasts`: provides `effect:map.coastsPlotted`, requires `artifact:morphology.topography`, `artifact:morphology.coastlineMetrics`
    - `plot-continents`: requires `effect:map.coastsPlotted`, provides `effect:map.continentsPlotted`
    - `plot-mountains`: requires `effect:map.continentsPlotted`, provides `effect:map.mountainsPlotted`, requires `artifact:foundation.plates`, `artifact:morphology.topography`
    - `plot-volcanoes`: requires `effect:map.continentsPlotted`, provides `effect:map.volcanoesPlotted`, requires `artifact:morphology.topography`, `artifact:morphology.volcanoes`
    - `build-elevation`: requires `effect:map.mountainsPlotted`, `effect:map.volcanoesPlotted`, provides `effect:map.elevationBuilt`, requires `artifact:morphology.topography`
  - Contracts live in `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/*.contract.ts`

## Code touchpoints
- Domain implementation (mod-owned): `mods/mod-swooper-maps/src/domain/morphology/*`
- Domain ops (compile/runtime): `mods/mod-swooper-maps/src/domain/morphology/ops.ts`
- Standard recipe stages:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/index.ts`
- Morphology artifacts (partial): `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/artifacts.ts`

## Notes
- Standard recipe ordering (stages): `morphology-pre` → `morphology-mid` → `morphology-post` → `map-morphology` (see `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`).
- Notable artifact ids (from `morphology-pre/artifacts.ts`):
  - `artifact:morphology.topography`
  - `artifact:morphology.routing`
  - `artifact:morphology.substrate`
  - `artifact:morphology.coastlineMetrics`
  - `artifact:morphology.landmasses`
  - `artifact:morphology.volcanoes`

## Doc/spec sources (authority)

- Domain conceptual doc: `docs/system/libs/mapgen/morphology.md`
  - This doc explicitly points to Phase 2 specs as contract authority; treat it as conceptual posture.
- Morphology Phase 2 specs (linked from the conceptual doc):
  - `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/plans/morphology/spec/PHASE-2-CORE-MODEL-AND-PIPELINE.md`
  - `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/plans/morphology/spec/PHASE-2-CONTRACTS.md`

## Drift + risks

- The “truth vs projection” split is real and should be taught explicitly:
  - Morphology stages publish truth artifacts (`artifact:morphology.*`).
  - `map-morphology` publishes effect tags and writes engine-facing surfaces (gameplay projection).
