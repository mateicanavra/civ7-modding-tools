<toc>
  <item id="purpose" title="Purpose"/>
  <item id="stages" title="Stages (standard recipe)"/>
  <item id="contract" title="Contract (requires/provides)"/>
  <item id="artifacts" title="Key artifacts"/>
  <item id="ops" title="Ops surface"/>
  <item id="config" title="Config + knobs posture"/>
  <item id="projection" title="Engine projection notes (map-hydrology / map-rivers)"/>
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

Hydrology also feeds engine-facing projection steps, which are explicitly
**projection-only**: `map-hydrology` stamps accepted lake water before engine
elevation, and `map-rivers` materializes selected navigable river terrain after
elevation.

## Stages (standard recipe)

Truth stages:

- `hydrology-climate-baseline`
- `hydrology-hydrography`
- `hydrology-climate-refine`

Projection stage:

- `map-hydrology`
- `map-rivers`

See: [`docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`](/system/libs/mapgen/reference/STANDARD-RECIPE.md).

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
- `planLakes`
- `computeLandWaterBudget`
- `computeClimateDiagnostics`
- `computeCryosphereState`, `applyAlbedoFeedback`

## Config + knobs posture

Author-facing control is primarily via stage knobs (compiled at stage compile time). In the standard recipe:

- `hydrology-climate-baseline` knobs: `dryness`, `temperature`, `seasonality`, `oceanCoupling`
- `hydrology-hydrography` knobs: `riverDensity` (physical river-network projection thresholds), `lakeiness` (sink-derived lake intent expansion)
- `hydrology-climate-refine` knobs: `dryness`, `temperature`, `cryosphere`
- `map-rivers` knobs: `navigableRiverDensity` (Civ-visible navigable river trunk projection only; `riverDensity` is accepted as a legacy alias)

Some steps also expose flat step config surfaces for explicit overrides (e.g., seasonality posture).

## Engine projection notes (map-hydrology / map-rivers)

The `map-hydrology` stage:

- is `phase: "gameplay"` (projection-only),
- consumes Hydrology lake truth and projects static lake water before engine elevation,
- and must not be treated as Hydrology truth.

The `map-rivers` stage consumes Hydrology hydrography after `map-elevation` has
built engine elevation, then publishes projected navigable river terrain and
river readback evidence. This matches Civ7's terrain lifecycle: static water
before elevation, rivers after elevation.

Hydrology river classes have distinct projection meanings:

- `riverClass=1` is minor-river intent. It remains a physics/display/planning
  surface and must not be promoted into `TERRAIN_NAVIGABLE_RIVER`.
- `riverClass>=2` is major-river intent and is the only hydrology class eligible
  for MapGen-owned navigable terrain projection.

Civ7 river proof has two distinct surfaces:

- `TERRAIN_NAVIGABLE_RIVER` is a terrain row and can exist without Civ river
  metadata.
- `GameplayMap.getRiverType`, `GameplayMap.isRiver`, and
  `GameplayMap.isNavigableRiver` are river metadata/readback surfaces.

Live runtime evidence on 2026-06-09 reported `RiverTypes.NO_RIVER=-1`,
`RIVER_MINOR=0`, and `RIVER_NAVIGABLE=1`; those metadata values are cataloged in
the generated `@civ7/map-policy` table as `CIV7_BROWSER_TABLES_V0.riverTypes`,
re-exported by `CIV7_RIVER_TYPES_V0`, and generated into `@civ7/types`. A
same-run Studio/Civ proof
(`studio-run-in-game-mq6c38rf-n2p`) matched projected navigable terrain to live
`TERRAIN_NAVIGABLE_RIVER` exactly (`6/6`, zero terrain mismatches), while
`GameplayMap` still reported `NO_RIVER` metadata for those tiles. Therefore
terrain-row visibility is the supported proof of MapGen-owned major-river
stamping; minor or navigable river metadata is a separate readback/writer
surface. `TerrainBuilder.modelRivers` remains the official high-level engine
generator. Official resources were refreshed through `bun run refresh:data`
against the installed Steam app on 2026-06-09 and stayed clean at snapshot
`fbc38ef`; spot checks of the installed app matched that snapshot for
`continents.js`, `archipelago.js`, tooltip helpers, `terrain.xml`, and
`unit-movement.xml`. Both the installed app and refreshed resources show map
scripts calling `modelRivers(...)`, `defineNamedRivers()`, and
`storeWaterData()`, with no public `setRiverValidationValues` callsite. The native
`TerrainBuilder.setRiverValidationValues` hook was probed in the disposable
`studio-run-in-game-mq6c38rf-n2p` session; it returned `undefined` and left all
river metadata counts unchanged (`river=0`, `navigableRiver=0`, `minorRiver=0`).
Treat that hook as rejected for production minor-river authoring until a
different writer surface is discovered and proven.

## Ground truth anchors

- Stage definitions (knobs + step list):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/index.ts`
- Step contracts (truth stages):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/steps/climateBaseline.contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/steps/rivers.contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/steps/climateRefine.contract.ts`
- Step contracts (projection stage):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/lakes.contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/plotRivers.contract.ts`
- Tag registry (effect tags, current `field:*` deps): `mods/mod-swooper-maps/src/recipes/standard/tags.ts`
- Policy: truth vs projection: `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`

## Open questions

- `artifact:hydrology._internal.windField` is currently tagged as internal; do we want a stable public wind artifact tag (or should downstream consumers continue to rely on derived outputs only)?
