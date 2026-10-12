---
id: Q-009
title: Annual Water Yield And Downstream Supply
recordKind: question
disposition: open
sourceRevision: ce077ddf13dc8cbbed16c1071e2aac6fafddbb60
locations:
  - id: "hydrology-annual-water-yield"
    label: "Annual Water Yield"
    relation: "question-owner"
    stage: "hydrology-hydrography"
    step: "network"
    operation: "hydrology.hydrography.ops.computeLocalRunoff"
    lessonIds: ["spill-corridors"]
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/plugins/mod/map/swooper-physics/src/domain/hydrology/modules/hydrography/ops/compute-local-runoff/contract.ts"
  - id: "hydrology-basin-water-accounting"
    label: "Basin Water Accounting"
    relation: "related-producer"
    stage: "hydrology-hydrography"
    step: "network"
    operation: "hydrology.hydrography.ops.computeBasinNetwork"
    lessonIds: ["spill-corridors"]
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/plugins/mod/map/swooper-physics/src/domain/hydrology/modules/hydrography/ops/compute-basin-network/contract.ts"
  - id: "hydrology-land-water-budget"
    label: "Land Water Budget"
    relation: "downstream-consumer"
    stage: "hydrology-climate-refine"
    step: "climate-refine"
    operation: "hydrology.climate.ops.computeLandWaterBudget"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/plugins/mod/map/swooper-physics/src/domain/hydrology/modules/climate/ops/compute-land-water-budget/contract.ts"
assessments:
  - claim: "The reviewed annual-yield source partitions baseline precipitation with compatible phase-averaged baseline demand before routing. Its nonnegative dry-ground yield is bounded by precipitation. This is an empirical annual approximation, not measured evapotranspiration."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/plugins/mod/map/swooper-physics/src/domain/hydrology/modules/hydrography/ops/compute-local-runoff/strategies/annual-water-yield/index.ts"
  - claim: "Refined plant-water indices retain atmospheric precipitation and add local annual surface-water opportunity. Opportunity is not delivered water, root uptake, groundwater or seasonal storage."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/plugins/mod/map/swooper-physics/src/domain/hydrology/modules/climate/ops/compute-land-water-budget/contract.ts"
  - claim: "The retained f200858 fifteen-map full-recipe comparison physically supports the approximate annual partition while exposing increased unresolved shoreline/subtile supply. This does not establish calibrated yield, ecological adequacy or native qualification."
    state: "supported"
  - claim: "The inspected source prescribes external water at sea datum for initial-water components touching a clipped north/south boundary. Drainage uses the external surface head and explicitly refuses unsupported inward inundation of adjacent below-head finite ground. This is not a tested general ocean-exchange model."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/plugins/mod/map/swooper-physics/src/domain/hydrology/modules/hydrography/ops/compute-drainage-basins/rules/index.ts#L74-L93"
  - claim: "The annual aggregation, demand scales and local-water opportunity accurately represent catchment yield and plant-accessible water across relevant Earth regimes."
    state: "unassessed"
verification:
  - kind: source-inspection
    scope: "Inspection confirms the demand-aware annual partition, bounded yield and numerical treatment of zero supply/demand. The ce077dd owner is byte-identical to the f200858 generation owner; this is not a new recipe run or calibration result."
    revision: ce077ddf13dc8cbbed16c1071e2aac6fafddbb60
    date: '2026-10-12'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/plugins/mod/map/swooper-physics/src/domain/hydrology/modules/hydrography/ops/compute-local-runoff/strategies/annual-water-yield/index.ts"
  - kind: source-inspection
    scope: "Inspection confirms that Network binds runoff and basin accounting, and that Climate Refinement publishes advisory plant-water indices through computeLandWaterBudget. It does not establish seasonal root-water support."
    revision: ce077ddf13dc8cbbed16c1071e2aac6fafddbb60
    date: '2026-10-12'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/plugins/mod/map/swooper-physics/src/recipes/standard/stages/hydrology/climate/refine/steps/climate-refine/config.ts"
  - kind: source-inspection
    scope: "Inspection confirms initial-water component admission at the clipped north/south boundaries and the sea datum. This is source scope, not a new basin comparison or native observation."
    revision: ce077ddf13dc8cbbed16c1071e2aac6fafddbb60
    date: '2026-10-12'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/plugins/mod/map/swooper-physics/src/domain/morphology/modules/landforms/ops/compute-island-topography/rules/external-water.ts#L24-L40"
  - kind: source-inspection
    scope: "Inspection confirms prescribed-head drainage and the explicit below-head inward-inundation refusal. The matched closed/outflowing/ocean-connected comparison remains absent from retained qualification."
    revision: ce077ddf13dc8cbbed16c1071e2aac6fafddbb60
    date: '2026-10-12'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/plugins/mod/map/swooper-physics/src/domain/hydrology/modules/hydrography/ops/compute-drainage-basins/rules/index.ts#L74-L93"
