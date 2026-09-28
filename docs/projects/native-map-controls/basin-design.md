# Basin-Aware Drainage

## Accepted Direction

Preserve Morphology ground first. Replace the implicit assumption that every
conditioned depression is an ordinary land channel with explicit basin water,
spill, and terminal semantics in Hydrology. No calibrated process currently
defines a 3, 6, or 9 model-unit barrier as unwanted; this design therefore does
not start by breaching or filling ground. A passing native downhill constraint
would not by itself justify changing physical relief.

The user authorized basin-aware Earthlike, simplification, sequence changes,
and implementation after studies on 2026-09-28. Geometry is ready for a bounded
implementation; budget calibration and native water-level admission require
discriminating studies before replacing production behavior.

## Geometry

Add a pure `compute-drainage-basins` Hydrology operation. First establish its
geometry and focused tests without switching the recipe's drainage authority.
See [geometry implementation semantics](basin-geometry.md) for the operation's exact outputs and limits.

1. Collapse connected equal-height plateaus on the existing cylindrical hex
   grid; retain explicit ocean and permitted external-edge outlets.
2. Route each plateau to a deterministic lower boundary, with an adjacent
   spanning tree on flats. A minimum plateau is one pit, not a pit per tile.
3. Assign raw-drainage leaves and record their boundary saddle edges. For a
   leaf pair retain the lowest `max(height[a], height[b])`, with index ties.
4. Process saddles in height order using union-find to construct a containment
   forest with separate directed spill links, not an ocean-inclusive merge
   tree. Meeting an already externally drained component means downstream
   overflow, not shared storage. Keep exterior connectivity separate from the
   actual mouth identity. Equal-height merges must not invent positive-capacity
   intermediate storage.
5. Retain floors, spill heights and adjacent endpoints, hierarchy, contributing
   cells and area-versus-height evidence. Contributing catchment area includes
   dry uplands; inundated area does not. Parent storage must not double-count
   children. Inundation is a geometric footprint, not an arbitrary count of
   upstream graph steps.

