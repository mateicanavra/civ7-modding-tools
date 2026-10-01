# External Water Ownership Repair

## Decision And Scope

Selected and implemented as one water-owner repair on October 1. Owner-level
verification and the complete consumer handoff pass; scientific acceptance,
native projection and gameplay qualification remain distinct open outcomes.
Earthlike is the primary procedural product; Desert Mountains and Archipelago
are collateral stress cases. Scientific Earth and Firaxis Earth remain
separate benchmarks, not hidden recipe inputs.

The demonstrated defect was boundary-condition ownership, not a missing basin
solver. Initial wet geography previously implied an external drainage recipient,
structural-zero precipitation/demand and permanent projected wetness. Those
are three different decisions. The ten-cell Standard1346 discriminator proves
the existing solver can conserve and route that pocket as finite storage; it
does not select its forcing or native projection.

## One Boundary Prescription

After final Morphology island formation, prescribe every connected initial-water
component that reaches the clipped north or south Y exterior at the existing
`seaLevel`. Use the existing wrapped-X/clipped-Y hex component primitive. This
is the procedural domain's explicit exterior boundary condition, independent
of component area. Separate north and south seas are both external; a larger
enclosed body remains finite beside a smaller exterior sea. No wet cells means
no prescribed ocean; all-water geometry has one prescribed ocean. Fully
enclosed/no-exterior geometry is entirely finite, without a maximum-area fallback.

This is generator intent, not a scientific classifier. Y-exterior contact,
crust and seam contact do not prove salinity, hydraulic exchange or ocean
ancestry. Only the selected boundary prescription gives those exterior-connected
components effectively infinite supply at a fixed surface head. Enclosed
below-sea pockets retain finite storage and forcing. A true longitude-winding
water component with no Y contact also remains finite; independently declaring
such a sea is a product limitation to reopen only with a demonstrated case,
not a speculative extra winding algorithm.

An early anchor lifecycle is rejected for this stationary final-world model:
the current producer supplies no such lineage, so birth, burial, relocation
and split-survival rules would be newly invented behavior. If the product
later requires ocean ancestry or a different exterior topology, reopen this
decision rather than claim component connectivity supplies that history.

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

The former drainage and network rules compared reservoir bed elevations and
had no prescribed receiving head. An external mask alone creates an absorbing
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
   separated exterior seas, larger enclosed bodies, no-exterior geometry and
   translated wrapped connectivity.
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

## Implemented Handoff And Evidence

The topography producer now declares `externalWaterMask` independently of its
initial land mask. Existing drainage, storage and network operations consume
that required declaration and the receiving head. The network publishes
`exposedLandMask`; consumers no longer reconstruct it from initial geography.
There is no optional legacy fallback or second lake solver.

Final landmass identity and shoreline are computed after Hydrology with the
existing domain operations. The new resolved-shoreline step is sixteen lines
of composition, not a new coastline algorithm. Terrain, ecology, coast/shelf,
resources, starts, projection and parity use the appropriate initial,
external or resolved vintage. Late Civ maintenance reapplies this same resolved
coast policy instead of restoring initial water over newly resolved lakes.

Independent Earth-basin and SDK-simplicity reviews accepted the first owner
patch, which used the principal maximum-area declaration described below. The
SDK review found one stale shelf/shoreline metric population; its
external-water guard and regression test are repaired. Source, test and script
types pass, as do the app's 271 realization tests and Studio's 412 tests.
Focused owner and composition tests covered prescribed ties, wrapped connectivity,
head and bathymetry invariance, unsupported inward supply, all-surface forcing,
final exposure and shoreline publication. No scientific target changed.

The pinned public bank was executed twice for separate purposes: 57 complete
artifact captures and 57 public metric evaluations. All 56 artifacts per case
are retained with reconstructible typed-array payloads (3,192 artifact records).
Independent checks pass for finite/external/exposed/wet partition, once-only
finite source ownership, wet-body coverage, unchanged dry ground and conservation.
All 28 unaffected upstream artifacts match the immutable preceding capture;
initial topography matches after excluding only the added declaration.

The 22-study evaluator retains six failures: Standard1337 lake share
`0.442667574 > 0.2`; annual within-row thermal variation `0.133519731 < 1 C`;
mountain-region flat share `0.333919156 < 0.35`; and three start-resource
floor/equity/shortfall expectations. These are calibration and placement work,
not permission to waive gates or pretend conservation alone proves playability.

