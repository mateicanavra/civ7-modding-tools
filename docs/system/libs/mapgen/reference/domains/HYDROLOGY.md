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

Learning companion: [Water and Relief Glossary](water-and-relief-glossary.md)
connects physical terms, current computations and practical interpretation.

## Purpose

Hydrology produces climate and water-cycle products for downstream consumption:

- baseline and final-refined climate fields (rainfall, humidity, and potential demand),
- atmospheric wind and moisture-transport state,
- ground-preserving basin routing over final Morphology topography,
- discharge and hydrography evidence,
- refined terrestrial indices (effective moisture, aridity, and freeze) and optional cryosphere products,
  and related diagnostics.

Hydrology also feeds engine-facing projection steps, which are explicitly
**projection-only**: `map-hydrology` materializes final-refined rainfall and
accepted lake water before engine elevation, and `map-rivers` materializes
the complete admitted dry-source network after elevation. All shipped maps
use this single physical/native chain. Unsupported cases are refused, not
automatically rerouted into another solver.

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

- `artifact:hydrology.baselineClimateField` (annual-mean rainfall, humidity,
  potential demand, and its admitted parameters used by hydrography/refinement)
- `artifact:hydrology._internal.thermalField` (the annual mean of seasonal
  ground/SST temperature before feedback, published as `surfaceTemperatureC`
  in a named map-grid product consumed by refinement)
- `artifact:hydrology.climateField` (final-refined rainfall/humidity used by Ecology and engine projection)
- `artifact:hydrology.hydrography` (model-tagged drainage, discharge, and river
  classes; certified discharge is dry-cell evidence, with whole-body mixing in
  lake ledgers rather than signed wet-cell accumulation)
- `artifact:hydrology.riverNetwork` (upstream area, hierarchy, mouth, slope,
  and permanence fields consumed by river projection; certified mouths identify
  the first downstream lake separately from ocean termination)
- `artifact:hydrology.lakePlan` (model-tagged lake intent; certified strict wet
  footprints, water surfaces, bodies, budgets, and conservation evidence)
- `artifact:map.rivers.projectedRivers` (stable runtime id for the immutable
  complete authored dry-source writes;
  `map.rivers` identifies the product lane, not stage catalog ownership, and
  mutable engine readback is not retained)
- `artifact:hydrology.climateIndices` (final post-feedback temperature, moisture,
  demand, aridity and freezing descriptors for Ecology, placement and analysis)
- `artifact:hydrology.cryosphere` (cryosphere products; neutralized when knob disables it)

Hydrology projection also provides a payload-free external-state completion:

- `completion:map.rivers-plotted` gates consumers of final native river state.
  `artifact:map.rivers.projectedRivers` remains pre-materialization intent and
  therefore cannot substitute for this completion.

Rainfall projection has no completion: authored rivers consume physical
Hydrography artifacts, not native rainfall. Recipe order alone does not justify
an external-state dependency.

Accepted lake projection has no parallel completion:
`artifact:hydrology.projectedLakes` carries the immutable accepted physical
footprint required by elevation and terminal parity consumers. Certified
admission requires the complete planned footprint as water with COAST terrain;
the artifact is not a snapshot of native `isLake` classifications.

## Key artifacts

Hydrology's semantic products are cataloged by their owning module:

- `modules/climate/artifacts`: baseline/final climate, independent baseline/final
  surface temperature, indices, pressure and winds,
- `modules/cryosphere/artifacts`: snow, sea-ice, albedo, and frozen-ground state,
- `modules/hydrography/artifacts`: drainage, river-network, projection-ready lake
  intent, and immutable Civ7-projectable river intent.

The `modules/ocean` branch currently supplies invocation-local geometry, current,
and thermal state to climate composition; it does not publish a durable ocean artifact.

