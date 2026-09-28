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
remain exact during water-model work. Existing lake share <=0.08, component
count <=24, singleton share <=0.20 and placement/resource/ecology legality
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
