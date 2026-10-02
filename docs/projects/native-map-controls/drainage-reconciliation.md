# Physical Drainage Reconciliation

**Goal:** Realize physically coherent river corridors without repairing terrain
or inventing drainage in the Civ7 adapter.
**Status:** Causal investigation complete; terrain/basin design under review.
**Owner:** Native map-controls workstream, Swooper Morphology and Hydrology.

## Causal Finding

This is a terrain/water-model mismatch exposed by native authorship, not a
stale config or an elevation-encoding bug. Earthlike's accepted climate changes
remain the baseline. Native qualification is in [rivers.md](rivers.md).

1. Morphology erosion uses an earlier raw-downhill routing proxy. Its stream
   power clamps negative slope to zero, so it does not cut through spill rims.
2. Hydrology reads final terrain afresh, then priority-fills depressions for
   routing without changing the ground. Its receiver graph can climb through
   a raw depression while remaining level on `routingElevation`.
3. The elevation projection correctly preserves raw ground-height order. The
   virtual water-routing surface is not the ground sent to Civ7.
4. Native river finalization removes the tested uphill land segments, including
   with aesthetic validation disabled. Dropping those segments would fragment
   our network; adapter-local rerouting would create a second network owner.

Relevant definition sources (under `plugins/mod/map/swooper-physics/src`):

- `domain/hydrology/modules/hydrography/ops/compute-drainage-routing/rules/index.ts`
- `domain/morphology/modules/erosion/ops/compute-geomorphic-cycle/rules/index.ts`
- `domain/hydrology/modules/hydrography/ops/plan-lakes/strategies/sink-discharge-budget/index.ts`
- `recipes/standard/elevation-projection.ts`

ADR-008 assigns terrain shaping to Morphology and canonical water movement to
Hydrology. It does not decide whether a specific basin fills, breaches, or
retains water. Final topography remains immutable after publication.

## Measured Baseline

Deterministic public-recipe replays use current Earthlike, map/game seeds equal
to the named seed. Counts below use physical land-to-land river receivers.

| Case | Minor uphill / all | Major uphill / all | Selected navigable uphill / all |
| --- | ---: | ---: | ---: |
| Huge 1018 | 49 / 295 | 104 / 416 | 13 / 38 |
| Standard 1 | 20 / 166 | 58 / 272 | 15 / 48 |
| Standard 42 | 36 / 194 | 58 / 251 | 9 / 42 |
| Standard 1018 | 26 / 211 | 53 / 253 | 2 / 23 |

All 153 uphill Huge edges are level on the conditioned routing surface;
137 touch neither planned lake endpoint. Of the 38 selected navigable tiles,
28 have an uphill link somewhere downstream. Removing only the 13 immediate
violations is not a connected solution.

The Huge intended height buffer matches all 6,996 values in the earlier native
elevation receipt. Using actual post-write native heights still leaves 151
uphill edges (47 minor, 104 major); excluding edges touching an accepted native
lake still leaves 138 (46 minor, 92 major). Headless and native accepted-lake
masks differ, so these counts use their respective masks and do not claim full
mock/native lake parity. A concrete non-lake edge is 248 -> 249: raw heights
17 -> 27, intended native heights 188 -> 288, conditioned heights 27 -> 27.

## Counterfactuals, Not Implementations

In-memory experiments compared two deliberately simple alternatives. Elevation
deltas below are physical model units, not meters or sediment volumes.

| Case | Fill changed cells / summed rise / max | Channel lowering cells / summed fall / max | Rerouted receivers after lowering: all / river |
| --- | ---: | ---: | ---: |
| Huge 1018 | 393 / 2160 / 18 | 188 / 1042 / 18 | 145 / 17 |
| Standard 1 | 173 / 1226 / 27 | 102 / 775 / 22 | 72 / 6 |
| Standard 42 | 220 / 1195 / 19 | 118 / 651 / 19 | 76 / 2 |
| Standard 1018 | 236 / 1133 / 22 | 96 / 453 / 22 | 100 / 11 |

Both eliminate uphill edges on the frozen graph without original water changes
or sea-level crossings. Neither is an accepted physical model.

- **Blanket fill:** substitutes `routingElevation` for ground, modifying
  10.3-14.4% of land. Huge includes 46 mountain and 82 hill cells, with only 19
  changed cells in the planned lake mask. Fresh routing is identical in all
  four cases, but the local-minimum predicate counts flats as sinks, changing
  Huge sink count from 320 to 541. This is not a neutral projection fix.
- **Channel-only incision:** the minimum lower-only surface satisfying current
  classified river edges, permitting flats. It is a useful lower bound, not
  geomorphic simulation. Fresh authoritative routing changes the receivers
  listed above; preserving the frozen graph would hide that feedback.
- **Return to local steepest descent:** rejected as a destination. It revives
  the fragmented drainage problem that ADR-008 explicitly addressed.

A subsequent full-drainage-graph lower-only closure, independent of river
classification, produced a more coherent bounded candidate:

| Case | Lowered cells / summed lowering / max | Fresh changed receivers: all / existing river |
| --- | ---: | ---: |
| Huge 1018 | 307 / 1851 / 18 | 208 / 18 |
| Standard 1 | 145 / 1143 / 27 | 98 / 9 |
| Standard 42 | 179 / 1012 / 19 | 112 / 7 |
| Standard 1018 | 166 / 848 / 22 | 128 / 9 |