Ocean thermal transport uses the existing `latitude-current-advection` strategy.
Its advection stencil interpolates the two adjacent hex rays bracketing the
upcurrent direction before applying water masks or bounded Y edges. A blocked
ray retains its original share at the destination cell; surviving water donors
are not renormalized. Zero current selects the destination itself. Geometry is
odd-R with row parity and periodic X, despite the grid helpers' legacy `OddQ`
names; aliased directions on narrow grids retain their separate weights.
The operation blends that geometric donor with the destination temperature by
`alpha = min(1, hypot(U, V) / I8_VECTOR_MAX_ABS)` before diffusion. Exact zero
retains self and full strength selects the donor directly. The producer clamps
components independently; radial saturation at the encoding scale of 127 is
an explicit thermal-consumer policy, not a producer norm bound. The operation
preserves its latitude initialization, fixed passes, water-only diffusion,
shelf mixing and SST-derived ice threshold. This relative-strength blend does
not specify metres per second, a travel distance or timestep, or globally
heat-conserving transport.

Vector moisture transport uses the same Core angular bracket while retaining
its own transport law and donor admission. Air crosses both land and water;
off-map Y shares remain at self. Supplied phase/weather-member winds are
authoritative: calm wind samples self, and no latitude-band fallback or
secondary-donor cutoff overrides the vector. Local evaporation is still
injected on every fixed pass before retention and clamping, so calm conditions
do not imply constant humidity. Moisture remains direction-only; it does not
use the ocean's relative-strength blend. The separately selected cardinal strategy
retains its original latitude fallback and bounded cardinal sampling behavior.

Aggregate river benchmark evidence is calculated and emitted by the Standard
recipe's Network metrics projector rather than retained as pipeline state.
Advisory terrain/wind climate diagnostics are derived by the climate module's
pure observation operation and remain invocation-local input to visualization.
Seasonal rainfall and humidity amplitudes likewise remain invocation-local
evidence projected by the baseline step; no downstream pipeline consumer owns
or reads a retained seasonality product.

Baseline climate also publishes potential evaporative demand and its admitted
five-parameter calibration. The baseline step evaluates the shared
`computePotentialDemand` operation within its existing final seasonal samples
and averages demand, rather than applying a nonlinear temperature law to an
annual temperature mean. Refinement reuses the same parameters with its later
temperature/humidity forcing. `computeLandWaterBudget` consumes that demand
and owns effective moisture and aridity; it does not own another PET law.
Invocation-local demand retains double precision until aridity is computed,
while published climate arrays remain Float32. Demand uses empirical rainfall
index units, not calibrated open-water evaporation or a depth-storage rate.

There is one ground-temperature computation owner: baseline climate. Refine
consumes `thermalField` and applies declared albedo feedback;
it does not recompute sunlight or elevation cooling with a second calibration.
Pressure's sea-level temperature calculation remains separate because its datum
deliberately excludes ground lapse. Baseline thermal and final climate indices are
successive immutable vintages, not competing algorithms. Refined demand uses
annual refined temperature and is therefore not generally equal to mean
seasonal demand under a nonlinear law; that approximation remains explicit.
Elevation lapse is per normalized model relief unit, not per physical meter.

## Ops surface

Hydrology composes four capability modules. Step contracts bind only the
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
- `computePrecipitation` (`vector` and `baseline` synthesis strategies)
- `refinePrecipitation` (post-hydrography riparian and closed-basin wetness)
- `projectRiverNetwork`
- `computeLocalRunoff`
- `computeDrainageBasins`
- `computeBasinNetwork`
- `classifyBasinRiverNetwork`
- `computeLandWaterBudget`
- `computePotentialDemand`
- `computeCryosphereState`, `applyAlbedoFeedback`

The single Standard `network` step orchestrates the bound operations;
operations do not call one another. It uses attributed Number-precision local runoff, exact basin
geometry, baseline rainfall/demand, and whole-body conservation before publishing
consistent hydrography, lake, and river-network products. An unsupported result
publishes no partial authoritative network.

River projection is not a second physical model. Authored projection preserves every
classified dry source and receiver, rejecting blocked or invalid intent instead
of clipping sources or rerouting them. Mutation and readback remain local to
projection and observation steps.

## Config + knobs posture

The Standard recipe exposes bound operation envelopes directly and adds a
small set of stage knobs for product-level posture:

- `hydrology-climate-baseline` knobs: `dryness`, `temperature`, `seasonality`, `oceanCoupling`
- `hydrology-hydrography` knobs: `riverDensity` (physical river-network classification density)
- `hydrology-climate-refine` knobs: `dryness`, `cryosphere`

