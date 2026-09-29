# Basin Coordinator Completion

**Goal:** admit climate-supported open, quantized closed and subtile drainage
without changing terrain or losing supply at equal-sill junctions.
**Status:** design reviewed, selected for implementation under the delegated
coherence loop; no runtime activation in this document.
**Owner:** Hydrology, with existing Standard projection and metric consumers.

This completes the demonstrated missing cases in [basin design](basin-design.md)
and [integration](basin-integration.md). It replaces the bounded
[all-open operation](basin-open-network.md), not the geometry or climate model.
The source prefix used below is `plugins/mod/map/swooper-physics/src/`.

## Decisions And Holds

- Keep the stationary, whole-cell, first-nonpositive-cohort law. A quantized
  closure is explicitly approximate: retain its lower wet footprint, complete
  signed bracket and positive unresolved residual. Residual is neither actual
  evaporation nor storage nor exported discharge. Do not invent a fractional
  height root or increase a floating tolerance to conceal it.
- Resolve incoming spill supply and saturated mergers before deciding final
  pool states. A zero-incoming certificate is not a production admission gate.
- Account for a connected equal-head reservoir/sill junction as one hydraulic
  component. Strict wet bodies and dry zero-depth connectors remain different
  memberships inside it. Reservoir exchange and component export are different
  quantities. One dry receiver cannot encode every internal exchange.
- Preserve the three cohesive products `hydrography`, `lakePlan` and
  `riverNetwork`; do not split them into property artifacts in this work.
- Preserve final ground, original marine mask, sea level, baseline forcing,
  source-runoff law, all climate coefficients and river-density policy. No lake
  quota, per-map selector, retry, partial lake admission, terrain breach, new
  simulator, or all-open/legacy fallback is introduced.
- Keep the seven legacy products unchanged. The authored certified selection
  remains explicit; no map-ID dispatch is added. Native category, leveling and
  navigation qualification remain separate from physical generation.

## Frozen Discriminators

Evidence directory:
`~/Library/Application Support/Civ7Tools/VisualAtlas/huge-1018/earth-calibration/basin-refusal-trace/`.
Its `summary.json`, `discriminators.json`, and four named case JSONs retain
original inputs, geometry, every local response and the exact failure. The
adjacent `basin-refusal-trace.mjs` and `basin-refusal-discriminators.mjs` replay
the real recipe/operations. Source digest for all four cases:
`0b70b06a2fdb169cb2adfb8ea7204aec947e543a6eb413564e1f1c6954f5f4e5`.

| Case suffix after `swooper-earthlike-` | Unsupported local roots | Required discriminator |
| --- | --- | --- |
| `huge-1018-noaa-annual-fit-retired-lapse` | 17 | No incoming root; genuine quantized closure |
| `standard-3-retained-refine` | 1, 23, 37, 39, 48 | Closed plus subtile states, not just first refusal |
| `standard-3-noaa-annual-fit` | 37 | Incoming-root support, then equal-sill runoff ownership |
| `standard-3-noaa-annual-fit-retired-lapse` | 1, 23, 37, 39, 48 | Closed plus subtile states under changed forcing |

Huge root 17 has catchment `[43,149,44,254,255]`, floor 22 and sill 25.
For `22 < h <= 24`, B = `+14.902249320942005`; for `24 < h <= 25`, B =
`-3.3123185752120605`. Cell 149 changes from dry runoff to P-PET. No real
height between those integers solves the existing piecewise-constant law.
Retain wet cell 43, level 24, no overflow and the complete uncertainty bracket.

Standard root 37's raw full-sill deficit is `-5.180561920716528`. Root 39
supplies `6.897626233496574` through `58 -> 59 -> 60`, making the pooled
surplus about `1.717064313`. Reversing dry connector 312 from 228 to 396
instead diverts its `7.303595294117648` runoff and leaves the wet reservoir
at about `-5.586530981`. The selected junction ledger must support the wet
reservoir and export the remaining `1.717064313`, not fabricate outward flow
from that reservoir. This is now a real case of the previously synthetic
dry-sill counterexample.

## One Authoritative Result

Replace `compute-open-basin-network` with `compute-basin-network`, strategy
`stationary-sill-spill`. Remove the displaced executable operation and its
public envelope after migrating callers; do not keep two selectable solvers.
Keep the artifact model discriminant `certified-sill-spill`: certification now
means the complete declared stationary approximation, not every pool open.