Fresh routing has zero uphill land edges, zero positive-depth cells, and zero
closed terminals in all four. Original water and land/sea identity are
unchanged. It lowers 8.6-11.2% of land and removes all measured depression
storage; this trade-off must be explicit. Climate, discharge and river classes
were not recomputed in these in-memory experiments, so they are not a study
pass or a physical-model acceptance receipt.

Applying the same treatment to eroded topography before island materialization
gave identical cell/sum/max deltas and the same zero-uphill final routing in
all four cases. Islands added 58/45/42/39 cells respectively without reopening
depressions. This supports the existing stage order for this candidate.

## Design Direction And Open Choice

Prefer a Morphology-owned spill-corridor treatment before final topography and
climate, then ordinary Hydrology recomputation. Keep substrate, relief and
genuine basin evidence coherent. Do not carve late, climate-classified rivers
and then pretend earlier climate and landforms still describe the result.

The remaining choice is real: which depressions represent retained basins, and
which barriers should a bounded terrain treatment breach? Existing contracts
do not answer it. Existing lake planning ranks positive-discharge local minima
and optionally expands upstream; it does not read basin geometry, spill
height, depression depth, evaporation or erodibility. It therefore cannot
distinguish a retained basin from a flat created by filling or breaching.
Blindly reusing that selector would not preserve meaningful lakes.

Feeding priority-flood receivers to the old erosion formula alone cannot fix
this: uphill links still receive zero stream power. Retuning strength does not
change that zero. The design must name the actual terrain treatment and the
retained-basin semantics before implementation, rather than conceal them in a
numeric knob or a native special case.

Island materialization only changes admitted base-water tiles to
`floor(seaLevel) + 1`; it does not raise existing land. Investigate whether the
treatment fits the existing erosion stage before adding a new stage or
topography vintage. Final-surface tests must establish this, not an assumption.

Independent review narrowed the meaningful alternatives:

- **Recommended bounded through-flow model:** reconcile the complete
  geomorphic escape graph, then reroute Hydrology on the resulting terrain.
  Keep genuine pre-treatment depression origins as landform evidence,
  revalidate their equal-height floor footprints, and select wet shallow lake
  sites within those footprints. Replace arbitrary upstream lake expansion.
  This does not preserve deep storage or endorheic basin semantics, and is a
  geometric terrain approximation rather than sediment-conserving erosion.
- **Retained closed basins:** selectively breach affordable corridors and
  leave expensive basins as explicit inland terminals. This additionally needs
  a defensible breach-cost policy and real basin/overflow semantics; neither
  exists today. It must not recreate a terminal at every raw pit.

The initial preference request above conflated depth, outlet status and wetness.
On 2026-09-28 the user approved the revised basin-aware Earthlike direction:
preserve meaningful basins and represent their water surfaces and outlets,
rather than removing all depression storage to unblock native authorship.
An open lake can have a deep bed; a closed basin can be wet or dry. Full-graph
lowering remains a measured comparison, not production implementation authority.
Neither option establishes native through-lake navigation. The next design
must define a bounded physical representation and policy, not require a full
numerical water-balance simulator by default. Relief coherence studies precede
behavior changes, as recorded in WORKSTREAM.md.

## Sequencing And Parallelization

Continue the same worktree and Graphite stack; no parallel production planner.

1. Commit native qualification and the additive adapter writer/finalizer
   contract independently. The latter must not switch production behavior.
2. Close the retained-basin and terrain-treatment design with architecture and
   physical-model review. Record the selected approximation and its exclusions.
3. Implement the smallest coherent physical treatment at its owner, recompute
   canonical drainage, and remove the displaced proxy/selection computation
   only where all consumers have a truthful replacement.
4. Implement symbolic minor/navigable projection over that resulting graph;
   consume accepted lake evidence, finalize once, refresh water data, and
   reconcile classes independently of network membership and direction.
5. Run the existing study bank and saved Huge Earthlike native test, then retire
   terrain stamping plus procedural `modelRivers` and proven-obsolete repair.

Parallel work is read-only model/architecture review and additive adapter
verification. Root serializes graph builds, Git, deployment and live Civ7.

## Acceptance And Guards

Predeclare numeric terrain bounds after selecting the treatment, before tuning.
The following invariants already apply:

- No ordinary land river link climbs its authoritative ground receiver unless
  it has explicit, physically justified water-body/spill semantics that the
  native representation actually supports. No silent exclusions or reroutes.
- Original continent mask, coast and bathymetry stay fixed unless the reviewed
  model explicitly requires a change; every height delta is attributable.
- Recompute routing after terrain change; require acyclicity, adjacent
  receivers, conservation and typed terminals, not frozen-graph invariance.
- Preserve bounded, geometric lake/basin meaning instead of retaining a lake
  count by selecting arbitrary flats. Native lake acceptance remains separate.
- Re-run relief/substrate, climate banding/orography, river hierarchy, ecology,
  resource/feature legality, starts, determinism and runtime studies. No
  amendment of failed bounds without an explicit rationale and fresh run.
- Prove actual minor tributaries and connected navigable suffixes in Civ7.
  Observe ocean connectivity only after the water-cache refresh. Membership
  lists do not prove directed-edge parity or through-lake continuity.

This packet records an unresolved physical design prerequisite, not completed
native river integration. No counterfactual terrain has been installed in Civ7.