`hydrology-hydrography.water` is a closed `certified-sill-spill` contract with
four physical operation envelopes. `map-rivers` is configurationless and uses
Core's closed empty surface, not a redundant projection identity. All shipped profiles
use these contracts; lake count, area and singleton quotas are not physical
inputs. Retired solver/projection identities and their controls are rejected
by the owning schemas, not migrated into new physical coefficients.

Step schemas and their bound operation contracts remain the advanced
configuration surface. Knobs transform those admitted configs; they do not
replace or reconstruct their shape.
The baseline step's `potentialDemand` object owns PET coefficients; refinement
receives their admitted values through baseline climate instead of duplicating
authoring authority in its water-budget strategy.

## River network benchmark contract

The generic measurement, target, study, and proof contract is owned by
[`docs/system/libs/mapgen/benchmarks/BENCHMARKS.md`](/system/libs/mapgen/benchmarks/BENCHMARKS.md).
The Standard recipe's current river measurements, scale constraints, regime
interpretation, and Earth anchors live with the executable product in its
[Hydrology metric-family sheet](../../../../../../plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/families/hydrology.md).

This domain reference owns Hydrology model and projection semantics only; it does
not duplicate recipe benchmark policy.

## Engine projection notes (map-hydrology / map-rivers)

The `map-hydrology` stage:

- is projection-only,
- writes every sample from final `artifact:hydrology.climateField` to the adapter exactly once,
- then projects static `artifact:hydrology.lakePlan` intent before engine elevation,
- and does not compute a second rainfall or lake model.

Physical water is
computed after erosion/islands but before exposed mountain/volcano selection;
that later selection reserves complete wet bodies and classified dry channels.
Projection admits whole certified footprints or fails, never removes lake cells
to rescue a landform conflict. Thermal forcing retains original marine geography,
while terrestrial ecology consumes original land minus physical wet cells.

The `map-rivers` stage consumes Hydrology hydrography after `map-elevation` has
built engine elevation, publishes immutable model-tagged river intent,
then keeps mutable Civ7 mutation/readback as local trace, metrics, and
visualization evidence. This matches Civ7's terrain lifecycle: static water
before elevation, rivers after elevation.

Hydrology routing is the canonical water-movement graph. It preserves original dry-ground
receivers except explicit exact-sill outlet connectors, mixes wet-body supply
and demand in body ledgers, and requires nonnegative outflows, acyclicity, and
marine termination. Its interior wet connectivity is not a per-cell signed
discharge budget. Hydrology does not consume `artifact:morphology.routing`, which
remains a terrain-shaping proxy for Morphology consumers.

Physical ground, certified spill-level water surface, and native numeric height
are distinct. Elevation projection converts ground into authored native intent;
it does not submit the certified spill field as a native lake-level command.
Native inland-water leveling can occur with or without `isLake`. Qualified
numeric adjustments require complete finite readback and stable local water,
COAST terrain, and native category; a physical wet mask alone is insufficient.
Ordinary dry land and original ocean retain exact numeric admission, apart from
the separately qualified stable native-lake exception on original water.
Neither native leveling nor lake classification feeds back into physical truth.

Hydrology river classes have distinct projection meanings:

- `riverClass` is the Hydrology-owned intent class. `0` means no channel,
  `1` means minor/headwater channel intent, and values `>=2` mean
  major/projectable channel intent. Values above `2` are reserved for future
  stream-order hierarchy and remain eligible for major-river projection.
- `riverClass=1` is minor-river intent and must not be promoted into
  `TERRAIN_NAVIGABLE_RIVER`. Certified projection writes native MINOR for every
  such dry source.
- `riverClass>=2` is major-river intent and is the only hydrology class eligible
  for MapGen-owned navigable terrain projection. Major truth is routed trunk
  truth, not a set of isolated discharge-threshold outlet tiles. Certified
  projection writes native NAVIGABLE for every such dry source, including lake
  inlets; it does not select a smaller visible trunk subset.

Civ7 river proof has two distinct surfaces:

