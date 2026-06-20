# Start Distribution — Redesign (from the ground up)

> Companion to [`diagnosis.md`](./diagnosis.md) and
> [`expectations.md`](./expectations.md). This is the algorithm design and the
> domino plan. The OpenSpec control record is
> `openspec/changes/start-distribution-homeland-rebalance/`.

## 1. Design principle — match the homeland model to the land that exists

Civ7's gameplay model is **two homeland hemispheres** (West / East), with
*Distant Lands* across the ocean reserved for the Exploration Age. Every major
civ starts on a homeland; the engine tracks this with `LandmassRegionId`
(`WEST`/`EAST`/`NONE`). The 2-region model is therefore **correct and kept**.

The defect (see diagnosis) is that the mod imposes the West/East split
**geometrically on whatever morphology produced** and then allocates a **fixed**
player count to each half **blind to capacity**. Real Civ7 instead *builds*
two balanced homeland continents sized for their player counts. We cannot resize
continents from placement (that is morphology), so we do the next best,
physics-honest thing:

> **Partition the settleable land into two balanced homelands, allocate players
> to each homeland in proportion to its real capacity, and disperse seats within
> a homeland across its constituent landmasses and its full extent.**

Three rules govern every move below:

- **Physics-informed:** decisions read the *actual* land distribution and the
  pipeline's existing truth artifacts (`morphology.landmasses`, `topography`,
  `pedology.fertility`, candidate viability) — never a fixed geometric guess.
- **Gameplay-anchored:** every hard Civ7 requirement is preserved — one start
  per major civ, starts on settleable land only, the official 6/12 spacing
  buffers, fertility/freshwater/climate preference, per-civ StartBias, and the
  worst-pair fairness gap ≤ 0.3. See `expectations.md`.
- **Degrade as data:** when geography cannot satisfy a target, the shortfall is
  recorded loudly (per-seat flags, fairness report, diagnostics) — never forced
  silently and never thrown.

## 2. The four moves

Each move targets a specific root cause and is independently verifiable against
the region-balance metric (move D0). Together they are the homeland rebalance.

### D1 — Land-aware homeland partition (fixes RC1)

Replace `centerX < width/2` with an **area-balanced split of the cylinder**.
The map wraps in X, so "West vs East" is a rotation choice, not a fixed seam.

1. Build a per-column settleable-land weight histogram `w[x]`
   (`w[x] = settleable land tiles in column x`, settleable = land minus
   mountain/volcano/lake/wonder).
2. Slide a half-map window (`width/2` wide, circular) and pick the rotation
   offset `m*` that **minimizes |W(window) − W_total/2|** — the meridian pair
   that best halves settleable land. O(width), deterministic.
3. Assign each **landmass whole** (by its area-weighted centroid relative to
   `m*`) to West or East. Keeping landmasses intact preserves "homeland =
   continent" coherence; the residual imbalance when one landmass exceeds half
   the capacity is absorbed by D2.

This keeps the published 2-slot output, the engine `WEST`/`EAST` region stamping,
and the cross-ocean Distant-Lands geometry — it only changes *where the line is*.

### D2 — Capacity-proportional player allocation (fixes RC2)

Replace the fixed positional 4/4 split. Total players `N` comes from the
adapter's alive-major count (`getAliveMajorIds().length`), with `MapInfo`
`PlayersLandmass1+2` as fallback only.

1. **Capacity** per region = a feasibility-aware measure of how many
   well-spaced starts the region can actually hold:
   `feasibleCeiling_r = floor(settleableTiles_r / tilesPerStart)` where
   `tilesPerStart` derives from the spacing floor (a hex disk footprint), and a
   quality-weighted `capacity_r` (settleable tiles weighted by viability) ranks
   regions when both are feasible.
2. **Apportion** `N` across the two regions by largest-remainder (Hamilton)
   proportional to `capacity_r`, then **clamp to `feasibleCeiling_r`** and
   redistribute any overflow to the region with spare ceiling.