Use the [published depression hierarchy](https://esurf.copernicus.org/articles/8/431/2020/)
as the algorithmic reference, adapting grid adjacency rather than inventing
basin topology. Positive-depth connected components from the prior study are
not enough to represent nested basins.

## Water Meaning

Keep ground, conditioned escape surface, actual water surface and native
display separate. Extend `lakePlan`, not a parallel lake authority:

- Per tile: water-body identity, wet footprint, physical water-surface height.
- Per body: floor, sill, current level, outlet, and open-lake / closed-lake /
  dry-basin state.
- Per body: supply, loss, overflow and discretization residual in explicit
  model units.

Existing `hydrography.basinId` remains the drainage-terminal catchment identity;
it must not silently become a depression ID. A deep lake can overflow its sill
while keeping its low bed. [Landlab's LakeMapperBarnes](https://landlab.csdms.io/generated/api/landlab.components.lake_fill.lake_fill_barnes.html)
likewise distinguishes rock and water routing surfaces.

Use a stationary supply/loss approximation rather than converting a rainfall
index arbitrarily into terrain-depth storage. At candidate level h:

`available(h) = upstream overflow + dry-catchment runoff + wet-footprint precipitation`

`balance(h) = available(h) - wet-footprint evaporative demand`

Children resolve before parents, including spill/merge behavior. An open body
exports only surplus at its sill; closed wet bodies balance below it; dry or
sub-tile storage ends in a typed terminal. Whole-cell shorelines leave a named,
bounded residual, never fabricated discharge. This is not seasonal storage,
groundwater, sediment transport, salinity, or fill-time simulation.

Baseline precipitation and humidity already exist. Refined PET arrives after
hydrography and cannot be read backward. Expose a pre-hydrography thermal/demand
vintage using the existing temperature/PET calculation without later riparian
coupling. Its use for open-water demand is explicitly empirical and must be
studied. Atmospheric evaporation-source intensity is in different units and
is not an interchangeable loss rate. The [fill-spill-merge research](https://esurf.copernicus.org/articles/9/105/2021/)
supports retained depressions and overflow, not our empirical loss calibration.

## Sequence And Ownership

`Morphology ground -> baseline climate -> basin geometry and local runoff -> basin water state -> final receivers/discharge -> river classes -> climate refinement/ecology`

Replace publish-rivers-then-select-lakes with coherent Hydrography orchestration
over pure operations. Publish final `hydrography`, enriched `lakePlan`, and
`riverNetwork` only after water/routing reconciliation. A preliminary escape
graph is internal evidence, never final channel truth.

Ordinary dry-land receivers are nonascending in ground height. Lake interiors
can cross rising beds beneath level water but are not land-river tiles. Open
lakes have explicit spill links; closed bodies have typed terminals. Basin
losses enter discharge once. Baseline climate can remain byte-identical while
ground remains unchanged; do not add an atmospheric iteration incidentally.

Current mountain/volcano clipping of individual lake cells is incompatible
with a water-body contract. Resolve exposed landform eligibility before
projection; the narrow candidate moves surface landform selection after water
resolution, not tectonic/terrain generation. The coherence study determines
whether that candidate is needed. Native admission is whole-body and outlet
aware; partial admission is a failure, not permission to invent a new route.
Authored lake height means water surface, not bed. Native leveling and inlet/
outlet behavior remain separate qualification gates.

## Alternatives And Removal

Blanket ground filling removes storage and raises unrelated terrain. Full-DAG
lowering removes every basin. River-only carving can reroute the next solve.
None is selected simply because it removes uphill native writes.

The old sink-percentile/seed-budget/upstream-expansion lake policy is displaced
when the new model passes, not retained as a second selector. Its knobs cannot
hide necessary water while preserving virtual overflow. Whether a depression
is an artifact or meaningful cannot be decided from depth alone; see
[Lindsay and Creed](https://www.uwo.ca/biology/faculty/creed/PDFs/Journal%20Articles/028%20Lindsay%20and%20Creed%202006%20-%20Distinguishing.pdf).

## Verification Gates

Geometry fixtures: equal flats, nested bowls, competing saddles, wrapping,
outlet-free terrain, equal-height ties, immutable input. Budget fixtures:
deep-open, closed-wet, dry, sibling overflow and exact supply accounting with
explicit quantization residual. Integration: no ordinary uphill links, cycles,
untyped terminals or double-counted flow; lake interiors excluded from rivers.

Predeclared holds: terrain, continents, coast, bathymetry and baseline climate
remain exact during water-model work. Existing projected lake share <=0.08 of
modeled land tiles, wrapped connected-component count <=24, singleton lake tiles <=0.20
of all projected lake tiles, and placement/resource/ecology legality
remain unchanged. Study Earthlike Standard seeds 1/42/1018, Huge 1018, and
wet/arid identities. Guard failure diagnoses model or terrain-scale mismatch;
it does not authorize an arbitrary breach threshold or weakened acceptance.

Do not activate the production replacement until neutral geometry/budget
results and native lake admission support it. Only an evidence-forced product
trade-off, not an implementation unknown, warrants returning to the user.

## Native Lake-Level Qualification

The unchanged-terrain geometry proposal passed representative basin-steward
review after clarifying containment versus downstream spill, exterior versus
terminal identities, and catchment versus inundation area. The pure operation
must test these distinctions before any budget solver depends on it.

On 2026-09-28, the real Civ7 elevation diagnostic revision 2 tested independent
wet-cell input, surrounding shore height, and one lower adjacent outlet. Tiny
60x38, map seed 1018, game seed 1019, four players, saved configuration
`ToT_NoModsExceptMaps`. All four cells retained terrain ID 3 and shared the
same numeric height; the named lake sample retained native lake and water
classifications in all five comparisons:

| Wet-cell input | Uniform shore | One outlet | Observed lake height |
| --- | --- | --- | --- |
| 0 | 500 | 500 | 372 |
| 372 | 500 | 500 | 372 |
| 900 | 500 | 500 | 372 |
| 900 | 700 | 700 | 572 |
| 900 | 700 | 450 | 322 |

In this fixture, the setter does not grant independent control over native
lake level: the observed value follows minimum adjacent shore minus 128,
regardless of submitted wet-cell height. This is an observed fixture relation,
not a reimplementation or universal claim about native internals. The lowered
neighbor is a fixture control, not a proven connected river outlet. Existing
land projection has a 128 display floor, but `getElevation` does not establish
which rendered/underlying surface the water number represents. Do not infer
physical water depth or a universal conversion from that difference.

Physical water level remains Hydrology truth; "authored lake height" names
that artifact meaning, not a setter guarantee. Native projection can preserve
the complete categorical footprint and retain numeric readback separately;
it must not invent a fidelity bound, raise/lower physical ground to force the
renderer, or claim exact control of arbitrary closed-lake levels. Open-sill
and below-sill lake fixtures remain required before accepting a production
projection. These sequential controls were restored before later maintenance,
so they do not prove lifecycle preservation, river identity across a lake,
or navigation through it.

Evidence: generated/deployed script SHA-256
`dbd7e0052c7828862bde0eed278c236650b4039eb65293e09772318b423cbfa8`;
fresh completion 2026-09-28T06:39:35.836Z. The harness retains the historical
proof label `elevation-native-1018-v1`; diagnostic revision, script digest and
fresh timestamp distinguish this execution. Receipts:
`/tmp/civ7-lake-level-probe-{build.log,install.json,live.log,observations.json}`.
Three focused artifact tests passed (132 assertions); the build graph passed
10 tasks, and the live graph passed 15 tasks. The tests prove fixture and
transport behavior; the fresh game readbacks prove the five observations.

## Coherence-Study Amendment

Terrain preservation here applies to basin work; it does not forbid correcting
a demonstrated upstream terrain bug. The matched twelve-case relief study
found advancing per-tile RNG draws where the base-topography strategy intended
spatially coherent noise. Disabling only those two terms reduced Earthlike
depression roots from 76-155 to 6-13. Repair and qualify that consumer before
calibrating basin budgets. See [the causal comparison](relief-coherence.md).

The pure geometry operation passed 14 focused fixtures (2,585 assertions) and
an independent source review. Across all 24 baseline and noise-off captures,
its union of root footprints below the external sill exactly matched the
existing priority-flood cells whose routing elevation exceeds ground: zero
membership differences. This corroborates full-spill geometry, not actual lake
selection, water conservation, or native admission.

Budget implementation must preserve two distinctions identified in review:

- A whole-cell shoreline budget need not be monotonic with level: replacing a
  cell's land runoff with precipitation minus demand can have either sign.
  Scan elevation cohorts; do not binary-search an unproved monotonic function.
- Sibling spill links can be reciprocal before merging. Resolve incoming
  surplus against unsaturated siblings and merge saturated components before
  constructing an outward receiver tree. Do not topologically sort raw sibling
  pointers as if they were already directed drainage.

Use rainfall-index times unit tile area per representative interval for both
source and demand, not an arbitrary conversion into terrain storage. Count
dry-catchment runoff and wet-cell direct precipitation on disjoint footprints.
Apply display/discharge scaling uniformly afterward. Positive runoff floors
must have an attributed source rather than manufactured rainfall. A positive
supply dry/sub-tile terminal retains a named residual, not invented loss.
An outlet-free root with persistent surplus has no stationary solution and
must report that limitation rather than silently cap its level.

## Pre-Hydrography Demand Owner

Extract the existing empirical PET law into a Climate-owned
`compute-potential-demand` operation. Baseline owns the five authored demand
parameters and publishes their admitted values with baseline demand; refinement
reuses those values with its later temperature/humidity vintage. Hydrography
consumes baseline demand without owning climate calibration or reading later
artifacts backward. A shared Climate model schema owns the defaults once.

Baseline already computes actual-ground temperature inside each final seasonal
moisture sample. Evaluate demand there and average the seasonal results; do not
repeat atmosphere or thermal solves. Existing land-water-budget arithmetic
consumes supplied PET and retains effective-moisture/aridity responsibility.
No operation invokes another operation; step orchestration binds both.

Move authored PET coefficients from refinement to baseline in the shipped
configs, preserving each map's values. Merely using operation defaults would
silently change Earthlike's explicitly authored law. Carry only these physical
parameters forward, not opaque step envelopes or a parallel config authority.

Verification requires numerical refined-PET parity for identical forcing and
coefficients, unchanged baseline precipitation/humidity and all existing map
outputs, correct seasonal averaging, and explicit forward parameter reuse.
This is a preparatory refactor: baseline demand is not yet a calibrated
open-water-loss guarantee or permission to activate the basin replacement.

The extraction passes 59 focused climate tests (4,395 assertions), including
double-precision aridity parity, seasonal averaging and forward parameter
reuse. All twelve paired Earthlike/mountain-patch captures retain every
previously captured model and observed-array hash exactly versus the
relief-supported baseline. Receipts:
`/tmp/civ7-relief-{relief-supported,baseline-demand}.json`. The config digest
changes because coefficient ownership moves; their admitted numeric values
do not. This qualifies the preparatory refactor, not basin water physics.
Independent review identified invalid floating-point forcing admission:
non-finite land temperatures and non-finite/negative published demand are now
rejected, with focused fixtures. The definition's 23-task check graph passes.
The broader check/test run retains only the three separately diagnosed
landform/Latest Juicy expectations; no full-bank pass is claimed here.

## Stationary-Budget Feasibility Discriminator

The twelve post-noise/post-shelf captures reproduce their full-spill footprints
exactly from pure basin geometry. Earthlike's existing demand coefficients
bound PET at 101, and its existing runoff law supplies at least `0.6396 P`.
Scanning every elevation cohort, recursively certifying every child, and
omitting incoming overflow gives a conservative saturation certificate without
borrowing refined climate backward:

`B_lower(h) = sum_dry(0.6396 P) + sum_wet(P - 101)`.

| Earthlike case | Full wet components | Certified full components | Wet / land | Singleton / wet |
| --- | ---: | ---: | ---: | ---: |
| Standard 1 | 24 | 23 | 8.37% | 6.43% |
| Standard 42 | 32 | 31 | 5.65% | 16.84% |
| Standard 1018 | 26 | 26 | 4.42% | 16.88% |
| Huge 1 | 60 | 58 | 8.89% | 10.96% |
| Huge 42 | 58 | 52 | 8.70% | 9.73% |
| Huge 1018 | 55 | 50 | 7.46% | 9.85% |

Counts use actual wrapped-hex wet components. A separate mixed-vintage
approximation, baseline rainfall minus reconstructed refined PET, is positive
on every wet tile; it is corroborating diagnosis, not production forcing.
Actual baseline demand is still required, but cannot by itself defeat the
certificate while retaining these coefficients. This establishes consequences
of the selected empirical model, not physical calibration of open-water loss.
Reproducer: `/tmp/civ7-basin-budget-discriminator.ts` with
`/tmp/civ7-relief-coherent-shelf.json`.

The count guard was introduced in `2e6a56c466` with the 2026-05-30 visual-quality
work, alongside the old selected-sink/upstream-expansion policy. Its underlying
requirement rejects maps whose lake area is mostly isolated one-tile basins;
the promoted requirement does not prescribe 24. The number remains an existing
acceptance gate, not a native limit or a physical constant. Superseding it
requires an explicit acceptance amendment, not adjusting it to this cohort's
maximum. The 8% area gate is a separate gameplay concern and is not resolved
by distinguishing count from singleton scatter.

Do not hide this conflict with a sink selector, fabricated evaporation,
sub-grid labels for everywhere-positive basins, or arbitrary ground carving.
Measure demand, whole-body native realization and playable-land impact before
deciding whether to amend product acceptance or revise terrain-scale physics.

## Actual Baseline Forcing And Gameplay Discriminator

The preparatory demand extraction now supplies the actual pre-hydrography
vintage. Across twelve Earthlike/mountain-patch Standard/Huge captures at
seeds 1/42/1018, all 630 basin nodes, 502 roots and 2,562 elevation-cohort
states have strictly positive stationary balance without incoming overflow.
The minimum is +13.472597 rainfall-index tile units per interval. Every
descendant also passes, and every root has an external spill. Therefore the
selected fixed-forcing model fills all these basins to their geometric sill;
no guessed partial level is needed to establish this cohort's wet footprint.

This is not because direct precipitation exceeds demand everywhere: 107 wet
cells have nonpositive `P-PET`. Catchment runoff and the remaining wet-cell
balance supply the surplus. The scan uses published baseline seasonal-mean
demand, not PET recomputed from annual-mean temperature or refined climate.
Runoff reconstruction, geometry membership, prior capture hashes and the
current observed playable mask all pass exact checks. The complete wet mask
matches priority-flood positive-depth membership exactly; it replaces current
lakes rather than adding to them. Current selected lakes have 6-40 cells per
case outside that geometric footprint.

| Configuration / size / seed | Full wet cells | Wet components | Wet / land | Retained playable cells detached |
| --- | ---: | ---: | ---: | ---: |
| Earthlike Standard 1 | 140 | 24 | 8.37% | 5 |
| Earthlike Standard 42 | 95 | 32 | 5.65% | 5 |
| Earthlike Standard 1018 | 77 | 26 | 4.42% | 0 |
| Earthlike Huge 1 | 228 | 60 | 8.89% | 464 |
| Earthlike Huge 42 | 226 | 58 | 8.70% | 682 |
| Earthlike Huge 1018 | 203 | 55 | 7.46% | 537 |
| Mountain patch Standard 1 | 112 | 19 | 6.76% | 33 |
| Mountain patch Standard 42 | 171 | 35 | 10.11% | 9 |
| Mountain patch Standard 1018 | 90 | 21 | 5.12% | 0 |
| Mountain patch Huge 1 | 234 | 60 | 9.05% | 3 |
| Mountain patch Huge 42 | 295 | 60 | 11.35% | 173 |
| Mountain patch Huge 1018 | 219 | 52 | 8.007% | 39 |

This first connectivity comparison holds original mountain and volcano masks
fixed as blockers. For each original dry/nonmountain component, group its
surviving cells by new component and count cells outside the largest surviving
group. It does not count flooded cells or restored former lake cells as
detached survivors. The measure diagnoses land-route changes, not unit
pathfinding, embarkation, starts, city legality or a universal badness cutoff.
Natural-wonder impassability and river crossing rules are not represented.

The 24-component guard fails in nine cases and the 8% area guard in seven;
all twelve pass the existing singleton-area share bound. Area and component
count do not stand in for movement topology: Huge Earthlike 1018 is below 8%
yet loses a large land connection, while mountain-patch Standard 42 exceeds
10% with only nine detached surviving cells. Do not fit new caps to this table.
Full inundation overlaps 1-11 existing mountain and 0-3 volcano cells per case;
whole-body water admission and exposed terrain selection need reconciliation.

The next discriminator replans exposed landforms on the final dry footprint
without changing physical ground, and separately measures water-only splits.
That distinguishes a sequencing problem from genuinely fragmented basins and
from legitimate combined lake/mountain barriers. Neither an ordering change
nor preservation of all previous land routes is assumed correct in advance.

Reproducers and complete evidence:
`/tmp/civ7-baseline-demand-basin-study.ts`,
`/tmp/civ7-baseline-demand-forcing.json`, and
`/tmp/civ7-baseline-demand-basin-results.json`.
The reference cohort is `/tmp/civ7-relief-baseline-demand.json`.

### Exposed Landform Ordering

The five-case counterfactual reproduces all original mountain artifact fields
exactly before changing only the three landform operations' admitted land
mask to final dry land. It preserves ground, marine coast distance, tectonic
drivers, normalized config, seeds and noise. Volcanoes remain fixed. No
downstream climate, placement or native operation is rerun in this comparison.

| Case | Water-only detached | Full water / old mountains | Full water / replanned mountains |
| --- | ---: | ---: | ---: |
| Earthlike Standard 1 | 2 | 5 | 235 |
| Earthlike Huge 1 | 0 | 464 | 5 |
| Earthlike Huge 42 | 1 | 682 | 518 |
| Earthlike Huge 1018 | 0 | 537 | 7 |
| Mountain patch Huge 42 | 7 | 173 | 58 |

Water-only and playable-land columns have different reference masks; they
cannot be added together. Removing old mountain labels only on submerged cells
is exactly equivalent to retaining old blockers there, because water already
blocks the tested dry route. Replanning removes every mountain/water overlap
but redistributes substantial exposed terrain, rather than merely subtracting
submerged mountains. Standard 1 loses 120 old dry peaks and gains 102 different
dry peaks, despite total mountain area declining from 221 to 202.

The large splits are therefore classification/water interactions, not intrinsic
fragmentation from the basin footprints alone. They are not automatically
defects: the compared Standard 1 regions contain 602/277 cells and retain
119/50 marine-coastal cells; Huge 42 has 891/509 cells with 143/145 marine-coastal
cells. Each pair has a dry route requiring one classified blocker. That is a
causal witness, not permission to remove the blocker or claim naval access.

Inspected separator `(9,30)` on Standard 1 is a newly promoted former foothill,
ground 69 with downward/upward local relief 6/8. Huge 42's existing `(27,22)`
mountain has ground 58 and relief 5/11; newly promoted `(26,25)` has ground 44
and exposed relief 4/3 between two shallow basins. Every example meets current
relief admission. They are not the prior unsupported-flat classification leak.
Some are modest shoulders or saddle-like connections, but the model has no
elevation-to-real-slope calibration that proves they must be passable.

Selected implication: exposed landforms need final water evidence for coherent
surface ownership; blind resequencing is not a proven playability repair.
Do not add a universal no-barrier rule, zero-fragmentation target or peak quota.
Physical range structure, land area, starts/settlement and coastal access remain
separate acceptance questions. Keep old production generation active while
the integrated basin candidate is studied, not as a hidden fallback inside it.

Evidence: `/tmp/civ7-basin-exposed-landform-discriminator.{ts,md}`,
`/tmp/civ7-basin-exposed-landform-results.json`, and
`/tmp/civ7-basin-cut-neighborhoods.json`. Fresh acquisition, cached reanalysis,
original artifact parity, immutable ground, removal-only equivalence and
adjacent no-water route witnesses all pass.
