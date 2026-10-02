# Water And Relief Glossary

A functional companion to [Hydrology](HYDROLOGY.md), [Morphology](MORPHOLOGY.md)
and the [coherence study](../../../../../projects/native-map-controls/network-coherence-investigation.md).
These entries describe Earthlike's current path, not historical strategies.
Real-world sources explain the concepts; they do not make our tiles, heights,
flow totals or iterations kilometres, metres, cubic metres per second or years.

## Reading The Network

### Ground Elevation

Height of solid terrain, including submerged lake floors. Our integer relief
field determines depressions and routing; it is not the top of the water or a
declared metre scale. Use it for terrain shape, not lake-to-river surface drops.
[Model scale](../../../../../../plugins/mod/map/swooper-physics/src/domain/morphology/model/policy/elevation-scale.ts).
Learn: [USGS elevation-model terminology](https://www.usgs.gov/publications/digital-elevation-models-terminology-and-definitions).

### Water Surface

The top of water, distinct from its bed. The stationary basin coordinator solves
this surface from supply, demand and available outlets; an overflowing open
body reaches its spill height, while a closed body can settle below it.
The study uses sea level for marine cells and ground for dry cells. This is the
height to compare across a lake outlet, otherwise a submerged floor can create
a fictitious uphill connection. [Measurement](../../../../../../plugins/mod/map/swooper-physics/src/recipes/standard/metrics/families/hydrology/network-coherence.ts).
Learn: [USGS water level and discharge](https://www.usgs.gov/water-science-school/science/how-streamflow-measured).

### Depression, Basin And Wet Footprint

A depression is inward-draining terrain; its geometry exists even without a
sustainable lake. Our hierarchy groups nested depressions; an admitted lake wets
only cells strictly below its solved water surface. **Basin area is not lake area.**
[Basin geometry](../../../../../projects/native-map-controls/basin-geometry.md).
Learn: [Barnes et al., depression hierarchies](https://esurf.copernicus.org/articles/8/431/2020/).

### Catchment And Drainage Divide

A catchment contributes water toward an outlet; a divide separates catchments.
Our pit catchments include dry contributing land, not just wet tiles. They explain
why a small lake or narrow river can receive large upstream supply, and why
neighboring water need not connect. [Basin operation](../../../../../../plugins/mod/map/swooper-physics/src/domain/hydrology/modules/hydrography/ops/compute-drainage-basins/rules/index.ts).
Learn: [USGS watersheds](https://www.usgs.gov/water-science-school/science/watersheds-and-drainage-basins).

### Sill, Spill Height And Outlet

The sill is the low threshold where a depression can overflow. Our adjacent-cell
saddle uses the higher of the two ground heights; that spill height sets an open
lake's surface. Exact-sill cells remain dry, and recorded connectors carry its
outflow. This matters at narrow lake-to-river transitions.
[Basin-network operation](../../../../../../plugins/mod/map/swooper-physics/src/domain/hydrology/modules/hydrography/ops/compute-basin-network/rules/index.ts).
Learn: [depression outlets and merging](https://esurf.copernicus.org/articles/8/431/2020/).

### Receiver

A cell's immediate downstream destination. Our graph chooses one receiver per
cell; flat plateaus get a deterministic outlet and routing tree. It does not
simulate split flow or velocity. Follow these arrows to establish modeled
connectivity instead of inferring it from proximity or animated water.
[Routing operation](../../../../../../plugins/mod/map/swooper-physics/src/domain/hydrology/modules/hydrography/ops/compute-drainage-basins/rules/index.ts).
Learn: [terrain-routing and depressions](https://esurf.copernicus.org/articles/8/431/2020/).

### Local Runoff

Water supplied locally to drainage after modeled losses. Our strategy scales
rainfall by infiltration and humidity-dependent dampening. It connects climate
to river supply, but does not simulate groundwater travel or storm timing.
[Runoff computation](../../../../../../plugins/mod/map/swooper-physics/src/domain/hydrology/modules/hydrography/ops/compute-local-runoff/strategies/precipitation-attributed/index.ts).
Learn: [USGS surface runoff](https://www.usgs.gov/water-science-school/science/surface-runoff-and-water-cycle).

### Discharge And Lake Water Budget

Real discharge is volume passing a section per time. Our relative flow totals
accumulate incoming supply plus local runoff; lake bodies mix inflow and direct
precipitation, subtract demand, and export overflow. Zero **dry-cell** discharge
inside a lake does not mean its body carries no flow.
[Budget policy](../../../../../../plugins/mod/map/swooper-physics/src/domain/hydrology/modules/hydrography/model/policy/basin-water-budget.ts).
Learn: [USGS measuring discharge](https://www.usgs.gov/water-science-school/science/how-streamflow-measured).

### Headwater Versus Major-Segment Start

Headwaters are upstream beginnings of a stream network. Our `majorSegmentStarts`
instead counts major cells with no immediately upstream major cell, including
lake exits and minor-to-major transitions. Do not read that metric as rivers
spontaneously originating beside lakes.
[Metric owner](../../../../../../plugins/mod/map/swooper-physics/src/recipes/standard/metrics/families/hydrology/network-coherence.ts).
Learn: [EPA streams and headwaters](https://www.epa.gov/cwa-404/learn-about-streams).

## Temperature And Water Supply

### Surface Temperature And Thermal Vintage

A temperature field is one property over the map. Baseline publishes its annual
ground-temperature result as `thermalField`: the periodic strategy's dense cycle
integral. Refinement
applies albedo feedback and publishes the later temperature in the immutable
`climateIndices` descriptor product. Ecology and placement consume that final
product, not another temperature calculation. Field and artifact describe
spatial meaning and publication respectively, not competing storage mechanisms.
Pressure separately uses sea-level thermal forcing,
which deliberately excludes terrain cooling. Our Celsius-valued surface proxy
is not automatically equivalent to observed ground skin or two-meter air
temperature. [Thermal ownership and reference](../../../../../projects/native-map-controls/thermal-coherence.md).
Learn: [NOAA reference-variable classification](https://www.cpc.ncep.noaa.gov/products/precip/atlas_2/cont_data.html).

### Annual Availability Versus Water Stress

The substrate's `water01` summarizes composite annual water availability,
including effective moisture. It is not rainfall in millimetres, waterlogging
or the duration of a dry season. Water stress separately describes the annual
supply/demand relationship. Ecology uses both to score habitat; abundant supply
alone does not establish an exclusion such as inundation. Wet exposure,
occupancy and biome admission remain separate authorities.
[Savanna admission example](../../../../../projects/native-map-controls/savanna-water-supply.md).

### Lapse Rate And Model Relief

A lapse rate describes temperature change with height. Our thermal operation
uses degrees C per model relief unit above the sea datum, not degrees C per
meter. A familiar-looking value such as 0.0065 does not establish a physical
meter conversion. Independent lowland temperature can constrain latitude and
thermal gain, but cannot determine that relief conversion or replace missing
maritime heat transport. [Calibration limits](../../../../../projects/native-map-controls/earth-thermal-reference.md).

### Seasonal Integration Versus Observation

Integration phases are the times sampled to calculate annual atmospheric and
moisture outcomes. Observation phases are selected views for inspection; choosing
two or four must not change the world. Periodic thermal temperature has its own
dense annual integral, independent of these display views. More phases are not
automatically more accurate when downstream transport is discontinuous.
[Sampling and qualification](../../../../../projects/native-map-controls/periodic-thermal-response.md).

### Advection, Donor And Stencil

Advection transports a quantity with a flow. A donor is the upstream cell from
which an update samples that quantity; a stencil is the neighbor/weight pattern
used for the update. Our ocean and vector-moisture stencils bracket the supplied
flow with adjacent hex rays. Both keep off-map shares at self; only ocean
transport blocks land donors. Calm vectors sample self rather than inventing
latitude-based movement. Their fixed passes are not elapsed seconds, and
weighted sampling is not proof of total heat or moisture conservation. These
distinctions matter when small directional changes cause large temperature or
moisture jumps.
[Operation semantics](HYDROLOGY.md).
Contrast: [ECMWF conservative transport](https://www.ecmwf.int/en/newsletter/158/meteorology/nonhydrostatic-finite-volume-option-ifs).

## Shaping The Terrain

### Incision And Stream Power

Incision erodes a channel bed downward. Our proxy scales erodibility and rates
by normalized preliminary flow accumulation and positive receiver drop. It can
shape relief, but **final climate discharge is not carving the final network**.
Small changes may disappear when rounded to integer ground.
[Geomorphic computation](../../../../../../plugins/mod/map/swooper-physics/src/domain/morphology/modules/erosion/ops/compute-geomorphic-cycle/rules/index.ts).
Learn: [USGS channel erosion and deposition](https://www.usgs.gov/publications/a-field-guide-assessment-erosion-sediment-transport-and-deposition-incised-channels).

### Hillslope Diffusion

A simplified representation of material redistribution that smooths relief.
Our updates move land toward its neighborhood's average height, including the
cell itself. This directly reduces bumpiness, but its coefficient is not
calibrated diffusivity, and smooth terrain alone does not establish mature drainage.
[Same geomorphic owner](../../../../../../plugins/mod/map/swooper-physics/src/domain/morphology/modules/erosion/ops/compute-geomorphic-cycle/rules/index.ts).
Learn: [Landlab diffusion tutorial](https://landlab.csdms.io/tutorials/fault_scarp/landlab-fault-scarp.html).

### Sediment And Deposition

Eroded material can travel and settle. Our sediment proxy receives erosion,
settles a configured fraction preferentially at low stream power, and passes
another fraction to the fixed receiver. It counteracts incision, but is not
a grain-size or calibrated sediment-load simulation.
[Same geomorphic owner](../../../../../../plugins/mod/map/swooper-physics/src/domain/morphology/modules/erosion/ops/compute-geomorphic-cycle/rules/index.ts).
Learn: [USGS erosion, transport and deposition](https://www.usgs.gov/publications/a-field-guide-assessment-erosion-sediment-transport-and-deposition-incised-channels).

### World Age And Erosion Eras

Our young/mature/old settings multiply process rates by `0.7/1/1.3`; eras repeat
updates using already-computed preliminary routing, then round the result.
Neither is elapsed physical time. Increasing them does not guarantee fewer
lakes or navigable rivers; distinguish smoothing from drainage evolution.
[Same geomorphic owner](../../../../../../plugins/mod/map/swooper-physics/src/domain/morphology/modules/erosion/ops/compute-geomorphic-cycle/rules/index.ts).
Contrast: [explicit model time stepping in Landlab](https://landlab.csdms.io/tutorials/fault_scarp/landlab-fault-scarp.html).

## Mapping Into Civ

### Native Numeric Elevation

An engine-facing value, not another measured water surface. Our projection
authors original ocean as zero and other admitted cells as
`128 + round(max(0, ground - seaLevel) * 10)`; native processing may subsequently
adjust wet cells. Do not compare these numbers directly with physical heights
or infer uphill water from them. [Projection owner](../../../../../../plugins/mod/map/swooper-physics/src/recipes/standard/elevation-projection.ts).
Background: [USGS reference levels](https://www.usgs.gov/water-science-school/science/how-streamflow-measured).

### Physical Lake Versus Native Lake Classification

The physical model records a basin's wet footprint and spill surface. Civ's
`isLake` is a separate engine classification: shipped 1.5 Huge metadata sets
`Maps.LakeSizeCutoff` to ten cells. Our larger accepted inland bodies can thus
remain COAST water without becoming native lakes. This matters because their
native heights can be lowered again during river finalization and terrain
validation; it does not mean the physical lake should be drained or carved.
Area size is not a real-world salinity model. Keep physical provenance, native
classification and visible surface height distinct.
[Source and measured behavior](../../../../../projects/native-map-controls/water-height-maintenance.md).

### Open Lakes, Closed Lakes And Inland Seas

An open lake exports water through an outlet; a closed lake has no surface
outflow. Neither lake size nor a river connection alone determines salinity
or marine exchange. "Inland sea" is not a single hydrologic category: some
are ocean-connected; other named seas are closed lakes. Our certified path
models stationary open, closed, subtile and dry basin states plus directed
connectors and equal-head exchanges, not salinity, tides or a transient
lake-storage simulation. Preserve physical
body identity separately from Civ's size-based native `Lake` flag; a NAV tile
does not by itself make two water bodies one marine surface.
Learn: [USGS lake hydrology](https://www.usgs.gov/water-science-school/science/lakes-and-reservoirs)
and [NOAA/FGDC marine settings](https://coast.noaa.gov/data/digitalcoast/pdf/cmecs.pdf).

### River Class And Navigable River

Our minor/major classes come from exposed-land discharge percentiles plus
connected upstream promotion. Major does not mean every cell exceeds the major
threshold. Dry class `1` projects to Civ MINOR; `2` to NAVIGABLE. That projection
does not itself prove native continuity or naval passage.
[Classifier](../../../../../../plugins/mod/map/swooper-physics/src/domain/hydrology/modules/hydrography/ops/project-river-network/strategies/discharge-percentiles/index.ts)
and [native policy](../../../../../../plugins/mod/map/swooper-physics/src/recipes/standard/stages/hydrology/rivers/model/policy/authored-river-projection.ts).
Contrast: [real stream classifications](https://www.epa.gov/cwa-404/learn-about-streams).

### Cliff Versus Physical Slope

A real cliff is steep terrain. Civ's rendered cliff, numeric slope and directional
cliff-crossing flags are separate observations. Our certified recipe generates
native cliffs after river finalization, not as part of the receiver graph.
A visible drop alone proves neither uphill physical flow nor blocked movement.
[Realization order](../../../../../../plugins/mod/map/swooper-physics/src/recipes/standard/stages/hydrology/rivers/steps/plot-rivers/step.ts).
Learn: [USGS coastal cliffs and river knickpoints](https://www.usgs.gov/publications/coastal-knickpoints-and-competition-between-fluvial-and-wave-driven-erosion-rocky).

### Tile Scale And Network Density

Original land includes subsequently inundated ground; exposed land excludes
lakes; nonmountain exposed land excludes major rough barriers, but is not a
certified settlement mask. Always name the denominator. Our river-source counts
are not Earth river length per area, and equal seeds at different dimensions do
not identify the same geography. [Metrics](../../../../../../plugins/mod/map/swooper-physics/src/recipes/standard/metrics/families/hydrology/network-coherence.ts).
Learn: [USGS computed drainage paths versus streams](https://www.usgs.gov/streamstats/what-are-blue-pixelated-lines-are-they-real-streams-why-are-there-so-manyfew-them).
