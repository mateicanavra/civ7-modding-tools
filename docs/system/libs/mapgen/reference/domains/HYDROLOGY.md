<toc>
  <item id="purpose" title="Purpose"/>
  <item id="stages" title="Stages (standard recipe)"/>
  <item id="contract" title="Contract (requires/provides)"/>
  <item id="artifacts" title="Key artifacts"/>
  <item id="ops" title="Ops surface"/>
  <item id="config" title="Config + knobs posture"/>
  <item id="river-network-benchmark-contract" title="River network benchmark contract"/>
  <item id="projection" title="Engine projection notes (map-hydrology / map-rivers)"/>
  <item id="anchors" title="Ground truth anchors"/>
  <item id="open-questions" title="Open questions"/>
</toc>

# Hydrology domain

## Purpose

Hydrology produces climate and water-cycle products for downstream consumption:

- baseline and final-refined climate fields (rainfall/humidity),
- atmospheric wind and moisture-transport state,
- depression-conditioned drainage routing over Morphology topography,
- discharge and hydrography evidence,
- refined terrestrial indices (effective moisture, aridity, and freeze) and optional cryosphere products,
  and related diagnostics.

Hydrology also feeds engine-facing projection steps, which are explicitly
**projection-only**: `map-hydrology` materializes final-refined rainfall and
accepted lake water before engine elevation, and `map-rivers` materializes
selected navigable river terrain after elevation.

## Stages (standard recipe)

Physics stages:

- `hydrology-climate-baseline`
- `hydrology-hydrography`
- `hydrology-climate-refine`

Projection stage:

- `map-hydrology`
- `map-rivers`

See: [`docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`](/system/libs/mapgen/reference/STANDARD-RECIPE.md).

## Contract (requires/provides)

Hydrology requires:

- Morphology topography evidence.

Hydrology provides:

- `artifact:hydrology.baselineClimateField` (annual-mean rainfall/humidity used by routing and refinement)
- `artifact:hydrology.climateField` (final-refined rainfall/humidity used by Ecology and engine projection)
- `artifact:hydrology.hydrography` (canonical drainage routing + discharge + river class snapshot)
- `artifact:hydrology.riverNetwork` (upstream area, hierarchy, mouth, slope,
  and permanence fields consumed by river projection)
- `artifact:map.rivers.projectedNavigableRivers` (stable runtime id for the
  immutable Hydrology hydrography module's Civ7-projectable river selection;
  `map.rivers` identifies the product lane, not stage catalog ownership, and
  mutable engine readback is not retained)
- `artifact:hydrology.climateIndices` (advisory indices for downstream consumption)
- `artifact:hydrology.cryosphere` (cryosphere products; neutralized when knob disables it)

## Key artifacts

Hydrology's semantic products are cataloged by their owning module:

- `modules/climate/artifacts`: baseline/final climate, indices, and winds,
- `modules/cryosphere/artifacts`: snow, sea-ice, albedo, and frozen-ground state,
- `modules/hydrography/artifacts`: drainage, river-network, projection-ready lake
  intent, and immutable Civ7-projectable river intent.

The `modules/ocean` branch currently supplies invocation-local geometry, current,
and thermal state to climate composition; it does not publish a durable ocean artifact.

Aggregate river benchmark evidence is calculated and emitted by the Standard
recipe's Lakes metrics projector rather than retained as pipeline state.
Advisory terrain/wind climate diagnostics are derived by the climate module's
pure observation operation and remain invocation-local input to visualization.
Seasonal rainfall and humidity amplitudes likewise remain invocation-local
evidence projected by the baseline step; no downstream pipeline consumer owns
or reads a retained seasonality product.

## Ops surface

Hydrology composes four capability modules and 18 operations. Step contracts bind only the
operations they execute:

- `ocean`: ocean geometry, surface currents, and thermal state,
- `climate`: radiative and thermal forcing, atmospheric circulation, moisture transport,
  precipitation, and the river-aware terrestrial water budget,
- `cryosphere`: cryosphere state and albedo feedback,
- `hydrography`: drainage, discharge, causal river-network classification, and lake intent.

The Standard recipe uses operation contracts such as:

