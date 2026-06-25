# Cap-free shelf — empirical validation (R0 gate)

> Resolves the adversarial-critique BLOCKER: prove a cap-free (depth-gate + shore
> flood-fill) shelf stays bounded before deleting the tile-distance caps. Simulated on
> real dumped **post-erosion** bathymetry (`/tmp/capfree-sim.mjs`), odd-R adjacency.

## Method
For each dump: load post-erosion bathymetry (i16) + landMask; BFS distanceToCoast from
shore; nearshore quantile cutoff (dist 1..8, q=0.6, ascending) as the base break depth;
flood-fill from shore-adjacent water through tiles with `bathymetry ≥ breakDepth`; measure
shelf share-of-water, **max extent from shore**, p95 extent. Sweep an absolute break-depth
floor `breakDepth = max(quantile, floor)`.

## Results
| Config | water | q0.6 cutoff | quantile-only: share / maxExt / p95 | floor −3m | floor −5m |
|---|---|---|---|---|---|
| latest_juicy 106×66 | 4518 | −7 m | 0.308 / 11 / 9 | 0.197 | 0.240 |
| swooper-earthlike 106×66 | 4348 | −6 m | 0.296 / 11 / 9 | 0.209 | 0.266 |
| latest_juicy 60×40 | 1531 | −13 m | 0.383 / 8 / 5 | 0.194 | 0.221 |

Bathymetry over water (latest_juicy 106): min −43, p25 −22, p50 −11, p75 −2, p90 0. The
deep floor (−43..−52 m) is far below the cutoff (−6..−13 m), so the depth gate fails in deep
water and the flood-fill terminates at the shelf break — **no basin-spanning runaway**.

## Verdict
- **Cap-free is sound.** Depth-gate + shore connectivity bounds shelf extent to 8–11 tiles
  (share ≈ 0.20–0.38) across sizes and the enclosed/high-water config — no tile-distance cap
  needed. The quantile adapts to each map's depth scale (big map −7 m, small map −13 m).
- **Absolute break-depth floor is retained** as (a) the `shelfWidth` knob lever (narrow =
  shallower floor → less shelf; wide = let quantile dominate) and (b) a safety clamp for
  degenerate flat seas. It is a metric depth (physics), not a tile cap → principle-1 clean.
- **Final break-depth formula (R2):**
  `breakDepth(tile) = clamp( quantileCutoff × shelfWidthFactor × marginFactor(tile), absoluteMaxShelfDepth, 0 )`
  - `quantileCutoff`: adaptive nearshore quantile (kept; sampling window = estimator, not extent).
  - `shelfWidthFactor`: from the `shelfWidth` knob (narrow 0.6 / normal 1.0 / wide 1.4) — the knob re-wire.
  - `marginFactor(tile)`: active margin <1 (shallower → narrower), passive ≥1 (deeper → wider) — margin physics.
  - `absoluteMaxShelfDepth`: deepest the gate may reach (safety clamp; does not bind on tested maps).
  - shelf = depth-eligible AND flood-reachable from shore (the only mathematically-necessary bound: BFS ≤ tile count).
- **Deleted:** `capTilesActive`, `capTilesPassive`, `capTilesMax` and the `dist > cap` gate.

Residual: no genuinely flat epicontinental-sea config exists in the current set; the absolute
floor is the guard for that case (a uniformly-shallow sea being all-shelf is physically correct,
not a bug). Re-confirm on any future ultra-shallow config.
