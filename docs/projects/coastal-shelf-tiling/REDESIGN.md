# Coastal Shelf Tiling — Redesign (v2, post architecture-investigation)

> Supersedes the slice plan in `DESIGN.md`. Driven by the multi-agent architecture
> investigation (5 investigators + adversarial critique). Integrates the owner's four
> hard principles: (1) physics-based, no arbitrary caps; (2) thin steps / fat ops;
> (3) normalize in `normalize()`, not `run()`; (4) relocate misplaced concepts.
>
> S1 (capTilesMax floor-guard) is **superseded** here — floor-guarding an arbitrary
> distance cap was treating the symptom. The caps are deleted. S2 (`applyCiv7CoastRingPolicy`)
> **survives** — an exact 1-tile engine guarantee, not an arbitrary cap.

## Confirmed architecture facts (code-verified by the investigation)
- Shelf computed at stage 2 (`ruggedCoasts`) from **pre-erosion** bathymetry, frozen
  (sole publish `ruggedCoasts.ts:531`). Erosion (stage 4) re-derives bathymetry from
  clamped water elevation (it does **not** sculpt the seafloor); islands (stage 5,
  same stage as mountains) inject land (`bathymetry=0`) without refreshing the shelf.
- Earliest true `shelfMask` consumer = stage 6 `climateBaseline` (→ `computeOceanGeometry`,
  `computeOceanThermalState`). Mountains (stage 5) reads **only** `distanceToCoast`.
- `ruggedCoasts.run()` ≈ 340 lines, ~2 op calls. Carving + heightfield writeback is
  load-bearing (the carved landMask feeds the shared `context.buffers.heightfield` that
  ~7 downstream stages read) and must stay at stage 2. `distanceToCoast` BFS + the shelf
  block are op-grade computation living in the step.
- Coast-ring (no land against deep ocean) is **already** guaranteed by the
  source-agnostic land-adjacent loop in `plotCoasts.ts:77-95`, independent of the shelf.
- `compute-shelf-mask` has **no** `normalize` hook; clamps in `run()`. `createOp`/
  `createStrategy`/`createStep` all support a `normalize(config, ctx)` hook.

## The four design pillars (corrected)

### Pillar 1 — Cap-free, physics-based shelf (with an absolute depth backstop)
Replace the tile-distance caps (`capTilesActive/Passive/Max`) with a shelf that emerges
from physics:
- **(A) Depth gate** — tile is shelf-eligible iff `bathymetry ≥ shelfBreakDepth`.
  `shelfBreakDepth = max(quantileCutoff, absoluteBreakDepth)`. The quantile adapts the
  break per-map; the **absolute backstop** (a real depth in metres) prevents the gate
  from becoming arbitrarily permissive on flat/shallow seas. *This backstop is the only
  bound, and it is physics (a metric depth), not a tile count.*
- **(B) Connectivity to shore** — multi-source BFS/flood-fill seeded from shore-adjacent
  water, traversing only through depth-gated shallow water. A tile is shelf iff it passes
  the gate **and** is flood-reachable from shore. Kills deep isolated shallow pockets.
- **(C) Margin modulation (physics, not cap)** — active margins (convergent/transform +
  `boundaryCloseness ≥ threshold`) use a **shallower** break depth (steeper drop-off →
  narrower shelf); passive margins use a **deeper** break depth (wider shelf).
  `shelfBreakDepth(i) = base × marginFactor(i)`.

**Mathematically-necessary bounds kept (and why):** BFS queue/visited bounded by tile
count (termination, not tunable); the nearshore **sampling window** for the quantile
(a statistical estimator window for the break depth — bounds which tiles *inform* the
cutoff, not shelf extent; rename `breakDepthSampleRadius`); `clampInt16` storage range;
`shelfBreakDepth ≤ 0` (bathymetry ≤ 0 by contract). **Everything tile-distance is deleted.**

**Knob re-wire:** `shelfWidth` (narrow/normal/wide) re-maps from the deleted caps to the
break-depth lever (scales the absolute backstop / biases the quantile). Knob stays alive.

> GATE (critique blocker): the cap-free formulation must be **empirically validated** —
> bathymetry distribution + simulated cap-free shelf extent across small/standard/huge
> sizes AND a high-water/enclosed-sea config — confirming extent stays bounded by the
> depth backstop, never spanning a basin. Recorded in `VALIDATION.md` before R2 lands.