3. **Balance bias:** blend the proportional result toward an equal split by
   `balanceBias ∈ [0,1]` (Civ7 prefers near-equal hemispheres *when feasible*).
   Feasibility always wins over balance — we never assign a region more starts
   than it can space.

Result: a land-poor homeland receives *fewer* (or zero) players instead of a
forced 4; a land-rich homeland absorbs the rest. No more "half crammed into a
sliver."

### D3 — Intra-region dispersion objective (fixes RC4)

Within a region holding `q_r` players across possibly several landmasses:

1. **Per-landmass quotas:** apportion `q_r` across the region's landmasses by
   their capacity (reuse the D2 apportionment primitive). Multi-landmass
   homelands now seat starts on *each* viable landmass, not just the best one.
2. **Farthest-point seeding:** seed the first seat at the highest-quality
   candidate, then each subsequent seat maximizes a blend of **viability AND
   distance to the nearest already-seated start** (a max-min spread objective),
   subject to its landmass quota and the spacing floor. This generalizes the
   current pairwise relaxation into an explicit dispersion pass.
3. **Adaptive spread weight:** when a region is capacity-tight, raise the
   dispersion share of the ranking so seats fan out rather than clump in the
   single best basin.

### D4 — Imbalance-aware reconciliation + verification (fixes RC3, closes the loop)

1. **Reconciliation:** because D2 allocates within feasibility, the zero-only
   valve becomes a true capacity rebalance — if selection still cannot space a
   region's quota, surplus seats move to the region with spare capacity,
   recorded as a region relaxation (loud, per-seat).
2. **Region-balance metric (D0 instrument, landed early):** add diagnostics that
   make clustering *measurable* — starts-per-region vs capacity, max
   single-landmass start share, and a normalized spatial-spread index. This is
   the gate the bug currently evades; it provides the before/after proof.

## 3. Policy primitives → `packages/civ7-map-policy`

The package is `@civ7/map-policy` — "pure Civ7 map policy facts and deterministic
compliance helpers", zero runtime deps. The Civ7 start-distribution *policy*
(homeland model, official spacing buffers, capacity/feasibility model, balance
bias) is exactly that charter. New module `src/starts/`:

| Primitive | Signature (shape) | Purpose | Purity |
|---|---|---|---|
| `CIV7_START_PLACEMENT_POLICY_V0` | const fact table | Official spacing buffers (required 6 / desired 12), homeland region count + ids, default `balanceBias`, `tilesPerStart` derivation | data |
| `balancedHemisphereSplit` | `({ columnWeights, landmassCentroids, width }) → { meridianOffset, slotByLandmass }` | D1 area-balanced partition | pure |
| `feasibleStartCeiling` | `(settleableTiles, spacingFloor) → number` | D2 hard capacity ceiling | pure |
| `apportionStartsByCapacity` | `({ capacities, ceilings, total, balanceBias }) → number[]` | D2 + D3 quotas (largest-remainder + clamp + redistribute) | pure |
| `dispersionScore` | `(plotIndex, seatedPlots, width) → 0..1` | D3 max-min spread term (odd-R distance) | pure |

