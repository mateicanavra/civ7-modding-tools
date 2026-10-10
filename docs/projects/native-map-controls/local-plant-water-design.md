# Local Plant-Water Response

## Frame And Status

Prospective retained-input discriminator after the atmospheric-proxy retirement
in PR #2347. The desired outcome is local ecological response to admitted
river/lake water, not more trees everywhere, restored historical counts or a
second atmospheric calculation. No response law below is production-admitted.

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

`L` is local annual wetting opportunity per represented dry-tile area, in the
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
plant moisture/stress to the same existing `climateIndices` publication only
if the discriminator earns production adoption. No new artifact family or stage.

| Consumer | Selected meaning |
| --- | --- |
| Thermal-zone transition context and snow | Existing atmospheric moisture, unchanged |
| Local biome moisture bucket and dryward shift | Plant moisture and matching plant stress |
| Vegetation density and forest/rainforest growth | The same plant moisture/stress, existing energy, freeze, soil and fertility |
| Taiga's existing water habitat band | Atmospheric moisture context; plant stress relieves its growth penalty without claiming waterlogging |
| Savanna/steppe dry-habitat bands | Existing atmospheric moisture/climatic aridity context; plant-responsive biomass remains distinct |
| Oasis/watering-hole climatic dryness | Existing climatic aridity, unchanged |
| Marine habitat and rainfall/humidity-based soil | Existing marine and atmospheric owners, unchanged |
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
