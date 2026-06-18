# Design — odd-R consumer migration + dead-code removal

## Problem framing

The prior slice fixed the four shared primitives but left a **mixed adjacency
model**. Because odd-Q and odd-R differ by one neighbor on every tile, a mixed
pipeline is wrong everywhere adjacency is used. The investigation (this session)
enumerated every hex-geometry consumer in the repo and classified each.

## Consumer census (disposition)

| Consumer | Was | Disposition |
|---|---|---|
| `lib/grid/{hex-oddq,hex-space,vector-field}`, `policy-grid` | odd-R (PR #1812) | already correct — single canonical primitive |
| `lib/heightfield/{base,sea-level}.ts` | odd-Q (`generateBaseHeightfield`) | **DEAD — deleted** (no live importer; mod uses its own `compute-sea-level` op) |
| `lib/plates/topology.ts` | inlined odd-Q (`isOddCol = x&1`) | → shared `getHexNeighborIndicesOddQ` |
| hydrology `compute-precipitation/vector` | inlined odd-Q + row-0 delta | → shared dir-vectors + iterator |
| hydrology `compute-atmospheric-circulation` | inlined odd-Q (smoother + ∇p wind) | → shared indices (smoother) + dir-vectors (gradient) |
| hydrology `transport-moisture/vector-advection` | inlined odd-Q (upwind donor) | → `bestHexNeighborDirectionIndexOddQ` + iterator |
| hydrology `compute-ocean-surface-currents` | inlined odd-Q (smoother + Helmholtz) | → shared indices + dir-vectors |
| hydrology `compute-ocean-thermal-state` | inlined odd-Q (upcurrent + diffusion) | → shared dir-vectors + iterator |
| morphology `compute-landmask` coarse-bin axial | odd-Q axial (`r = y-(x-(x&1))/2`) | → odd-R axial (`q = x-(y-(y&1))/2`, `r = y`) |
| diagnostics `surface-delta-context` | inlined odd-Q | → odd-R table in place |
| `@civ7/adapter` `mock-adapter` | inlined odd-Q (3 sites) | → odd-R table in place (boundary blocks shared import) |
| `@civ7/map-policy` `natural-wonder-footprints` | parity-naive enum table | **DEFERRED** (needs live per-direction probe; 0 NWs in std configs) |

## Decision 1 — collapse onto the single primitive, do not flip-in-place

The root cause is **duplication**: 6+ independent definitions of the same
adjacency drifted. Flipping each `x&1`→`y&1` in place would fix the math but keep
the duplication (and the next refactor re-drifts). Where the project boundary
allows (`kind:mod`/`kind:engine`), every consumer is collapsed onto the shared
`@swooper/mapgen-core/lib/grid` odd-R helpers, deleting the inlined tables. This
is Grit-endorsed (`helper_redeclarations_to_imports`). Only `kind:adapter`
(mock-adapter, restricted to `kind:foundation`) keeps an in-place table — kept in
sync with a comment.

## Decision 2 — the row-0 delta builder was a real geometric bug

`getNeighborDeltaHexSpaceFrom(baseX, dx, dy)` projected the base at row 0 and the
neighbor at row `dy`. Under odd-R (`projectOddqToHexSpace` shifts odd rows), this
makes one neighbor per parity land a **full hex too far** (len 3.0 vs 1.732). The
shared `getHexNeighborDirectionVectorsOddQ(isOddRow)` builds deltas from a
representative row of **each parity**, which is correct. Migrated ops use it.

## Decision 3 — preserve algorithms exactly

Each op's migration changes **only** the neighbor source (set + hex-space delta
vectors), never weights/clamps/iteration-counts/fallbacks. Multi-donor advection
blends (transport-moisture, ocean-thermal) were preserved rather than collapsed to
a single best-neighbor.

## Empirical evidence (standard dump, latest-juicy 84×54 seed 1337)

Three states — **A** odd-Q baseline (pre-PR#1812), **B** mixed (PR#1812 only),
**C** fully migrated (this slice):

| metric | A odd-Q | B mixed | C migrated |
|---|---|---|---|
| windU col/row sawtooth | 1.75 | 1.81 | **0.26** |
| windV col/row sawtooth | 2.67 | 2.50 | **0.52** |
| wind.divergence col/row | 1.23 | 0.85 | **0.52** |
| lakes total | 29 | 34 | 32 |
| lakes saddle (≥2 mtn nb) | 6 | 8 | 8 |
| landMask localized seam (max/median) | 4.67 @19 | 4.33 @29 | (coast) @29 |

**Reading:** (1) only the full migration removes the wind column-striping → the
degenerate-delta/`x&1`-frame was a real artifact in BOTH A and B; C is clean.
(2) the lakes-in-mountains behavior persists in all states → pre-existing lake
policy, out of scope. (3) the localized "seam" is a coastline present in all
states → geography, not a parity artifact.

## Symptom reconciliation (the two reported in-game artifacts)

- **"wrapping offset seam in the middle":** NOT caused by this change. A
  near-vertical coastline of comparable magnitude exists in the odd-Q baseline;
  the corrected adjacency relocated continents so it sits nearer map-center. The
  X-wrap boundary (x=0) is clean in all states (even width).
- **"single lakes splitting mountain ranges":** pre-existing sink-admission
  behavior (saddle cells flagged as drainage minima, protected only on mountain
  *crests* not saddles), modestly amplified by the corrected adjacency. Separate
  lake-policy slice.

## Falsifier

If the live render on the corrected build shows the wind/biome banding *worse*, or
a NEW wrap discontinuity at x=0, the migration is wrong — stop and re-probe.
