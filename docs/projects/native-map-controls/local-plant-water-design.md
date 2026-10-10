# Local Plant-Water Response

## Frame And Status

Implementation and qualification after the retained-input discriminator following
the atmospheric-proxy retirement in PR #2347. The desired outcome is local
ecological response to admitted river/lake water, not more trees everywhere,
restored historical counts or a
second atmospheric calculation. The source/access law is selected for one
implementation unit. Actual recipe and bounded native qualification are now
complete. The explicit Earthlike benchmark-policy amendment and final
test-owner reconciliation preserve the qualified runtime implementation.

Atmospheric forcing, demand, physical drainage, wet-body ledgers and geometry
already exist. Root access, salinity, soil-water storage, channel stage and
seasonal reliability do not. Model one explicit annual game-scale opportunity
from the available products, then test its controlling downstream consequences.
Scientific Earth remains a benchmark, never hidden procedural input.

## Selected Discriminator

Retain the two atmospheric indices and compute two separately named plant
indices in the existing Hydrology land-water-budget operation:

```text
M_atmosphere = P + 0.35 H
A_climate   = D / (D + P + 1)
M_plant     = M_atmosphere + L
S_plant     = D / (D + P + L + 1)
```

`L` is local annual surface-water opportunity per represented dry-tile area, in the
existing empirical rainfall-index scale. It is not delivered water, withdrawal,
root uptake, actual evapotranspiration or measured soil saturation. `S_plant`
retains the existing smooth dryness-ratio family; it is not FAO's crop-stress
coefficient. Zero access preserves the present ecological baseline exactly.
More admitted supply raises plant moisture and lowers stress; increasing demand
alone must not manufacture moisture.

Here `D` is the unchanged post-albedo `computePotentialDemand` Number-array
result used by the ecological budget, not baseline climate demand or rounded
public `pet`. Replay it from retained final temperature, baseline humidity and
the same demand parameters. Wet-body flux ledgers retain their original
pre-network demand vintage; this contrast does not rewrite physical accounting.