The operation returns one complete result or one typed nonstationary witness.
Malformed inputs remain errors. General closed/subtile states are successful
results, not unsupported wrappers. Genuine outlet-free persistent surplus
after the last cohort remains `no-stationary-solution`: no finite stationary
model can honestly guarantee success for that input without additional physics.

The result has these cohesive records, composed from module-owned schema atoms:

| Record | Meaning and ownership |
| --- | --- |
| Pool | Disjoint active catchment, descendant geometry leaf IDs, selected state, attained head/interval, supply ledger and closure evidence; no duplicated child supply |
| Wet body | One connected strict positive-depth footprint; body ID is minimum wet cell + 1, not a promise that a geometry root stayed intact |
| Hydraulic component | Connected common-head wet bodies plus admitted dry sill/plateau junction cells; owns mixed accounting and its sole selected external connection or typed terminal |
| Internal transfer | Adjacent equal-head exchange, or exchange between a contracted wet body and an adjacent junction; finite signed flow with canonical edge orientation |
| External port | Actual adjacent outward edge and destination component/dry reach/original marine, or an admitted original-land map-boundary exit; nonnegative export, never inferred from a geometric spill alone |
| Closure | Exact zero interval, or quantized level with retained wet cells, next cohort, before/after ledgers, and unresolved residual |

IDs are deterministic from final membership. `bodyId` and `componentId` are
separate map-grid membership arrays: body 0 outside strict wet footprints;
component 0 on ordinary dry reaches and marine cells. Component ID is minimum
member cell + 1. A subtile terminal has no wet body but a component anchored at
its minimum pit. Geometry node/leaf IDs remain explicit provenance, never
reused as terminal-catchment IDs.

`lakePlan` owns these water/component records, the complete binary lake mask,
physical water surface, state proof and global conservation. `hydrography`
owns attributed runoff, ordinary dry-channel routing/discharge/classification
and typed terminals. `riverNetwork` remains metadata over that result, not an
alternative router. Cross-product admission happens before any publication.

### Physical Level And Precision

Keep published ground Int16. Widen only physical `waterSurface` and relevant
operation inputs/capture copies to finite Number arrays with map-grid admission;
no Core typed-array framework addition is needed. Quantized closures use their
exact cohort level; open components use their exact sill. An exact-zero
interval remains recorded in full. Its computational representative is its
lower endpoint when inclusive, otherwise the next representable binary64 value
above it, checked against the upper bound. This selects an admissible head for
connectivity; it is not evidence of a uniquely determined physical level.

Do not round that head before testing `ground < head`. The wider contract is
needed for exact-zero intervals, not because quantized closures conceal real
fractional roots. Precise working ground for future incision remains the
separate [terrain-evolution design](basin-evolution-design.md).

## Finite Event Solve

Implement this inside the operation's rules; the recipe only composes ops.
`compute-basin-water-budget` and the coordinator continue to call the same
module-owned budget policy. No operation invokes another operation.

1. Validate canonical geometry, forcing and exact unique source attribution.
   Build the root overflow dependency DAG from recorded target leaves and
   containing roots. Geometry already guarantees acyclicity, including tied
   external batches; independently check it. This DAG is not the reciprocal
   sibling-spill graph. Preserve ordinary raw downhill tributaries.
2. Start each raw leaf as an active pool at its floor. Every original-land
   cell belongs to exactly one active catchment or direct-external drainage.
   Route a source to its first active pool/junction, not to every ancestor.
   A wet source contributes P-PET instead of dry R; incoming overflow is supply
   whose originating source cells are outside the active catchment.
3. Process root dependencies upstream first, then the root's finite
   fill/spill/merge events. A pool response is recomputed from its complete
   current catchment and current external incoming amount, never by appending
   an earlier response's residual as a new source. Closed/subtile pools export
   zero; open pools offer their actual positive surplus to the recorded
   receiving active pool, which is then reevaluated.
4. A closed sibling may therefore fill further when another sibling spills
   into it. When a spill reaches an already attained, connected equal-head
   pool, contract that saturated group and cancel internal exchanges before
   recomputing its total. Do not iterate reciprocal overflow around a cycle.
   Equal-height multifurcations are handled as one event. Only after every
   contained active child has attained their common merge head can the parent
   become the upward-search pool; unresolved lower children retain their own
   state and can receive overflow without being pretended saturated.
   After a partial sibling contraction, rebuild the surviving frontier from
   `geometry.saddles`: map endpoints to active groups and remove internal
   edges. Order remaining crossings by elevation and canonical endpoint IDs.
   A node's representative `spill` is not its complete boundary adjacency.