### Pillar 2 — Relocate the shelf to a new `morphology-shelf` stage (post-features)
New morphology truth stage **after** `morphology-features` (islands+mountains) and before
`hydrology-climate-baseline`. A thin step: read final post-island landMask/bathymetry →
`compute-distance-to-coast` (post-island) → `compute-shelf-mask` → publish a `shelf`
artifact (shelfMask + post-island coastline metrics + diagnostics) + viz. **Justification
(corrected):** captures post-island geography (island shelves, ocean-geometry/reef/start
fields reflect final land) — *not* the coast-ring (which `plotCoasts` already owns).

Artifact split: `coastlineMetrics` (stage 2) keeps the **carved** fields {coastalLand,
coastalWater, distanceToCoast} for mountains(5); the new `shelf` artifact (stage 6) carries
{shelfMask, post-island coastline metrics, diagnostics}. Two **explicitly named**
`distanceToCoast` snapshots; never reuse the bare name. Re-point all 6 consumers + 2
diagnostics.

### Pillar 3 — Thin steps / fat ops
- Lift `distanceToCoast` BFS → shared op `compute-distance-to-coast` (reused at stage 2
  carving and stage 6 shelf).
- Extract a **pure** `reconcile-heightfield-from-coast` op returning new {landMask,
  elevation, bathymetry}; the carving step does the in-place copy into the shared buffer
  (the only legitimate place for that side effect — ops stay pure).
- `compute-shelf-mask` gets a `normalize()` hook; `run()` holds only physics.

### Pillar 4 — Coast follows the shelf; uniform band retired
`plotCoasts`: coast = shelf ∪ coastalWater ∪ coast-ring (`applyCiv7CoastRingPolicy`, S2).
**Remove** `applyCiv7CoastClassificationPolicy` (the uniform `coastBufferTiles=oceanWaterColumns`
band — the original symptom: 70.7% of latest_juicy coast; misappropriated constant; engine
`expandCoasts` is neutralized so it is self-imposed, not engine-required). De-duplicate the
second policy call in `ecology-features/score-layers`. Verdict reconciliation: the
investigation synthesis leaned "keep band as engine conformance," but (a) the original
behavioral evidence shows it overrides the shelf, (b) the critique shows it compounds a
wider shelf into over-wide coast, (c) it is not engine-required. → remove, verify live.

## Revised slice sequence (Graphite stack; replaces S1/S3–S5)
Kept: **S0** (docs), **S2** (`applyCiv7CoastRingPolicy`). Superseded: **S1** (caps deleted in R2).

| Slice | Change | Principle | Per-slice proof |
|---|---|---|---|
| **R0** | this redesign + cap-free empirical validation (`VALIDATION.md`) | gate | doc + sim numbers |
| **R1** | shared `compute-distance-to-coast` op; wire into carving step | thin/fat | diag:dump byte-identical distanceToCoast |
| **R2** | cap-free `compute-shelf-mask` (depth+connectivity+margin+absolute backstop); `normalize()`; delete caps; re-wire `shelfWidth`→break-depth; rewrite shelf configs | 1, 3 | unit + diag:dump (bounded extent, margin variation) |
| **R3** | new `morphology-shelf` stage (post-features); split `coastlineMetrics`→ carved + `shelf`; two named distanceToCoast; re-point 6 consumers + 2 diagnostics | 4-relocate | diag:dump + parity re-bless |
| **R4** | shelf-anchored `plotCoasts`; remove uniform band; de-dup score-layers; artifact field `policyCoastMask`→`coastRingMask` | symptom | diag:dump ledger C1–C5 |
| **R5** | pure `reconcile-heightfield-from-coast` op; thin the carving step | thin/fat | diag:dump byte-identical heightfield |
| **R6** | retire dead policy surface (`applyCiv7CoastClassificationPolicy`/`coastBufferTiles`/`oceanWaterColumns`) | cleanup | build + boundaries lint |
| **R7** | live verification + balance (coast extent, double-count, reef/start), no-water-drift note | gate | `studio-run-in-game-live` |

## Resolved decisions (from critique open-questions)
- **Absolute break-depth backstop:** required, not optional (blocker). Value set empirically in R0.
- **Two distanceToCoast fields:** required, explicitly named (carved vs post-island).
- **Reconcile op:** separate pure op (not folded into the mask op; never mutate shared buffer in an op).
- **mountains distanceToCoast:** stays the stage-2 carved snapshot (no behavior change — safe).
- **no-water-drift:** coast↔ocean is water-neutral → the gate can't trip on shelf changes and can't
  catch a shelf regression; correctness checked via `coastClassification` + visual diff.
- **Uniform band:** removed (not kept) — see Pillar 4 reconciliation.
- **Seafloor erosion** (sculpting water bathymetry) is **out of scope** — flagged; current erosion
  only re-derives water depth from clamped elevation. Relocation buys post-island geography, not eroded seafloor.