The grid-distance dependency uses the package's existing
`src/policy-grid.ts` hex helpers (currently unexported — export what `src/starts/`
needs). **Odd-R caveat:** this branch sits above the odd-R adjacency migration
(#1812/#1851); any distance/footprint math must use the engine **odd-R** model.
Verify the live helper name before use — historical names may still read `OddQ`
pending the rename packet (`docs(openspec): record OddQ->OddR rename scope`).

Start-specific *orchestration* (reading artifacts, building candidate pools,
wiring quotas into the ladder) stays in the mod under
`domain/placement/ops/plan-starts/policy/` and the `plot-landmass-regions` step —
it *consumes* the pure primitives. This keeps `@civ7/map-policy` a pure policy
layer and the mod the composition layer (Nx boundary: `kind:mod` may import
`kind:foundation`).

## 4. Non-goals (explicit scope boundaries)

- **No N-region generalization.** The Civ7 homeland model is two hemispheres;
  the published `plan-starts` output stays 2-region (`playersLandmass1/2`,
  `regionSlot ∈ {1,2}`). N-region would break the schema, the engine region-id
  space, and Studio — out of scope, recorded as a future option only.
- **No morphology change.** We do not make morphology generate balanced
  continents; we adapt placement to the land that exists.
- **No scorer redesign.** Viability scoring and candidate screening are kept.
- **No engine-positioner revival.** The mod keeps owning `setStartPosition`.

## 5. Dominoes, sequencing, and complexity × parallelism

Graphite is a linear stack; the table records the dependency DAG so independent
dominoes can be split into parallel worktrees if desired. Each slice is one
OpenSpec task group and one Graphite branch on top of
`start-dist-homeland-rebalance`.

| Slice | Domino | Touches | Depends on | Complexity | Parallel with |
|---|---|---|---|---|---|
| S1 | **Design** (this packet + OpenSpec) | `docs/`, `openspec/` | — | low | — |
| S2 | **D0 metric + baseline** (region balance, spread, max-landmass-share; measure current) | `dev/diagnostics/placement-metrics.ts`, evidence | S1 | low–med | **S3** |
| S3 | **Policy primitives** (`@civ7/map-policy/src/starts/` + unit tests) | `packages/civ7-map-policy` | S1 | med (isolated, fully unit-tested) | **S2** |
| S4 | **D1 land-aware partition** | `plot-landmass-regions` (+ optional capacity surface) | S3 | med | — |
| S5 | **D2 capacity allocation** (replace fixed split; seat-identity; N from alive-majors) | `plan-starts` (`seat-identity`, `default.ts`), `runtime`/`derive-placement-inputs` | S3, S4 | med–high | — |
| S6 | **D3 dispersion** (per-landmass quotas + farthest-point in ladder) | `selection-ladder.ts`, `default.ts` | S3, S5 | med–high | — |
| S7 | **D4 reconciliation + verification + closure** (rebalance valve, ledger results, in-game proof) | `default.ts`, diagnostics, evidence | S4–S6 | med | — |

**Critical path:** S1 → S3 → S4 → S5 → S6 → S7. **Parallel opportunity:** S2 ∥ S3
(metric and pure primitives are independent — two worktrees could land them
before S4). After S3, the behavior spine S4→S5→S6 is sequential by data
dependency (each consumes the previous region/allocation state) and each
*monotonically* improves the D0 metric, so every slice is independently
verifiable. S7 confirms no regression on the kept E1.x gates and adds in-game
proof (the closure test — MockAdapter-valid maps can still SIGSEGV live).

**Why this order (outside-in refinement):** first fix *where* the homelands are
(D1), then *how many* players each gets (D2), then *where within* a homeland they
sit (D3), then *prove + reconcile* (D4). Each layer assumes the previous is
correct, and each can be measured in isolation against the D0 metric — so a
regression is attributable to exactly one slice.

## 6. Open risks / decisions (recorded, not silent)

- **Odd-R distance helpers** — verify live name on this branch before use (above).
- **`tilesPerStart` constant** — the feasibility ceiling needs a defensible
  tiles-per-start footprint tied to the 6-tile floor; calibrate against the D0
  baseline rather than guessing. Recorded as a tuning task in S3/S7.
- **`balanceBias` default** — Civ7 prefers near-equal hemispheres, but there is
  no authored constant; pick a default that keeps equal splits on balanced maps
  and only diverges when feasibility forces it. Tune in S7.
- **Single-dominant-continent (pangaea) maps** — D1's meridian cuts *through*
  the continent, giving two nominal homelands on one landmass. This is desirable
  (8 players spread across the continent) and strictly better than today's
  collapse; documented expected behavior, not a defect.