5. At each attained sill, admit its recorded zero-depth connector and the
   connected equal-height plateau junction, without inundating it. Resolve
   common-head hydraulic connectivity before final source routing. A connector's
   R belongs to the hydraulic component, even if the native/ordinary outward
   path points away from a wet reservoir. Common-head connected root components
   can contract at this event; their already counted incoming/outgoing exchanges
   cancel, not become extra supply. Lower-head receiving pools remain separate.
6. Reevaluate the combined pool ledger on the disjoint union of its owned
   sources and wet footprints. Advance through existing elevation cohorts only
   while all previous closures have been overcome. Stop on the first exact zero
   or positive-to-negative jump under the existing least-extent convention;
   never jump over a closed cohort because the full sill happens to be positive.
   A new external spill is offered only after its head is actually attained.
7. Finish a root/component before releasing its final export to downstream
   dependencies. Then construct ordinary dry reaches, internal hydraulic
   exchange ledgers, external ports and terminal records from the resolved
   component ownership. Independently recompute every flux from original inputs
   on that final partition and reject a disagreement before publication.

Identify incoming contributions by source and physical edge; store the current
absolute amount, not repeated additions. On contraction, cancel contributions
whose endpoints become internal and recompute remaining external supply.
Reordered or repeated delivery must not create water. Queue entries carry
component generations, so obsolete entries are discarded rather than mistaken
for current work or an algorithm failure.

Use a deterministic event queue keyed by spill/cohort height and canonical
node/cell IDs. Events advance a cohort, activate a spill, merge active groups,
or finalize a dependency. Within an unchanged active partition, the selected
pool response is monotone in additional external supply; outflow is zero until
the first admissible sill is reached, then increases with supply. Merges only
coarsen the active partition and cancel internal transfers. There are finitely
many cohorts, saddles and partitions reached by these one-way events. Assert
that each current-generation event crosses a new cohort, activates/delivers a
boundary, merges groups or completes a dependency; stale generations do no
work. Do not use epsilon convergence, an iteration cap, or an arbitrary retry
loop. A contradictory dependency or repeated current-generation event without
new state is an algorithm error with a retained witness, not a fallback.

## Junction Exchanges And Channels

The external accounting graph is ordinary dry vertices plus contracted
hydraulic components. It is a DAG with one chosen outward geometric connection
per open component, as in the existing deterministic outlet policy. Internal
equal-head exchange may branch; it is not forced into that singular receiver.

For each component, contract each wet body to a reservoir vertex, retain dry
junction vertices, and use physical adjacencies to construct a deterministic
BFS spanning tree rooted at its external port (or canonical terminal anchor).
Each dry vertex contributes its exact R plus external incoming; each reservoir
contributes its wet P-PET plus its direct incoming. Attach a quantization
residual to its owning closure as a distinct unresolved ledger term. A
postorder signed subtree sum gives the unique exchange on each selected tree
edge. Edge sign determines direction; do not clamp negative subtrees. The
external edge equals the component's nonnegative export. Tree construction
does not determine whether a pool is sustainable: the complete component
budget and state solve already did that. Verify every vertex and cut balance.

This is an algebraic, instantaneous mixing convention, not a Manning/weir,
water-depth, velocity or transient-storage simulator. Internal exchange
placement is deterministic but not claimed hydrodynamically unique.

Ordinary exposed dry cells keep one physical channel receiver and its actual
outflow. A dry junction may own multiple internal exchanges. Retain those in
the component ledger; select one principal channel attachment for the existing
map-grid channel product: its positive outward port when present, otherwise
the largest positive internal transfer, with receiver-cell tie breaking.
`discharge[cell]` on a junction means that selected edge's actual flux, never
the sum of all branches. All other edges are typed internal hydraulic exchanges,
not silently discarded river reaches. If no positive attachment exists, its
channel class is none and receiver is the component-internal sentinel.

The distinction must be explicit in schema descriptions and admission:
`flowDir` plus `discharge` is the ordinary/principal channel projection, while
the component graph and internal-transfer records own complete water transport.
Ordinary dry receivers remain adjacent and ground-nonascending. Junction
transfers are adjacent and equal-head; wet internal trees remain connectivity,
not independently accumulated discharge. Do not add a general multireceiver
grid or change legacy routing to accommodate this local hydraulic case.