---

# Q-009: Annual Water Yield And Downstream Supply

How far can a coherent annual water budget support claims about lakes, nearby
plant water and habitat? The reviewed mechanism distinguishes available water
from atmospheric demand before routing. The remaining question is whether its
annual approximation and downstream opportunity describe the right physical
quantities at the represented scale, not whether more or fewer lakes look better.

The question begins in **Hydrography / Network**, after Baseline Climate has
supplied precipitation and potential demand. It follows resolved water into
**Climate Refinement / Climate Refine**, where local water becomes a plant-water
opportunity index. [Ecological prevalence][ecology] asks whether the resulting
habitat and cover are adequate; a preferred feature count is not itself a
target for hydrological tuning.

## Connections And Budgets, Not Names Or Size

The Black Sea exchanges water with the Mediterranean through the Turkish
Straits; it is not a closed basin merely because land nearly surrounds it.
The Caspian receives rivers but has no outlet, losing water through evaporation
while salts accumulate. Their names do not identify the same mechanism.
[Lima and colleagues: Black Sea exchange][black-sea]; [NASA: Caspian][caspian].

The model needs to distinguish an **ocean-connected prescribed boundary**, a
**finite basin with outflow**, and a **finite closed basin**. Its finite solver
already resolves geometry, annual dry-ground yield, wet precipitation/demand
and overflow. Basin extent follows those conditions rather than an area quota;
an outflowing and a closed basin do not require separate generators.

The [external-water declaration][external-water] is more specific than a
general ocean model: initially water-covered components reaching either clipped
north/south boundary are prescribed at sea datum. [Drainage][external-drainage]
uses that water-surface head rather than the bed, and explicitly refuses an
adjacent below-head finite cell needing inward inundation. Two-way exchange,
groundwater travel/storage and salt evolution are not supplied by this audited
surface-water transition. Island relief and land/water topology are authored
upstream before climate, not evidence that large inland waters need another
formation algorithm.

This identifies a conditional external-boundary/exchange limitation, not a
found failure on the two qualified native maps. Neither a name, a large area
nor a native category supplies a missing physical boundary condition.

## A Repaired Partition Is Not A Calibrated Catchment

Evaporation and transpiration require both water and an opportunity to lose it.
High atmospheric demand cannot remove water that is not available. Conversely,
abundant precipitation need not all return to the atmosphere. The reviewed
[annual-yield operation][yield] expresses that distinction using baseline
precipitation P and phase-averaged baseline demand D:

```text
Approximate local loss E = P * D / sqrt(P * P + D * D)
Dry-ground yield Q = P - E
```

Zero precipitation supplies zero yield; zero demand leaves supplied
precipitation available. When both are zero, E and Q are defined as zero.
These are compatible empirical rainfall-index units, not measured millimeters
or river discharge. The equation repairs the prior dry-ground rule's lack of
demand sensitivity; it does not independently calibrate local evapotranspiration.

A dry cell contributes Q to drainage. Inside the final wet footprint, the
basin budget instead uses precipitation minus wet demand. Those are disjoint
footprints, not two losses charged to the same water. Incision and final routing
can respond to the altered supply, so the full-chain result is not equivalent
to changing lake area over fixed final ground.

## Annual Opportunity Is Not Water Delivered To Roots

The later [land-water budget][plant-water] keeps recipient atmospheric
precipitation intact and adds admitted local surface-water opportunity.
Recipient demand enters an advisory stress ratio; it is not another withdrawal
from the routed network. Marine water is excluded. Refined demand is calculated
from annual temperature and wetness, whereas the earlier hydrography demand
averages sampled seasonal states. Their nonlinear calculation can produce
different values without establishing a double debit.

This leaves real interpretation limits. A neighboring annual flow does not
establish seasonal access, soil storage, infiltration, root depth, groundwater
or salinity. Repeated ecological stress attenuation and moisture-category
boundaries also need their own support. The [rainforest category witness][category]
shows a habitat change even as a family's score rises; it does not turn annual
opportunity into a measured root-water supply.

## A Conserved Ledger Can Still Leave Supply Unallocated

The retained comparison at generation source `f20085808332b5051971dd465e189e834daaa5d4`
covers the same fifteen complete headless recipes, ten Huge and five Standard.
Lake cells decline from 2,825 to 2,559 and strict wet bodies from 599 to 529,
but two maps gain net wet area. The aggregate response is not uniform water
removal or a lake-area quota.