- `TERRAIN_NAVIGABLE_RIVER` is a terrain row and can exist without Civ river
  metadata.
- `GameplayMap.getRiverType`, `GameplayMap.isRiver`, and
  `GameplayMap.isNavigableRiver` are river metadata/readback surfaces.

Live runtime evidence on 2026-06-09 reported `RiverTypes.NO_RIVER=-1`,
`RIVER_MINOR=0`, and `RIVER_NAVIGABLE=1`; those metadata values are cataloged in
the generated `@civ7/map-policy` table as `CIV7_BROWSER_TABLES_V0.riverTypes`,
re-exported by `CIV7_RIVER_TYPES_V0`. A same-run Studio/Civ proof
(`studio-run-in-game-mq6c38rf-n2p`) matched projected navigable terrain to live
`TERRAIN_NAVIGABLE_RIVER` exactly (`6/6`, zero terrain mismatches), while
`GameplayMap` still reported `NO_RIVER` metadata for those tiles. That proof is
historical evidence that terrain rows and river metadata are separate surfaces;
it is not the current product closure path.

The authored projection lowers every dry source/receiver to `setRiverInfo`, invokes
`finalizeRivers` once, and maintains native water data without procedural river
generation. It emits no river writes inside wet bodies. Final placement rereads
river classes against immutable `projectedRivers` intent and always emits a
bounded `FINAL_RIVER_PARITY_V1` receipt for the certified path: unavailable is
explicit, and missing, extra, wrong-class, and NAVIGABLE-terrain mismatches are
separate evidence. This receipt is observational, not a runtime repair or abort.

Native class readback is not proof of directed edges, river-object continuity,
through-lake movement, or freshwater bonuses. Start planning's physical-lake
adjacency score is modeled opportunity, not a native freshwater observation.
The complete production-native qualification remains pending independently of
headless integration proof; bounded fixtures and current qualification limits
are recorded in the [integration packet](../../../../../projects/native-map-controls/basin-integration.md)
and [native river evidence](../../../../../projects/native-map-controls/rivers.md).

Historical writer evidence remains useful but does not describe the selected
authored branch: a 2026-06-10 same-seed run found that unbounded procedural
generation produced extra fragments while terrain-only authored materialization
produced no river metadata. Official resources were
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
That historical probe did not qualify the hook for minor-river authoring; the
current authored branch uses the separately qualified writer described above.

## Ground truth anchors

- Stage definitions (knobs + step list):
  - `plugins/mod/map/swooper-physics/src/recipes/standard/stages/hydrology/climate/baseline/index.ts`
  - `plugins/mod/map/swooper-physics/src/recipes/standard/stages/hydrology/hydrography/index.ts`
  - `plugins/mod/map/swooper-physics/src/recipes/standard/stages/hydrology/climate/refine/index.ts`
  - `plugins/mod/map/swooper-physics/src/recipes/standard/stages/hydrology/projection/index.ts`
  - `plugins/mod/map/swooper-physics/src/recipes/standard/stages/hydrology/rivers/index.ts`
- Step contracts (truth stages):
  - `plugins/mod/map/swooper-physics/src/recipes/standard/stages/hydrology/climate/baseline/steps/climate-baseline/config.ts`
  - `plugins/mod/map/swooper-physics/src/recipes/standard/stages/hydrology/hydrography/steps/network/config.ts`
  - `plugins/mod/map/swooper-physics/src/recipes/standard/stages/hydrology/climate/refine/steps/climate-refine/config.ts`
- Step contracts (projection stage):
  - `plugins/mod/map/swooper-physics/src/recipes/standard/stages/hydrology/projection/steps/lakes/config.ts`
  - `plugins/mod/map/swooper-physics/src/recipes/standard/stages/hydrology/rivers/steps/plot-rivers/config.ts`
- Completion catalog: `plugins/mod/map/swooper-physics/src/recipes/standard/completions.ts`
- Policy: truth vs projection: `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`

## Open questions

- `artifact:hydrology._internal.windField` publishes atmospheric wind only. Ocean currents remain
  invocation-local baseline evidence for thermal coupling and visualization; promote them only if
  a downstream causal consumer emerges.