## Terminals And Conservation

Use certified terminal roles `marine`, `boundary-export`, `closed-wet`,
`subtile`, and `dry`.
Their numeric grid tags are declared in a shared module atom, not magic values
spread among consumers. A component has one canonical terminal anchor; all
upstream membership derives its terminal ID from the contracted DAG. A wet
body ID, root ID or principal-junction receiver is not a terminal-ID shortcut.
Known closed terminals are resolved metadata, not mouthType zero/unresolved.

`boundary-export` denotes an explicitly admitted original-land north/south
map exit, not marine water or unresolved storage. Retain its actual boundary
cell and boundary side without inventing a receiving cell. Preserve valid
boundary-export geometry rather than refusing it as outlet-free surplus.

For each final pool/component and globally, verify:

`external incoming + dry R + wet P = wet demand + outward Q + unresolved U`.

U is zero for open, dry and exact-balanced states; a quantized closed/subtile
state retains its positive bracketed U. Prove its sign and bound using the
actual before/after ledgers, including the established finite-precision case
where subtracting those numbers rounds the jump to U. Sum U separately from
roundoff. Global outward Q is marine export plus boundary export, reported
separately; neither is forced to equal supply minus demand when U is nonzero.
The roundoff residual is the remaining arithmetic error after
subtracting explicit U, with a justified accumulation bound. Report absolute
and supply-normalized U; do not invent an acceptance quota for it.

No claim of exact stationary physical balance follows from a quantized closure.
This is the approximation already accepted by basin-design.md, now represented
honestly end to end. Any future continuous shoreline/storage model replaces
that law explicitly rather than pretending these residuals were evaporation.

## Classification And Native Projection

Classify ordinary/principal dry channel fluxes with the existing discharge
percentile policy; do not change its coefficients or targets. Derive contributing
area and Strahler-like metadata on the contracted component DAG, counting each
original-land source once. Members can report their shared component aggregate,
but it must not be summed per member or duplicated through internal branching.
First accepted wet-body endpoints and dry/subtile terminal endpoints are distinct.

Stamp every strict wet body in full. A subtile state has no positive-depth
tile and therefore no categorical native lake, but retains its basin terminal,
budget, catchment and residual; it is not a dropped planned body. Dry junctions
remain dry and channel-eligible, with no mountain/volcano overlapping their
selected channel attachment. Refined terrestrial eligibility still follows
the complete wet mask, not component membership.

Every classified principal channel gets its exact one-direction native write.
Internal hydraulic exchanges remain modeled mixing within a component, not
additional native river objects or claims of navigation between every port.
Wet NAV outlet declarations require a **positive actual reservoir-to-junction
transfer** and an eligible downstream principal NAV channel. Closed bodies and
negative reservoir exchanges get no fabricated outward wet declaration. In the
Standard 3 witness, the 312-to-reservoir exchange must not produce a false
wet 228-to-312 outlet, while 312's real outward export can be classified.

Retain physical adjacent endpoints for every reservoir-to-junction transfer.
When multiple positive eligible wet declarations share a source cell, select
at most one native write: greatest actual transfer, then lowest receiver-cell
ID. Preserve unselected transfers in the physical ledger and mark their
projection disposition explicitly. Native one-direction authorship does not
erase the physical exchange graph.

Projection receipts must distinguish principal-channel intents, hydraulic
exchange edges, and wet transition declarations. Retain complete water/class
parity requirements, one finalizer and existing cache/maintenance order. Do not
claim the engine independently realizes all signed internal exchanges, physical
closed-lake levels or naval traversal. Those are explicit native capability
limits, not grounds to alter physical terrain or discard a lake.

## Exact Ownership Changes

