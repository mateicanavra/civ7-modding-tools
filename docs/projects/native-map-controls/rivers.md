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
