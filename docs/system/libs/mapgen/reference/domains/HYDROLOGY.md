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
- depression-conditioned drainage routing over Morphology topography,
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
- `artifact:hydrology.hydrography` (canonical drainage routing + discharge + river class snapshot)
- `artifact:hydrology.riverNetworkMetrics` (upstream area, hierarchy, mouth,
  slope, and permanence diagnostics derived from Hydrology truth)
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
- `computeDrainageRouting`
- `accumulateDischarge`
- `projectRiverNetwork`
- `planLakes`
- `computeRiverNetworkMetrics`
- `computeLandWaterBudget`
- `computeClimateDiagnostics`
- `computeCryosphereState`, `applyAlbedoFeedback`

## Config + knobs posture

Author-facing control is primarily via stage knobs (compiled at stage compile time). In the standard recipe:

- `hydrology-climate-baseline` knobs: `dryness`, `temperature`, `seasonality`, `oceanCoupling`
- `hydrology-hydrography` knobs: `riverDensity` (physical river-network classification density), `lakeiness` (sink-derived lake intent expansion)
- `hydrology-climate-refine` knobs: `dryness`, `temperature`, `cryosphere`
- `map-rivers` knobs: `navigableRiverDensity` (Civ-visible navigable river trunk projection only)

Some steps also expose flat step config surfaces for explicit overrides (e.g., seasonality posture).

## River network benchmark contract

Hydrology benchmark reports compare generated drainage truth against Earth-scale
families before projection tuning. This contract is report/diagnostic metadata,
not additional Hydrology compute truth:

- **Tile scale.** A Civ map tile is a coarse strategy-scale sample, not a
  geodetic cell. Reports must record the run dimensions and any latitude
  assumption used for tile-to-kilometer translation. Do not compare a single
  tile directly to a 30 m river pixel.
- **Visible feature floor.** Hydrology may contain hidden drainage and
  minor/headwater channel intent that is below Civ terrain visibility.
  `map-rivers` may only turn Hydrology `riverClass>=2` into
  `TERRAIN_NAVIGABLE_RIVER`; minor channels remain Hydrology truth unless a
  native metadata writer is separately proven.
- **Regime row.** Every benchmark row must name its climate/relief regime:
  `wet`, `normal`, `arid`, `mountain`, `closed`, `archipelago`, or an explicit
  extension. Arid/no-visible outcomes can be valid only when the regime row and
  metrics support that claim.
- **Observed Hydrology fields.** `artifact:hydrology.riverNetworkMetrics`
  publishes `benchmarkSummary` with land/water/lake denominators, minor/major
  river counts, river-specific permanence, low-order hierarchy, terminal
  shares, basin coverage, and routing-health counters. Reports may consume
  those values but must not reinterpret projection or runtime readback as
  Hydrology truth.
- **Stylization ledger.** Any Civ-visible exaggeration, merging, omission, or
  native-engine substitution must record: source Earth anchor, affected metric,
  reason for stylization, changed product claim, and proof gate. Silent
  stylization is a product failure.

Earth anchors for the first accepted pass:

- HydroRIVERS maps global river reaches at a coarse floor of catchment area
  `>=10 km2` or average flow `>=0.1 m3/s`; its product page reports 8.5 million
  reaches averaging 4.2 km for 35.9 million km globally:
  <https://www.hydrosheds.org/products/hydrorivers>.
- Global hydrography work cautions that the HydroRIVERS threshold is empirical,
  so local tuning must use regime families and topology oracles rather than
  treating one threshold as universal Earth truth:
  <https://www.nature.com/articles/s41597-021-00819-9>.
- GRWL records rivers `>=30 m` wide and covers more than 2.1 million km of
  visible river centerlines; use it as a visible-river floor, not as the total
  drainage network:
  <https://www.science.org/doi/10.1126/science.aat0636>.
- Non-perennial rivers are common: global modeling predicts water ceases to
  flow at least one day per year along 51-60% of river length:
  <https://pubmed.ncbi.nlm.nih.gov/34135525/>.
- HydroLAKES reports about 1.4 million lakes/reservoirs totaling 2.67 million
  km2:
  <https://www.hydrosheds.org/products/hydrolakes>.

## Engine projection notes (map-hydrology / map-rivers)

The `map-hydrology` stage:

- is `phase: "gameplay"` (projection-only),
- consumes Hydrology lake truth and projects static lake water before engine elevation,
- and must not be treated as Hydrology truth.

The `map-rivers` stage consumes Hydrology hydrography after `map-elevation` has
built engine elevation, then publishes projected navigable river terrain and
river readback evidence. This matches Civ7's terrain lifecycle: static water
before elevation, rivers after elevation.

Hydrology routing is the canonical water-movement graph. It is derived from
Morphology topography with a depression-conditioned routing surface and typed
terminals; it does not consume `artifact:morphology.routing`, which remains a
Morphology terrain-shaping proxy for existing Morphology consumers.

Hydrology river classes have distinct projection meanings:

- `riverClass` is the Hydrology-owned intent class. `0` means no channel,
  `1` means minor/headwater channel intent, and values `>=2` mean
  major/projectable channel intent. Values above `2` are reserved for future
  stream-order hierarchy and remain eligible for major-river projection.
- `riverClass=1` is minor-river intent. It remains a physics/display/planning
  surface and must not be promoted into `TERRAIN_NAVIGABLE_RIVER`.
- `riverClass>=2` is major-river intent and is the only hydrology class eligible
  for MapGen-owned navigable terrain projection. Major truth is routed trunk
  truth, not a set of isolated discharge-threshold outlet tiles.

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
generator for stock map scripts, but it is not a proven exact materializer for
MapGen-authored river truth. A 2026-06-10 same-seed live run after native
generator restoration reported 84 live `TERRAIN_NAVIGABLE_RIVER` tiles while
MapGen projected 24; resource overlap was zero, but ten live river components
had no water/lake sink and those fragments were native-generator additions.
Authored Swooper maps therefore preserve the Hydrology-selected terrain mask
directly and use terrain readback for major-river proof unless a future native
writer surface proves exact parity to Hydrology truth. The same seed after this
authored materialization change read back 25 live `TERRAIN_NAVIGABLE_RIVER`
tiles with zero resource overlap and zero no-sink terrain-river components,
while `MapRivers.numRivers` remained `0`; metadata remains a separate unsolved
writer surface. Official resources were
refreshed through `bun run refresh:data`
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