Receipts and exact per-case payloads are in the durable Civ user-data location:
`VisualAtlas/huge-1018/earth-calibration/water-owner-cohort-20261001/`.
`capture/receipt.json` SHA256 is
`9f7bd51d44a0eeeb883dbde72a518b93a94c9389a6fd33fc5d8a6d631003610e`;
`capture/public-metric-failures.json` records unchanged comparators and complete
scenario membership. `payload-verification.json` independently reconstructs
all 3,192 artifact hashes. The [current generated Huge1018 viewer](https://mateis-macbook-pro.taild8da1c.ts.net/civ/water-owner-huge-1018/index.html)
shows this resolved network; it is not a new native screenshot or navigation
proof. Native low-head, cliff and through-water qualification follows this repair.

## Exterior Revision And Principal Capture History

The first October 1 public capture used the principal maximum-area prescription,
including exact area ties. Its immutable receipt and all 57 payloads above
remain the evidence for that version, not results for the exterior revision.
The ensuing diagnosis supplied a concrete product counterexample rather than
a reason to change the finite solver, lake-share ceiling or relief floor.

Standard1337's held final topography contains separate north and south initial
sea sheets of 1,597 and 1,065 tiles. They were already separate before erosion
and island formation. The principal rule prescribed only the north sheet;
the south sheet became finite wet storage. Of the 1,301 planned lake tiles,
1,211 were initially wet finite cells and only 90 were newly inundated initial
land. The preceding same-ground capture contains those exact same 90 land-lake
tiles. Two truly enclosed initial-water components, 142 and four tiles, remain
finite under the exterior revision. No crust or salinity assertion follows.

The existing formation chain selects a global hypsometric sea datum, reconciles
land/water identity to it and admits volcanic islands. It publishes no ocean
birth/ancestry distinction. The revised producer therefore states the bounded-Y
exterior intent directly from its final geometry, without area thresholds,
anchors, extra history or a compatibility fallback. An offline census of the
57 pinned geometries changes 33 of 47 Earthlike and four of five Desert masks,
and none of five Archipelago masks. Adding true longitude winding to Y contact
would change none of those results; no such additional law is introduced.

Huge1018 also traces part of the relief failure to that same boundary choice.
All 19 newly wet cells removed from its old mountain-region population belong
to the finite pool containing an 88-cell north-exterior sea sheet: ten old
flats and nine old hills, with pool head 30 versus sea datum 11. The old ratio
was 409/1,168; holding old terrain masks but applying new exposure gives
399/1,149, already below 0.35. Recomputed provinces and roughland selection
further change it to 380/1,138. This is an attribution, not a prediction that
the exterior revision passes relief; rerun the unchanged public expectations
before designing a relief-owner correction. Do not restore hidden wet flats
to the denominator or tune a terrain quota to conceal the lost population.

The new declaration changes only the existing final-Morphology helper and its
focused tests. Finite receiving-head, storage, forcing, conservation and
projection laws are held. Independent Earth-basin review is aligned. The
rebuilt public proof now completes 57 artifact captures and 57 separate metric
evaluations under stable source/runtime pins. All 3,192 artifact payloads
reconstruct exactly, all 28 held upstream owners agree, and the partition,
receiving-head, source-accounting, ground and conservation guards pass.

This revision and the independently reviewed
[resource-backed start selection](start-resource-coherence.md) resolve the
prior lake-share and all three placement failures without changing their
comparators. Two expectations remain: annual within-row temperature variation
`0.1298053005 < 1 C` and mountain-region flat share
`405/1,168 = 0.3467465753 < 0.35`. The latter is seven old-flat to roughland
transitions offset by three reverse transitions on identical ground and
province membership; it is not permission to tune a class quota.

The separate revision receipt lives in
`earth-calibration/water-start-owner-cohort-v2-20261001/capture/receipt.json`,
SHA256 `e8cb9c05496b70db18d8720fb79fd511bfec4413dc98bb3a6b4661e43c984ede`.
The principal capture and earlier baseline are unchanged. These are generated
owner outcomes, not native lake classification, rendered head or ship passage.
