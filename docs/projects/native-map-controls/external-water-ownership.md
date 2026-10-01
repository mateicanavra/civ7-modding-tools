# External Water Ownership Repair

## Decision And Scope

Selected for the next complete implementation story on October 1. This is a
design selection, not an implemented or calibrated production outcome.
Earthlike is the primary procedural product; Desert Mountains and Archipelago
are collateral stress cases. Scientific Earth and Firaxis Earth remain
separate benchmarks, not hidden recipe inputs.

The demonstrated defect is boundary-condition ownership, not a missing basin
solver. Initial wet geography currently implies an external drainage recipient,
structural-zero precipitation/demand and permanent projected wetness. Those
are three different decisions. The ten-cell Standard1346 discriminator proves
the existing solver can conserve and route that pocket as finite storage; it
does not select its forcing or native projection.

## One Boundary Prescription

After final Morphology island formation, prescribe the maximum-area connected
initial-water component as the procedural world ocean at the existing
`seaLevel`. Select all exact maximum-area ties, not an arbitrary scan-order
winner. Use the existing wrapped-X/clipped-Y hex component primitive. No wet
cells means no prescribed ocean; all-water geometry has one prescribed ocean.

This is generator intent, not a scientific classifier. Area, crust, polar
contact and seam contact do not prove salinity, hydraulic exchange or ocean
ancestry. The deliberate approximation is an effectively infinite principal
water body held at a fixed surface head. It can misdesignate a dominant closed
sea and does not support independently prescribed smaller oceans. Near-ties
can switch selection when geometry changes. Keep those policy counterexamples
visible; do not add size exceptions to conceal them.

An early anchor lifecycle is rejected for this stationary final-world model:
the current producer supplies no such lineage, so birth, burial, relocation
and split-survival rules would be newly invented behavior. If the product
later requires ocean ancestry or multiple independent oceans, reopen this
decision rather than claim component area supplies that history.

## Owned Quantities

| Quantity | Authority | Meaning |
| --- | --- | --- |
| Initial wetness | Morphology final topography | Geometry presented to the existing climate calculation; not infinite supply |
| External water declaration | Morphology final topography | Independently computed `externalWaterMask`, a subset of initial water; uniform head is the existing sea datum |
| Finite storage and channels | Hydrology geometry/budget/network | Every non-prescribed cell is eligible, including initially wet inland pockets |
| Resolved exposure | Hydrology truth product | `!externalWaterMask && !finiteWetMask`; initially wet cells may become dry |
| Native water category and appearance | Civ realization | Projection/classification of resolved physical truth, not its author |

The declaration is not an alias of `landMask`. One newly owned binary array
plus the existing datum expresses this selected boundary. Per-component IDs,
anchor records, head arrays, another artifact catalog and a second solver are
not needed by this design. Keep complete schemas owner-local, sharing only the
declaration atom where the operation and artifact genuinely use the same fact.
The existing island-topography operation publishes the complete final product;
the recipe step only forwards it through the supported SDK.

## Hydraulic Head Is Required

The current drainage and network rules compare reservoir bed elevations and
have no prescribed receiving head. An external mask alone creates an absorbing
sink, not the promised fixed-head ocean. Do not attach an unused head label or
rewrite physical ground to conceal that missing contract.

Hydrology must distinguish finite ground from external receiving surface in
raw descent, saddle crossings, outlet/port selection and validation. Changing
submerged reservoir beds while holding footprint and head must not change
finite hydraulic outcomes merely through irrelevant bathymetry. Finite-cell
ground and hypsometry remain unchanged. Export cannot occur uphill into a
higher receiving surface merely because its bed is low.

Retain an outflow-only external boundary approximation for this story. Admit
only geometry where the prescribed head cannot inundate additional finite
ground through a below-head connection. Otherwise return an explicit witness;
do not silently increase a sill and pretend inward ocean supply is modeled.
Qualify below/equal/above-head crossings and level ties at the owner. The
current coordinator represents nonnegative outward deliveries, not arbitrary
ocean-to-basin exchange.

## Wet Forcing And Accounting

Use the current atmospheric chain, not a constant, neighbouring land copy or
all-land mask. Compute precipitation's humidity response, convergence and
deterministic texture over all surfaces; apply terrestrial coastal/lowland
bonuses and orographic uplift only on initial land. Evaluate the unchanged
temperature/humidity potential-demand equation on all surfaces and remove its
now-unnecessary `landMask` input from the contract and callers.

These remain empirical rainfall-scale indices, not mm/day or independently
calibrated open-water evaporation. Preserve Number precision and the existing
forcing vintage. The basin budget already counts incoming overflow plus dry
runoff outside the finite wet footprint plus precipitation inside it, minus
wet demand. Wet P-D replaces that cell's dry runoff; it is not added twice.
Normalized atmospheric moisture injection is not another basin-loss receipt.
Newly exposed initial-water cells must have legitimate dry-runoff coverage.

Initial wet geometry retains its current prescribed-water thermal/moisture
approximation. Hydraulic prescription does not turn finite lakes into land
for climate, nor establish a feedback-converged final-surface climate. A body
that dries can therefore have been solved under initial-wet forcing. Improving
that one-way approximation needs a demonstrated finite-water thermal/source
law, not an unreviewed coupling loop inside this repair.

## Complete Story And Proof

1. Implement the final producer declaration and exact binary/subset/datum
   admission at the existing operation/artifact owners. Preserve all terrain,
   random draws, initial masks and formation laws. Test empty/all-water,
   unequal components, exact ties and translated wrapped connectivity.
2. Complete receiving-head semantics in the existing geometry/network and
   validators. Hold finite ground/hypsometry; vary only external bathymetry
   or head. Test no uphill exports and explicit unsupported inundation.
3. Supply all-surface forcing through existing operations. Require exact
   initial-land precipitation/humidity/demand arithmetic and held upstream
   thermal/pressure/wind/current/moisture transport. Wet precipitation must
   not depend on submerged bed gradients or terrestrial bonus settings.
4. Publish resolved exposure from the owning Hydrology computation. Migrate
   runoff, network classification/metrics, coast/shelf use, terrain, ecology,
   lake/elevation projection and parity according to initial geometry,
   external authority or final exposure. No originally wet cell remains wet
   solely because of its initial classification; no consumer reroutes water.
5. Replay Standard1346, then the retained public cohort: 47 Earthlike cases
   plus ten stress cases, using existing catalog/presets/seeds/setup. Require
   once-only forcing, conservation, complete finite footprints and honest
   changed downstream results, not frozen old lake-plan hashes. Retain the
   active Earthlike thermal expectation without weakening it.
6. Build/deploy and inspect native low-head/closed/below-sea projection from
   resolved truth. Derive intended-lake/protected-nonlake requirements only
   then. Qualify cliff/through-water connections and era-appropriate stock
   control plus actual vessel paths/autoplay separately.

No production adoption before the complete consumer handoff and owning proof
pass. No fallback execution lane, new global tuning control, new harness,
native carving or blanket LakeSizeCutoff is introduced. The SDK simplicity
review is aligned with the minimal shape; the Earth basin review requires the
head-aware revision above. Repeat both bounded reviews against the actual
patch, not just this design.

Sources: [single question sheet](calibration-question-sheet.md#derived-classification-policy),
`compute-island-topography`, `compute-drainage-basins`, `compute-basin-network`,
`compute-precipitation`, `compute-potential-demand`, the current network step,
and the SDK's `collectMaskComponentsOddQ`. See the
[delivery inventory](delivery-inventory.md) for implemented versus open work.