| Owner under source prefix | Required change |
| --- | --- |
| `domain/hydrology/modules/hydrography/ops/compute-open-basin-network/` | Replace with `compute-basin-network/`; coordinator, support witnesses, final signed ledgers and admission |
| Same module `model/policy/basin-water-budget.ts`, `ops/compute-basin-water-budget/` | Preserve law; share state/closure schemas rather than duplicate them; add representative-level rule only where needed |
| Same module `model/atoms/{open-basin-body,basin-water-budget}.schema.ts` and atom index | Replace open-only atoms with pool/body/component/port/transfer/terminal/closure atoms; remove stale open-only certificate authority |
| Same module `artifacts/{hydrography,lake-plan,river-network}.artifact.ts` | Admit the selected grouped result, typed terminals and principal-channel semantics; finite Number water surfaces |
| Same module `ops/classify-basin-river-network/` | Consume authoritative component graph and terminal states; no new routing or source duplication |
| Same module `ops/project-river-network/` | Keep percentile law; clarify principal-edge inputs and finite discharge handling; no junction total substituted for edge flux |
| Same module `contract.ts`, `router.ts` | Replace operation binding, no parallel executable solver |
| `recipes/standard/stages/hydrology/hydrography/{index.ts,steps/network/}` | Compile new selected envelope, compose operations, cross-admit three products, expose states/residual/junction diagnostics |
| `maps/configs/swooper-earthlike.config.json`, config admission/tests | Mechanical operation-envelope rename only; preserve numerical authorship and seven legacy configurations |
| `recipes/standard/stages/hydrology/rivers/model/policy/authored-river-projection.ts`, `steps/plot-rivers/` | Lower actual principal channels and positive reservoir exchanges; reject stale open-only certificates/aliases |
| `recipes/standard/stages/hydrology/projection/steps/lakes/` | Preserve full-footprint admission; permit closed bodies without asserting an outlet |
| `recipes/standard/metrics/capture.ts`, `metrics/families/hydrology/{basin-network,network-coherence,river-network}.ts`, relief-coherence and projection metrics | Capture Number surfaces and grouped state; independently verify terminal coverage, partition, signed exchanges, quantization versus roundoff |
| Hydrography network viz and direct artifact fixtures/manifest tests | Correct formats/state visibility; unchanged ordering and artifact grouping |

Any additional direct consumer revealed by typechecking must be migrated in
the same story, not kept alive with an old-shape alias or fallback field.
Generated schema/catalog/types/DAG output remains owner-generated, not edited.

## Acceptance And Implementation Order

1. **Contract and mechanism fixtures.** Promote minimal exact rows/geometry
   from the retained witnesses into test-owned fixtures. Commit their expected
   state/ledger semantics before selecting implementation details. Add closed,
   exact-zero interval, subtile, no-source dry, nonmonotone and tied-cohort tests;
   retain fractional-level probes proving no invented root.
2. **Coordinator and junction accounting.** Implement finite dependency/events,
   source partition, reciprocal sibling merge, same-head root contraction and
   signed tree ledgers. Test unequal sibling supply, unsaturated sibling receipt,
   multifurcations, parent nonduplication, dry-sill bypass, multiple reservoirs
   with inward/outward exchanges, wrap seams, and deterministic permutations.
   Test an outlet-free balanced state and genuine persistent-surplus refusal.
   Include a tied A/B/C multifurcation with saturated A+B but unsaturated C,
   repeated/reordered incoming delivery and root39-to-root37 becoming internal,
   and an admitted original-land boundary export distinct from marine flow.
3. **Whole result and consumers.** Migrate operation binding, grouped artifacts,
   metadata, step, classification, projection and metrics together. Verify no
   publication on invalid/nonstationary results, no ground/marine/forcing
   mutation, exact source attribution, full wet-body partition, finite values,
   adjacent nonascending channels and distinct residual/roundoff admission.
   Include a one-cell reservoir with two eligible outgoing wet transfers:
   retain both physical transfers but select only one native source write.
4. **Frozen replays and existing bank.** All four diagnostic arms must complete
   physical generation; their exact ground and forcing inputs remain held.
   Huge root 17 retains its one-cell quantized body and exact residual. Standard
   NOAA root37/root39/junction312 conserves the stated total and exposes inward
   reservoir support instead of a false outlet. Run prior supported cases and
   unchanged legacy products; preserve every study failure without weakening
   ecological, geographic, placement or river targets.
5. **Native qualification and cleanup.** Qualify complete closed-body stamping,
   principal class parity and positive-only wet declarations on a frozen
   representative case. Retire old all-open public envelopes, executable rules,
   assertions and documentation claims only with replacement coverage. Keep
   historical evidence, not executable compatibility. Root owns Nx, generated
   output, Git layers and live execution.

The operation/contract lane precedes recipe integration; projection and metric
consumer work can proceed in parallel once those contracts are reviewed. Do
not activate basin-aware terrain evolution before this coordinator is admitted:
otherwise iteration and final terrain quantization expose the same missing
states deeper inside the generation loop. Thermal calibration proceeds as a
separate evidence gate; no basin success can validate its coefficients.
