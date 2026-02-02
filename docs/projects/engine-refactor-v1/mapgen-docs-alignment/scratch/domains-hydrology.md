<toc>
  <item id="local-plan" title="Local plan"/>
  <item id="contracts" title="Contracts + artifacts"/>
  <item id="code-sources" title="Code sources"/>
  <item id="doc-sources" title="Doc/spec sources"/>
  <item id="drift" title="Drift + risks"/>
</toc>

# Scratch: MapGen domain — Hydrology

## Questions
- Domain contract surface (inputs/outputs)?
- What stage/step(s) does Hydrology own in the standard recipe?
- What cross-domain dependencies exist (and are they intended)?

## Local plan (this pass)
1. Treat `docs/system/libs/mapgen/hydrology-api.md` as the code-facing contract; verify it matches the current ops + artifacts.
2. Confirm stage boundaries and “knobs-last” posture (baseline/hydrography/refine + map-hydrology projection).
3. Enumerate op contracts under `mods/mod-swooper-maps/src/domain/hydrology/ops/*/contract.ts` and confirm step ownership boundaries.
4. Record any “truth vs projection” splits (Hydrology truth artifacts vs engine-facing projection steps).

## Docs found

## Contracts + artifacts (standard recipe)

Hydrology “truth” stages:

- `hydrology-climate-baseline`
  - Stage module: `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/index.ts`
  - Knobs: `dryness`, `temperature`, `seasonality`, `oceanCoupling`
  - Step: `climate-baseline`
    - Requires artifacts: `artifact:morphology.topography`
    - Provides artifacts:
      - `artifact:climateField` (buffer handle: rainfall/humidity)
      - `artifact:hydrology.climateSeasonality`
      - `artifact:hydrology._internal.windField`
    - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/steps/climateBaseline.contract.ts`

- `hydrology-hydrography`
  - Stage module: `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/index.ts`
  - Knobs: `riverDensity`
  - Step: `rivers`
    - Requires artifacts: `artifact:climateField`, `artifact:morphology.topography`
    - Provides artifacts: `artifact:hydrology.hydrography`
    - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/steps/rivers.contract.ts`

- `hydrology-climate-refine`
  - Stage module: `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/index.ts`
  - Knobs: `dryness`, `temperature`, `cryosphere`
  - Step: `climate-refine`
    - Requires artifacts:
      - `artifact:morphology.topography`
      - `artifact:climateField`
      - `artifact:hydrology._internal.windField`
      - `artifact:hydrology.hydrography`
    - Provides artifacts:
      - `artifact:hydrology.climateIndices`
      - `artifact:hydrology.cryosphere`
      - `artifact:hydrology.climateDiagnostics`
    - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/steps/climateRefine.contract.ts`

Gameplay projection stage:

- `map-hydrology`
  - Stage module: `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/index.ts`
  - Knobs: `lakeiness`, `riverDensity` (explicitly “projection only”)
  - Steps:
    - `lakes`
      - Phase: `gameplay`
      - Requires artifacts: `artifact:morphology.topography`, `artifact:hydrology.hydrography`
      - Provides: —
      - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/lakes.contract.ts`
    - `plot-rivers`
      - Phase: `gameplay`
      - Requires effect tags: `effect:map.elevationBuilt` (from `map-morphology`)
      - Provides effect tags: `effect:engine.riversModeled`
      - Requires artifacts: `artifact:hydrology.hydrography`
      - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/plotRivers.contract.ts`

## Code touchpoints
- Domain implementation (mod-owned): `mods/mod-swooper-maps/src/domain/hydrology/*`
- Domain ops (compile/runtime): `mods/mod-swooper-maps/src/domain/hydrology/ops.ts`
- Standard recipe stages:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/index.ts`
- Hydrology artifacts:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/artifacts.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/artifacts.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/artifacts.ts`

## Notes
- Standard recipe ordering (stages): `hydrology-climate-baseline` → `hydrology-hydrography` → `hydrology-climate-refine` → `map-hydrology`.
- Notable artifact ids (from stage artifact modules):
  - `artifact:climateField`
  - `artifact:hydrology.climateSeasonality`
  - `artifact:hydrology._internal.windField`
  - `artifact:hydrology.hydrography`
  - `artifact:hydrology.climateIndices`
  - `artifact:hydrology.cryosphere`
  - `artifact:hydrology.climateDiagnostics`

## Doc/spec sources (authority)

- Code-facing Hydrology contract doc: `docs/system/libs/mapgen/hydrology-api.md`
- Conceptual domain doc: `docs/system/libs/mapgen/hydrology.md`
- Hydrology river artifact contract (deferral): ADR-ER1-015: `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-015-hydrology-river-product-is-artifact-riveradjacency-for-now-def-005-defers-artifact-rivergraph.md`

## Drift + risks

- Hydrology uses multiple **buffer-handle artifacts** (`artifact:climateField`, `artifact:hydrology._internal.windField`) whose payloads are typed arrays and may be mutated in-place after publish by later steps. Docs must teach the “write-once publish, mutable underlying buffers” exception explicitly.
- The truth vs projection split is explicit in docs/comments and should be a first-class concept:
  - Truth: `artifact:hydrology.*` artifacts.
  - Projection: `map-hydrology` engine-facing steps (lakes/rivers).
