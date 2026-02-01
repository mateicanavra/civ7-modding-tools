<toc>
  <item id="purpose" title="Purpose"/>
  <item id="stages" title="Stages (standard recipe)"/>
  <item id="contract" title="Contract (requires/provides)"/>
  <item id="artifacts" title="Key artifacts"/>
  <item id="ops" title="Ops surface"/>
  <item id="config" title="Config + knobs posture"/>
  <item id="projection" title="Engine projection notes (map-hydrology)"/>
  <item id="anchors" title="Ground truth anchors"/>
  <item id="open-questions" title="Open questions"/>
</toc>

# Hydrology domain

## Purpose

Hydrology produces climate + water-cycle truth products for downstream consumption:
- baseline climate field (rainfall/humidity),
- winds + moisture transport state,
- discharge/hydrography truth snapshots,
- refined indices (aridity/freeze/etc) and optional cryosphere products,
and related diagnostics.

Hydrology also owns engine-facing projection steps (rivers/lakes) via `map-hydrology`, which are explicitly **projection-only**.

## Stages (standard recipe)

Truth stages:
- `hydrology-climate-baseline`
- `hydrology-hydrography`
- `hydrology-climate-refine`

Projection stage:
- `map-hydrology`

See: `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`.

## Contract (requires/provides)

Hydrology requires:
- Morphology topography truth.

Hydrology provides (truth artifacts):
- `artifact:climateField` (baseline rainfall/humidity)
- `artifact:hydrology.climateSeasonality` (amplitude surface)
- `artifact:hydrology.hydrography` (discharge + river class snapshot)
- `artifact:hydrology.climateIndices` (advisory indices for downstream consumption)
- `artifact:hydrology.cryosphere` (cryosphere products; neutralized when knob disables it)
- `artifact:hydrology.climateDiagnostics` (diagnostic projections; not internal truth)

## Key artifacts

Hydrology artifacts are authored by the standard recipe (content-owned):
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/artifacts.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/artifacts.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/artifacts.ts`

## Ops surface

Hydrology domain ops are bound by step contracts. In the standard recipe, Hydrology uses op contracts such as:
- `computeRadiativeForcing`
- `computeThermalState`
- `computeAtmosphericCirculation`
- `computeOceanSurfaceCurrents`
- `computeEvaporationSources`
- `transportMoisture`
- `computePrecipitation` (baseline + refine strategies)
- `accumulateDischarge`
- `projectRiverNetwork`
- `computeLandWaterBudget`
- `computeClimateDiagnostics`
- `computeCryosphereState`, `applyAlbedoFeedback`

## Config + knobs posture

Author-facing control is primarily via stage knobs (compiled at stage compile time). In the standard recipe:

- `hydrology-climate-baseline` knobs: `dryness`, `temperature`, `seasonality`, `oceanCoupling`
- `hydrology-hydrography` knobs: `riverDensity` (projection thresholds for hydrography)
- `hydrology-climate-refine` knobs: `dryness`, `temperature`, `cryosphere`
- `map-hydrology` knobs: `lakeiness`, `riverDensity` (engine projection only)

Some steps also expose “advanced” config surfaces for explicit overrides (e.g., seasonality posture).

## Engine projection notes (map-hydrology)

The `map-hydrology` stage:
- is `phase: "gameplay"` (projection-only),
- consumes Hydrology truth artifacts (hydrography) plus Morphology truth (topography),
- publishes effect tags like `effect:engine.riversModeled`,
- and must not be treated as Hydrology truth.

## Ground truth anchors

- Stage definitions (knobs + step list):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/index.ts`
- Step contracts (truth stages):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/steps/climateBaseline.contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/steps/rivers.contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/steps/climateRefine.contract.ts`
- Step contracts (projection stage):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/lakes.contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/plotRivers.contract.ts`
- Tag registry (effect tags, current `field:*` deps): `mods/mod-swooper-maps/src/recipes/standard/tags.ts`
- Policy: truth vs projection: `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`

## Open questions

- `artifact:hydrology._internal.windField` is currently tagged as internal; do we want a stable public wind artifact tag (or should downstream consumers continue to rely on derived outputs only)?