- `computeRadiativeForcing`
- `computeThermalState`
- `computeAtmosphericCirculation`
- `computeOceanSurfaceCurrents`
- `computeEvaporationSources`
- `transportMoisture`
- `computePrecipitation` (`vector`, `baseline`, and `refine` strategies)
- `computeDrainageRouting`
- `accumulateDischarge`
- `projectRiverNetwork`
- `planLakes`
- `classifyRiverNetwork`
- `computeLandWaterBudget`
- `computeCryosphereState`, `applyAlbedoFeedback`

Navigable-river terrain selection is intentionally not a second physical river
model. The map-rivers projection rule derives an immutable Hydrology-owned
projectable subset from admitted river truth plus the current engine terrain
constraint; engine mutation and readback remain local to the projection step.

## Config + knobs posture

The Standard recipe exposes bound operation envelopes directly and adds a
small set of stage knobs for product-level posture:

- `hydrology-climate-baseline` knobs: `dryness`, `temperature`, `seasonality`, `oceanCoupling`
- `hydrology-hydrography` knobs: `riverDensity` (physical river-network classification density), `lakeiness` (a relative sink-derived lake-intent posture whose `normal` value preserves directly authored basin controls)
- `hydrology-climate-refine` knobs: `dryness`, `temperature`, `cryosphere`
- `map-rivers` knobs: `navigableRiverDensity` (Civ-visible navigable river trunk projection only)

Step schemas and their bound operation contracts remain the advanced
configuration surface. Knobs transform those admitted configs; they do not
replace or reconstruct their shape.

## River network benchmark contract

The generic measurement, target, study, and proof contract is owned by
[`docs/system/libs/mapgen/benchmarks/BENCHMARKS.md`](/system/libs/mapgen/benchmarks/BENCHMARKS.md).
The Standard recipe's current river measurements, scale constraints, regime
interpretation, and Earth anchors live with the executable product in its
[Hydrology metric-family sheet](../../../../../../mods/mod-swooper-maps/src/recipes/standard/metrics/studies/families/hydrology.md).

This domain reference owns Hydrology model and projection semantics only; it does
not duplicate recipe benchmark policy.

## Engine projection notes (map-hydrology / map-rivers)

The `map-hydrology` stage:

- is projection-only,
- writes every sample from final `artifact:hydrology.climateField` to the adapter exactly once,
- then projects static `artifact:hydrology.lakePlan` intent before engine elevation while
  preserving final Morphology mountain and volcano landforms,
- and does not compute a second rainfall or lake model.

The `map-rivers` stage consumes Hydrology hydrography after `map-elevation` has
built engine elevation, publishes the immutable projectable river selection,
then keeps mutable Civ7 mutation/readback as local trace, metrics, and
visualization evidence. This matches Civ7's terrain lifecycle: static water
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
`GameplayMap` still reported `NO_RIVER` metadata for those tiles. That proof is
historical evidence that terrain rows and river metadata are separate surfaces;
it is not the current product closure path.

`TerrainBuilder.modelRivers` remains the official high-level stock Civ river
materialization surface. Swooper authored maps must not delegate river truth to
that engine generator, but `map-rivers` may use the adapter-owned native bulk
writer after it stamps the Hydrology-selected navigable terrain mask so Civ
creates river metadata, model objects, water caches, and named-river state. A
2026-06-10 same-seed run proved why this boundary matters: unbounded native
generation produced extra no-sink fragments, while terrain-only authored
materialization produced no river metadata. Current acceptance therefore
requires both projected-vs-live terrain readback and projected/planned intent
vs native metadata readback (`engineNavigableRiverMask` and
`engineMinorRiverMask`). Minor-river exact parity remains open until same-run
evidence proves native readback matches Hydrology planned-minor intent.
Official resources were
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
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology/climate/baseline/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology/hydrography/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology/climate/refine/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology/projection/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology/rivers/index.ts`
- Step contracts (truth stages):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology/climate/baseline/steps/climate-baseline/config.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology/hydrography/steps/rivers/config.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology/climate/refine/steps/climate-refine/config.ts`
- Step contracts (projection stage):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology/projection/steps/lakes/config.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology/rivers/steps/plot-rivers/config.ts`
- Effect tag registry: `mods/mod-swooper-maps/src/recipes/standard/tags.ts`
- Policy: truth vs projection: `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`

## Open questions

- `artifact:hydrology._internal.windField` publishes atmospheric wind only. Ocean currents remain
  invocation-local baseline evidence for thermal coupling and visualization; promote them only if
  a downstream causal consumer emerges.
