# Water And Relief Glossary

A functional companion to [Hydrology](HYDROLOGY.md), [Morphology](MORPHOLOGY.md)
and the [coherence study](../../../../../projects/native-map-controls/network-coherence-investigation.md).
These entries describe Earthlike's **certified** path, not every legacy strategy.
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

The top of water, distinct from its bed. Certified lakes use their spill height;
the study uses sea level for marine cells and ground for dry cells. This is the
height to compare across a lake outlet, otherwise a submerged floor can create
a fictitious uphill connection. [Measurement](../../../../../../plugins/mod/map/swooper-physics/src/recipes/standard/metrics/families/hydrology/network-coherence.ts).
Learn: [USGS water level and discharge](https://www.usgs.gov/water-science-school/science/how-streamflow-measured).

### Depression, Basin And Wet Footprint

A depression is inward-draining terrain; its geometry exists even without a
sustainable lake. Our hierarchy groups nested depressions; an admitted lake wets
only cells strictly below its spill surface. **Basin area is not lake area.**
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
[Open-network operation](../../../../../../plugins/mod/map/swooper-physics/src/domain/hydrology/modules/hydrography/ops/compute-open-basin-network/rules/index.ts).
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
