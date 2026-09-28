# River Network Lane

## Outcome And Boundary

Realize the connected river network that Hydrology computes: minor tributaries,
junctions, navigable corridors, class transitions and intended outlets. The goal
is not to maximize the count of navigable tiles or make new drainage inside Civ.

Hydrography owns receivers, discharge and class. The existing map-rivers step
owns gameplay lowering. The portable adapter describes capabilities and
observations; the app-owned native adapter writes segments and finalizes them.

## Discovery Gate

The shipped setter has coordinates, a direction symbol and a river class.
Determine its actual semantics before translating physical receiver indices:

1. One straight minor reach, one navigable reach, and one class transition.
2. All six directions on both row parities, plus the wrapped seam where allowed.
3. Two tributaries at one confluence; river mouths; closed-basin termination.
4. Lake inlet/outlet cases. Shipped Earth source comments include lake tiles,
   so an unconditional water-plot prohibition would contradict evidence.
   Include wholly rejected and partially accepted physical lakes: the current
   lake projection excludes mountain/volcano plots and publishes an accepted
   lake mask, while river selection currently consumes the unprojected plan.
5. Read native type, direction/edge representation, network identity where
   available, and terrain before/after finalization and later maintenance.
6. Compare aesthetic validation disabled/enabled, native minimum-length and
   upstream-minor settings, and repeated finalization. Adopt settings only after
   their effect on authored intent is understood.

Native call availability, type readback, writer support, functioning network
objects and gameplay effects are distinct facts. Unavailable edge/network
readback must remain a known limit, not be reported as exact parity.

## Target Design

Lower the existing physical graph deterministically in the projection owner.
Each projected segment has an admitted endpoint/direction/class and traceable
physical origin. Projection may enforce demonstrated Civ constraints, but must
record exclusions and reasons instead of inventing a replacement network.
Consume immutable accepted-lake evidence alongside physical drainage when
lowering endpoints. Reconcile planned versus accepted lake surfaces explicitly;
the native adapter must not repair that mismatch by routing a new river.
Any necessary change to physical routing returns to domain design for review.

Finalize the written network once through the explicit native branch. Do not
also run procedural `modelRivers` as the destination. Retain terrain validation,
area and water refresh until experiments establish which operations are needed
and whether any overwrite intent. Reconcile both minor and navigable outcomes.
Custom names are downstream decoration, not a prerequisite for network identity.

## Native Qualification In Progress

The app-owned `test/live/river-contract-*` diagnostic builds one disposable
Tiny 60x38 map (four players, map/game seeds 1018/1019). Every rebuild has a
unique proof ID, finalizer settings, and script SHA; installation equality and
fresh digest-valid native logs are checked separately from launcher success.
The artifact tests exercise logging and dispatch, not an emulated river engine.

The first native atlas (`river-native-1018-authored-v2`, 2026-09-28) observed:

- All 73 setter calls returned, including four wrapped-seam writes. All six
  geographic directions matched native adjacency on both row parities.
- 69 sources immediately reported a river class. Three water sources and one
  mountain source did not; absence of a water-tile class is not proof that a
  lake connection was rejected.
- With shipped Earth settings `(false,25,2,2)`, finalization retained 58 river
  sources: 54 minor and four navigable. Every one of the 11 disappearing land
  segments had an observed receiver elevation above its source; every retained
  segment had a nonpositive difference. This is a strong hypothesis, not yet a
  universal slope rule. The four marine-mouth tiles retained navigation; inland
  navigable test reaches became minor.
- Enabling aesthetics alone produced six minor and two navigable tiles. Both
  runs had identical pre-finalization terrain and class arrays.
- Repeating finalization left terrain and class arrays unchanged but doubled
  `MapRivers.numRivers` (36 to 72 without aesthetics, three to six with it).
  Production must finalize once. Later maintenance did not change those arrays.

The minimum-length variant also completed. The game then crashed during the
next session transition, after destroying its script contexts; the native
property-access crash report does not establish a cause. No upstream-minor or
percentage result is claimed from that aborted matrix.