The distinction between climatic evaporative demand and plant water limitation
is supported by [FAO's demand treatment](https://www.fao.org/4/X0490E/x0490e0a.htm)
and [root-zone water-stress guidance](https://www.fao.org/4/X0490E/x0490e0e.htm).
Those sources do not validate these game formulas or supply a biome calibration.

### Source And Access Definition

The existing ledger unit is rainfall index times unit-tile area. Each represented
tile has unit area; this is not a geographic square-kilometre conversion.
Use the existing wrapped hex neighbors and bounded north/south edges.

For ordinary exposed donor `j` outside hydraulic components, let
`K[j] = max(0, discharge[j] - runoff[j])`. This removes the donor's own
precipitation-attributed contribution before considering imported water.
Its contact set contains itself and distinct adjacent exposed dry cells whose
ground is no higher than the donor ground. Its offered opportunity is
`K[j] / contactCount[j]` on those contacts. Donor ground is a declared channel-
stage proxy; higher banks receive no default credit. Display river class is
neither source eligibility nor strength. Component exchange is not inferred
from incomplete grid discharge.

For each strict finite wet body `b`, collect distinct directly adjacent exposed
dry contacts with ground no higher than its declared head. Compute
`I[b] = flux.incomingOverflow + flux.wetPrecipitation` from the complete body
ledger and offer `I[b] / (wetCellCount[b] + dryContactCount[b])` to its dry contacts.
Body identity deduplicates repeated wet edges. A standing zero-outlet lake is
not treated as dry; maintained footprint and gross annual input differ from
outflow. Do not convert relief-volume storage into annual rainfall units.

At each dry receiver, `L` is the maximum offered ordinary/body contribution,
not their sum. This avoids additive edge/body amplification and exposes volume
sensitivity without an arbitrary wetness amplitude. It is not a conserved
withdrawal allocation: upstream/downstream offers may represent the same water.
Marine donors receive no terrestrial freshwater credit. Modeled atmosphere-fed
finite water is assumed plant-compatible for this discriminator; open/closed
topology does not prove freshwater or salinity. No salinity or permanence claim
follows. All terrestrial outputs remain zero on resolved water.

## Complete Consumer Path

Keep `effectiveMoisture` and `aridityIndex` atmospheric. Add explicitly named
plant moisture/stress to the same existing `climateIndices` publication. The
implementation remains unadmitted until qualification; no new artifact family
or stage is needed.

| Consumer | Selected meaning |
| --- | --- |
| Thermal-zone transition context and snow | Existing atmospheric moisture, unchanged |
| Polar biome moisture bucket and dryward shift | Existing atmospheric moisture/climatic aridity; local supply does not manufacture snow |
| Nonpolar local biome moisture bucket and dryward shift | Plant moisture and matching plant stress |
| Vegetation density and forest/rainforest growth | The same plant moisture/stress, existing energy, freeze, soil and fertility |
| Taiga's existing water habitat band | Atmospheric moisture context; plant stress relieves its growth penalty without claiming waterlogging |
| Savanna/steppe dry-habitat bands and savanna planner aridity gate | Existing atmospheric moisture/climatic aridity context; plant-responsive biomass remains distinct |
| Oasis/watering-hole climatic dryness | Existing climatic aridity, unchanged |
| Marine habitat and rainfall/humidity-based soil | Existing marine and atmospheric owners, unchanged |
| Botanical natural-wonder moisture terms | Plant moisture; existing bounded suitability law, no threshold recalibration |
| Resource climate/geology/wet-habitat masks and start climate comfort | Existing atmospheric context; lawful class/density consequences remain available |
| Feature planning and native projection | Lawful local biome, terrain, occupancy and Civ compatibility; no bypass |

Hydrology owns the calculation in `compute-land-water-budget`; climate-refine
wires admitted inputs and publishes outputs. Ecology's existing classifier,
substrate and planners consume the selected indices. Rules do not move into
steps. Resource, wonder, start and plot-effect consumers are classified by
their actual climatic versus ecological meaning, not switched indiscriminately.
The current taiga score rejects water values at or above `0.9`; savanna and
steppe reward a band of dryness. Extra usable water is not evidence of harmful
waterlogging or a newly vanished dry season. Retain these declared climatic
habitat contexts in the discriminator, rather than feeding every score argument
the plant ratio. This preserves their existing approximation for review, not
physical validation of those band thresholds.

The resource owner mixes climatic, geological, wet-habitat and growth predicates
in its shared moisture/aridity inputs. Do not swap that entire vector. A future
selective growth or `aridWithoutWater` predicate repair belongs to resource-policy
design, not an indiscriminate promotion in this unit. Starts retain climatic
comfort. Botanical wonder moisture already has a saturating bounded score;
changing its input meaning does not establish a new scientific calibration.

## Alternatives

- **Selected for discrimination:** rainfall-equivalent wetting plus the smooth
  matching plant ratio. This is supply-sensitive and leaves climatic context intact.
- **Viable stronger interpretation:** full water-limitation relief at one
  demand-equivalent of access. It introduces a stronger response assumption;
  not selected without evidence that the smooth response misses the owner.
- **Rejected as the completed story:** score-only stress relief, fixed `+8`
  wetness, `D * opportunity` moisture credit, or assigning maximum wetness to
  any finite contact. These respectively miss category admission, add a gain,
  manufacture supply with demand, or confuse contact with ecological state.

## Retained Discriminator Decision

The fixed Huge `2/2` and Standard `1/1` retained contrasts reproduce the incumbent
and pass the fifteen source/access controls, including exact no-access behavior.
Opportunity varies spatially and by source magnitude. Finite-body offers have
controlling effects beyond ordinary flow, including lawful conditional feature
eligibility. This justifies one owner implementation and qualification, not a
release claim or a historical tree-count target.

The contrast also exposed two consumer-meaning errors. Polar moisture lookup
could flip snow/tundra despite unchanged temperature, freeze and actual snow;
it must retain atmospheric context. The savanna planner's broad aridity gate
must likewise remain climatic. These are prospective consumer corrections;
the frozen source/access law, gain and scope remain unchanged. Retained input
replay lacks full original soil/publication/intent evidence, so actual recipe
qualification must close that gap before adoption.

Access is deliberately coarse: adjacent dry shore samples generally sit at or
above finite-body head, and this law admits only at/below-head contacts. It is
annual surface opportunity, not a complete riparian/rooting/groundwater model.
The observed saturated upper tail is a qualification risk, not permission to
invent a retrospective shoreline-coverage or forest-count ceiling.

## Expectations Before Execution

Use only the retained, SHA-bound current Huge `2/2` and Standard `1/1` captures.
First prove source arithmetic and consumer replay of the incumbent. Then trace
candidate source -> availability/stress -> class -> density/score -> lawful
feature eligibility, with at-head shore, elevated bank, ordinary flow,
unclassified interior, no-access and marine controls. Do not regenerate maps,
run a thermal fit or restore any former forest as an entitlement.
Include the known synthetic cold-forest upper-water-band witness and dry-family
band controls within this same contrast; no separate calibration campaign.

| Contrast | Required outcome |
| --- | --- |
| No admitted source | Exact current ecological inputs and classification |
| Increased supply, fixed geometry/demand | More moisture, no greater stress |
| Increased demand, fixed supply | Same plant moisture, no lower stress |
| Tiny versus large equal-fraction flow | Different wetting magnitude before consumer saturation |
| More represented contact area, fixed supply | No greater per-area offer |
| Duplicate body edges or relabeled river hierarchy | Exact invariance |
| Common ground/head datum shift | Exact invariance |
| Higher-than-source bank, marine or component sentinel | No invented freshwater source |
| Atmospheric/climatic context and physical products | Exact hold |

Observe localization, magnitude, warm-land activation and all category/density/
score changes, not just positive opportunity or vegetation totals. Refuse a
nearly uniform greening response, an unexplained climatic-context change,
invalid native intent, nonlocal cliff credit or a mechanism too weak to reach
its controlling consumer. A useful signal need not restore a historical tree.

If the retained-input discriminator passes review, implement this one owner
story, run focused directional tests and exact recipe comparisons, then the
unchanged complete map-selected bank, full owner checks and fresh bounded
native realization. Preserve every existing requirement and the known thermal
failure. The installed qualified build remains in use until this unit earns
adoption. No groundwater, atmosphere, soil or island redesign is its prerequisite.

## Completed Causal Qualification

The sealed `5f82b5f1f39040e83d909793eb296fc526420511` implementation is compared
with the atmospheric-retirement incumbent
`fda02f26040a47f6bbd78ef685c1ad4fe909cc05`. Actual Huge `2/2` and Standard `1/1`
public captures close against separate complete recipe publications, including
pedology, sediment, all feature scores, vegetation intentions and plot effects.
Unrounded demand, substrate and jungle calculations are explicitly source-owner
replays, not invented raw step publications. The reduction executes no maps.

Each pair preserves 50 public physical/atmospheric fields and 23 complete raw
artifacts exactly. Source arithmetic, matching plant stress, no-access category,
density and growth consumers pass. Polar category remains unchanged. Marine,
wetland and ice score families remain unchanged; floodplain types follow the
changed lawful biome. The new Standard capture copies both published plant
indices rather than recomputing them. The rainforest habitat measurement uses
the same plant-moisture meaning as its planner, with the existing `85`, `16 C`
and `0.18` gates unchanged; savanna retains climatic aridity.

| Actual pair | Exposed land | Positive opportunity | Ordinary/body winners | Changed projected biomes | Changed final features |
| --- | ---: | ---: | ---: | ---: | ---: |
| Huge `2/2` | 2,501 | 1,644 | 1,581 / 63 | 721 | 430 |
| Standard `1/1` | 1,506 | 944 | 915 / 29 | 387 | 205 |

Finite-body winners change 52/20 local classes and 33/10 final features, so the
lake path reaches controlling consumers. Zero-access final features remain
exact, and there are no illegal headless ecosystem features or policy-rejected
intentions in either pair. Resource redistribution is separate collateral:
59/41 no-access resource cells change, with closed plans and total placements
`235 -> 236` / `218 -> 221`. Exact resource identity everywhere was not promised.
Changed categorical IDs are transitions, not numeric evidence of improvement.

The historical complete bank retains all 57 scenarios and 4,430 expectation
identities/comparators. Its only new failure is Desert Mountains seed
`1538316523`: 33 rainforest tiles against the old absolute cap of 20. A separate
actual capture observes 3,418 exposed-land tiles, zero habitat/legal violations,
and 15 sites that cross the existing moisture gate only with plant water. This
is retained failed-policy evidence, not a relabeled pass or proof of independent
arid calibration. No additional arid-only study or gain sweep is selected.

### Explicit Benchmark-Scope Amendment

The subsequent human decision makes procedural Earthlike the core baseline.
Desert Mountains and Sundered Archipelago remain configuration stress products,
not baseline release gates while this pipeline is being established. Remove the
underived absolute rainforest cap outright, rather than raising it or filtering
water-supported vegetation out of its count. Preserve structural/domain tests
and all physically meaningful Earthlike requirements, including the known
thermal failure. Default study selection must implement this decision, not merely
rename an active themed-map gate. The explicit all-config study path remains
available for later configuration qualification.

This is a prospective policy amendment under the benchmark owner, not a change
to plant-water physics or historical results. The Earthlike geography cohort
retains the existing four Huge seeds and generic geography/integrity guards;
themed-map appearances must not influence that cohort. Remaining Earthlike
appearance assumptions require independent review, not silent removal here.

### Completed Core Qualification

The built default CLI and definition fixture use the same whole-study selector.
The actual `1e7c7a67c93ff7161295f6dd4a06a3aa4c301282` core report evaluates 16
studies and all 47 retained Earthlike scenarios: 3,894 of 3,895 expectations pass.
The sole failure remains within-row land-temperature variation, observed
`0.139044 C` against the unchanged `1 C` requirement. All 15 retained studies
are exactly equal to their corresponding historical candidate evaluations;
the new geography declaration retains the four original Huge scenario rows
and targets, and its Earthlike-only cohort passes. This is not a relabeled
historical all-config run.

The dependency-ordered owner graph passes 1,367 definition tests, 371
realization tests, 412 Studio tests and 11 CLI tests; the definition aggregate
still fails only that thermal requirement. Builds, types and Habitat pass.
The standard runtime bundle is byte-identical to the implementation used for
the actual paired captures and native generation; the metrics bundle changes
only with the prospective study policy.

A final realization test-owner repair replaces the assumption that one Huge
Archipelago seed must produce zero lakes. The existing SDK test-publication
lifecycle supplies a controlled empty footprint with nonempty dry pool and
component records instead. Exact completed-plan correlation, fractional heads,
ordered records, bounded serialization and immutability remain asserted. This
is diagnostic-publication proof, not a new physical lake-model result or a
themed-map appearance gate.

### Bounded Native Delivery

All eight generated and installed files match for the sealed implementation.
The existing registered mod is redeployed and the game restarted without fully
quitting Civ. Fresh Huge `2/2`, ten players and the saved map configuration pass
the owning Run in Game gate in 32.27 seconds, including setup/load overhead.
At actual turn one, all ten founder plots are dry, non-lake and non-NAV. Fresh
scripting, modding, database and UI evidence is retained separately. The
climate-refine step completes in 18 ms in this native run.

The full 6,996-tile map is subsequently explored for player zero. This is a
bounded installation/loader/generation/founder witness, not new vessel path
proof, a complete final-surface census, or a claim that thermal banding is fixed.
The portable actual-pair viewer includes both atmospheric and plant indices,
source/access diagnostics, flow and final headless features; desktop and phone
layouts are checked. It is explicitly labeled headless evidence, not native
photography. Scientific root uptake, seasonality, salinity and Earth thermal
calibration remain unclaimed.