Unresolved shoreline/subtile supply rises from 0.059800% to 0.102434% of actual
dry runoff plus wet precipitation; the largest map-level share is 0.615207%.
This is an allocation limit, distinct from arithmetic conservation error.
A small pooled share need not be insignificant for every local habitat.
The earlier fixed-final-ground diagnostic has a different result and does not
replace this full-recipe evidence.

The combined reviewed source `ce077ddf13dc8cbbed16c1071e2aac6fafddbb60` retains
the same generation implementation. Its separate benchmark amendment changes
rainforest non-vacuity, not physical runoff. The physical approximation is
accepted without establishing catchment calibration. The separate adoption
and bounded native findings retain their own [qualification account][qualification].
The [resource-planning question][resources] retains the
downstream composition cost under its own owner.

## Physical Water Bodies And Native Lake Categories

The [retained native-category decision][lake-category] keeps Civ7's stock,
per-map-size lake cutoff as a conservative gameplay projection, not a maximum
physical basin size. Finite versus external water membership, water heads,
budgets and river direction retain their physical meaning. Native `isLake`
is a separate engine category and need not identify every finite water body.

Neither a large footprint nor `isLake=false` establishes salinity, marine
habitat or an intentionally designed inland sea. A finite body does not become
an external reservoir because Civ7 classifies it differently. The
[separate rendering qualification][lake-render] also distinguishes a correct
numeric water head from visible water. The [rejected unlimited-cutoff
comparison][unlimited-cap] changed protected marine categories, heights,
features and resources; raising the threshold is not a neutral way to make
the categories agree. These limits do not, by themselves, select a basin cap
or explain why a particular physical basin is large.

The bounded two-map consumer trace retains finite-water Fish habitat on all
74 cells in four bodies whose native lake flags differ. Three placed Fish are
unchanged in native readback; the eighteen-cell body has no selected resource
in either result. There are no resource differences on these bodies and no
directly adjacent observed first-unit positions. This does not qualify every
eligible resource site, native freshwater bonuses or salinity. It does show
that these non-lake flags did not convert the bodies into marine resource
habitat. The trace inspects retained evidence, not a new native execution.

## What Would Distinguish The Remaining Explanations?

Holding the interior bowl, annual forcing and sea datum fixed while changing
only its connection from sealed rim to finite outflow to ocean connection
would distinguish finite-basin balance from external-boundary behavior.
Connections across the east-west wrap belong to the same comparison. A limit
confined to inward, below-head exchange would implicate external-boundary
support, not establish a need to tune evaporation or cap lake area. This
matched comparison is not part of the retained qualification; no passing
result or replacement algorithm is claimed.

With annual totals held, different precipitation/demand timing can reveal
whether aggregation hides materially different water availability. Agreement
with an independently justified seasonal or observed catchment budget would
support the approximation in that regime; systematic departures would bound
where an annual approximation is inadequate. Arithmetic agreement alone would
not supply that calibration.

With source geometry and recipient forcing held, an accounting of where the
unresolved shoreline supply belongs can distinguish harmless discretization
from a locally important omission. If independent access evidence supports
the same plant-water opportunity despite the residual, the concern about
habitat impact weakens. If it does not, the discrepancy belongs to allocation
or recipient-access meaning, not automatically to atmospheric rainfall.
Neither outcome selects a lake quota, a river percentile or a vegetation floor.

[yield]: https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/plugins/mod/map/swooper-physics/src/domain/hydrology/modules/hydrography/ops/compute-local-runoff/strategies/annual-water-yield/index.ts
[plant-water]: https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/plugins/mod/map/swooper-physics/src/domain/hydrology/modules/climate/ops/compute-land-water-budget/contract.ts
[ecology]: q-002-ecological-prevalence.md
[category]: q-002-ecological-prevalence.md#rainforest-habitat-is-not-a-native-feature-guarantee
[qualification]: q-002-ecological-prevalence.md#annual-yield-evidence-and-qualification
[resources]: q-010-resource-composition.md
[lake-category]: https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/docs/projects/native-map-controls/calibration-question-sheet.md#resolved-decision-preserve-heads-keep-conservative-native-taxonomy
[lake-render]: https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/docs/projects/native-map-controls/calibration-question-sheet.md#reopened-render-and-category-qualification
[unlimited-cap]: https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/docs/projects/native-map-controls/water-height-maintenance.md#v12-outcome-and-restoration
[black-sea]: https://os.copernicus.org/articles/22/1051/2026/
[caspian]: https://modis.gsfc.nasa.gov/gallery/individual.php?db_date=2016-06-22
[external-water]: https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/plugins/mod/map/swooper-physics/src/domain/morphology/modules/landforms/ops/compute-island-topography/rules/external-water.ts#L24-L40
[external-drainage]: https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/plugins/mod/map/swooper-physics/src/domain/hydrology/modules/hydrography/ops/compute-drainage-basins/rules/index.ts#L74-L93