The follow-up `river-native-1018-authored-v3` completed at
`2026-09-28T05:15:40.464Z`, with one finalization and nine checkpoints. Installed
script SHA-256 was
`d2a58dee34c2ade952d4932294ce12375f473a666e5b335f51c543d77a72c2a8`.
The receipt and copied native log are
`/tmp/civ7-river-authored-river-native-1018-authored-v3.{json,log}`; independent
analysis checked the install receipt, proof identity and payloads.

- All 108 writes returned; all requested adjacencies matched. Six independent
  E/W controls reverse the earlier direction/slope confound: actual native
  receiver deltas -2 and 0 retain minor rivers, while +2 removes them, in both
  directions. This qualifies these ordinary-land cases, not every possible
  native surface or river direction.
- Finalization produces 64 minor and 27 navigable plots. Terrain, classes,
  network count (41) and returned memberships remain stable through subsequent
  floodplains, validation, area calculation, water-cache refresh and starts.
- The marine confluence preserves its six navigable trunk and four minor
  tributary plots together in native river ID 14.
- The marine navigable/minor/navigable case remains one native network (ID 8),
  but the upstream navigable pair becomes minor. The four downstream navigable
  plots remain navigable. Network membership and continuous navigability are
  different claims.
- The lake inlet remains minor in ID 32; the outlet plus marine connector is
  17 navigable plots in ID 31. The two lake cells remain lakes without river
  type or returned membership. Through-lake connectivity is not proven, and
  neither does this establish that all lake writes are unsupported.
- Ocean connectivity is false for every navigable sample until `storeWaterData`
  runs; all 27 then report true. Keep that refresh and observe connectivity
  afterward, not immediately after finalization.
- Experimental `getRiverIDByIndex(0..40)` returns IDs 1..41; passing those IDs
  to `getRiverPlots` yields valid, untruncated arrays whose union equals all 91
  river-classified plots. Two seam plots each belong to two singleton IDs,
  even with only one finalization. Membership is not a unique partition, and
  array order is not directed-edge evidence. The observed native function
  arity of zero is not a signature contract. These readers remain app-local
  experimental observations, not a portable production contract.

Do not turn these observations into adapter-side rerouting or silently exclude
physical spill paths. Routing uses conditioned drainage heights while the
elevation projection consumes raw Morphology topography; the causal audit and
required terrain-design decision are recorded in
[drainage reconciliation](drainage-reconciliation.md). Adjacency is not native
river-direction readback. The full aesthetic/length/upstream/percentage matrix
has not been completed, and no generalized parameter independence is claimed.

Separate write capability from type-readback capability; the current
`minorRiverStampingSupported` flag is derived from readback support and cannot
prove authorship. Update its contract and parity consumers together.

## Tests And Acceptance

- Deterministic graph-to-hex lowering, odd/even rows, seams, transitions,
  confluences and outlets, including rejected/partial lakes; invalid intent
  fails with a bounded reason.
- Contract/mock/native-dispatch tests and finalization-order fixtures.
- Missing, extra, wrong-class and wrong-direction observations counted
  independently; native-object evidence remains distinct from terrain masks.
- Existing river-network, integrity, floodplain and placement studies, augmented
  in the current metric bank rather than a separate diagnostic system.
- Live cases show accepted minor/main channels and coherent downstream features;
  unmatched network evidence remains unresolved, not silently passed.
- Before implementation, select existing native observations for one bounded
  gameplay witness: navigability/connectivity and freshwater/river adjacency.
  A missing observation blocks that product claim, not all other progress, and
  does not authorize expanding the separate Controller/Play migration.

## Deletion Receipt

Candidates: terrain-stamping-plus-modelRivers generation path, generator-only
length knobs, and compensating navigable-terrain selection restrictions that
are no longer required. Evaluate each against source rationale and live cases.
Do not delete meaningful gameplay selection or physical classification just
because a setter exists. Remove river-specific coast repair only after its
replacement invariant is proven; shared coast/lake parity helpers have other
callers and are not wholesale deletion candidates.
