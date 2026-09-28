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

## Additive Adapter Contract

`EngineAdapter` now exposes detached symbolic `RiverWriteIntent` values and
explicit `RiverFinalizationArgs`. Geographic symbols are translated to installed
native enums only in the app adapter. Coordinates, classes and numeric arguments
are validated before dispatch; absent functions/enums and native exceptions
remain errors. There is no rerouting, procedural fallback, retry or defaulted
finalizer tuple.

`getRiverCapabilities` separately reports writer, finalizer and raw type-reader
availability, labeled `native` or `mock`. Callable surfaces do not prove native
semantic parity. The mock records intent and applies declared classes only;
it does not simulate slopes, network construction, class demotion or ocean
connectivity. The recipe owns once-per-map finalization, not the adapter.

This prerequisite is deliberately additive: production still uses its existing
river path until the physical model and projection design are reconciled.
The misleading older readback-derived flag is retained only until its consumers
can migrate together. The V2-V4 live atlases qualify direct engine calls, not
the new wrapper. V5 is prepared to qualify wrapper dispatch independently;
production integration still needs its own correlated native run.

The unified adapter/Core/definition/app check, test and policy graph passes
63 tasks: 56 adapter, 360 Core, 655 definition and 114 app tests, with 49,125
assertions. Receipt: `/tmp/civ7-river-adapter-verified.log`. The first run found
that a new standalone semantics test was outside the admitted package shell;
the tests were folded into the existing mock-adapter proof instead of weakening
Habitat policy. Independent source review found no actionable defects.

After qualification, the normal saved `ToT_NoModsExceptMaps` Huge Earthlike
map/game seed 1018 setup was restored at turn 1. A fresh run completed at
`2026-09-28T05:37:55.568Z`; generated and installed script SHA-256 match
`732b817b98c29e0fde7131e249c6b1162561eda05a86cff6201689ba80ed4cfc`.
Receipt: `/tmp/civ7-river-contract-earthlike-restored.log`. The subsequent
Explore request reports all 6,996 plots revealed and visible, with quiescence
and notification suspension/resumption verified:
`/tmp/civ7-river-contract-earthlike-explore.json`. This is normal-path regression
and player handback, not proof of the still-unused explicit river wrapper.
Studio was restarted from this worktree and regenerated Huge Earthlike/1018;
the biome preview is available in Arc. Its legacy live-status connection entered
backoff during Explore, independently of the successful fresh native request.

## Tests And Acceptance

### Elevated Lake Boundary Qualification

Revision 4 adds two four-cell elevated lakes without writing rivers inside
either water body. The fresh `river-elevated-lake-1018-v4` execution completed
at `2026-09-28T07:49:59.350Z` on Tiny 60x38, map/game seeds 1018/1019, four
players, saved configuration `ToT_NoModsExceptMaps`. Generated and installed
script SHA-256 is
`7d3ccc32518a159a4cc78cb347396f15528c0e6d29faf83b1655750d8b4f0352`.

Both four-cell categorical footprints remain lakes through all nine
checkpoints. Each four-cell minor inlet remains one native network (open-lake
inlet ID 20; closed-lake inlet ID 29). The open lake's five-cell navigable outlet
is a separate network, ID 21, and all five cells report ocean connectivity
after water-cache refresh. Every atlas write returned and every independently
predicted adjacency matched the native adjacency observation.

The open lake reads elevation 322 beside its 450-unit lowest shore/outlet;
the closed lake reads 572 beside its 700-unit minimum shore. Both received wet
input 572. Neither lake's numeric readback changes during river finalization
or later maintenance. This corroborates the earlier surrounding-shore behavior,
not independent physical water-level authorship. In particular, comparing
322 directly with the outlet's 450 does not prove a physical uphill outlet:
the meaning of native water elevation versus rendered water surface remains
unqualified. Do not alter ground to compensate for that numeric difference.

This establishes stable whole categorical bodies and separately authored
land-only inlets/outlets in these fixtures. It does not establish one river
object or navigability through the lake, exact directed-edge readback, arbitrary
closed-lake levels, or every production basin geometry. The 13 fixture tests
pass with 1,334 assertions. Native data and copied log are retained in
`/tmp/civ7-river-authored-river-elevated-lake-1018-v4.{json,log}`; installation
and launch receipts use `/tmp/civ7-river-elevated-lake-v4-*`.

An earlier launch crashed during setup-identity application before this fixture
loaded. Its failure and native crash report were retained separately; the
successful run followed fresh process and read-only health reconciliation,
not a blind retry of an uncertain mutation. The crash is not attributed to
basin generation or the new fixture.

### Terrain Admission Qualification Fixture

Revision 5 is an explicit `terrain-admission` selector labeled **River Terrain
Admission V5**, not an extension of the crowded V4 atlas. The default `legacy`
selector preserves V4 geometry and controls. Both replace the same disposable
diagnostic mod; proof metadata includes the selected atlas, revision and script
SHA. The owner build is:

```sh
nx run swooper-physics-mod:build:river-contract-probe river-terrain-1018-v5 authored terrain-admission
```

Sixteen cases pair flat, hill, mountain and mountain-plus-volcano surfaces with
minor/navigable classes and two interior barrier positions. Every case writes
all six sources `(52..57,y)` eastward with identical elevation inputs
`550,500,450,400,350,300`; `(58,y)` is original ocean. There is no unwritten dry
gap. Rows `3,5,..33` leave the four standard Tiny starts separate and keep all
reach neighborhoods equally buffered from the north/south coasts. All writes
use the real `Civ7Adapter`; finalization is once with `(false,25,2,2)`.

The native qualification questions are deliberately bounded:

- Does each actual terrain/feature survive setup validation and elevation
  authorship, and does the observed profile remain downhill? A missing volcano
  cannot establish volcano admission; compare it with mountain-only controls.
- What changes while writing into versus out of a barrier, and at finalization?
  Source/receiver labels refer only to test edge `(54,y)->(55,y)`. Every interior
  barrier has both roles in its complete reach; whole-reach results cannot
  isolate source-only versus receiver-only legality.
- Which classes, terrain, features, memberships and cached ocean-connectivity
  observations survive all nine existing checkpoints without repair or retry?

Each write records both endpoints before/after, requested inputs separately
from observations, and its barrier interaction. Setup snapshots bracket terrain
validation *before* elevation authorship; `initialized` observations follow it.
Later snapshots preserve observed terrain, elevation, feature and class rather
than reconstructing them from requests. The focused artifact tests pass (18
tests, 9,388 assertions), including legacy controls and real-wrapper dispatch;
they do not simulate native terrain or river semantics. This fixture does not
activate production projection or prove exact native directed edges.

The fresh native V5 run completed at `2026-09-28T09:07:55.486Z`, using the saved
configuration with Tiny size, four players and map/game seeds 1018/1019.
Generated and installed script SHA-256:
`65c96b2de84bee1eea07ee00a9e40a7e013940f6c9cf0cc4d81ea9372e706726`.
Digest-valid decoding recovers all 106 diagnostic series from 1,138 parts:
metadata, 96 writes and nine checkpoints, plus one completion and no failure.
Every write returns and all 96 native adjacencies match the requested neighbor.

| Actual initialized surface | Minor reach | Navigable reach |
| --- | --- | --- |
| Flat | All six cells remain minor and flat | All six become navigable terrain |
| Hill at the interior barrier | All six remain minor; hill retained | All six navigable; hill becomes navigable terrain |
| Mountain at the interior barrier | Mountain has no river; separate upstream/downstream memberships | Upstream becomes minor; downstream remains navigable; mountain unchanged |
| Mountain plus actual volcano feature | Same split as mountain, feature retained | Same split as mountain, feature retained |

All eight mountain/volcano barriers remain terrain 0 with no river class. The
four actual volcano features (ID 25) survive every checkpoint. These are not
rejected-feature controls accidentally testing flat terrain. Native receiver
readback at x58 is coast terrain 3, water and not lake, despite requested ocean
terrain 4; every reach still terminates directly in marine water without a dry
gap. Hill conversion and class downgrading occur during finalization; sampled
numeric elevations remain unchanged. Navigable ocean-connectivity is false
before the water-cache refresh and true afterward on retained navigable cells.
River memberships describe the observed split, not native directed-edge parity
or a source-only versus receiver-only legality law.

This establishes a production ordering requirement: select exposed mountains
and volcanoes with the final water footprint and authored dry channel occupancy
available. Do not classify a required channel as an impassable peak and then
expect the native setter to cut it. Hills are not a blanket exclusion for minor
rivers; navigable terrain replacement is an explicit gameplay projection.
Physical ground and drainage stay authoritative, without late adapter carving.

Receipts: `/tmp/civ7-river-terrain-v5-{live-fresh-menu.log,scripting.log,analysis.md,
observations.json}`. The first launch crashed in `reconcile-target-mod` during
the prior session's exit/setup transition, before any V5 generation. Its native
SIGSEGV stack exactly matches an earlier fixture-transition crash. The previous
stack's socket-reset and observation fixes are already present. Transition
readiness is a hypothesis, not a proven native cause; no speculative controller
rewrite was made. Logs/crash reports were preserved before a fresh process,
read-only ready/shell observation and this successful launch.

### Production Gates

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
