# Coastal Shelf Tiling — Design & Slice Sequence

> Step 4–5 of the mapgen-workstream loop. Reads from `FRAMING.md` (route, frame, root-cause chain).
> Records the chosen design, the rejected structural alternative, and the OpenSpec/Graphite domino sequence.

## Physics first principles (how coast *should* be assigned)

The Civ7 `TERRAIN_COAST` analogue is the **continental shelf / neritic zone**: shallow (< shelf-break
depth), nearshore water, gently sloping from the shoreline to the shelf break, beyond which the floor
drops to abyssal `TERRAIN_OCEAN`. Its defining physical property is **width by margin type**:

- **Passive margins** (trailing/divergent edges — Atlantic analogue): broad, shallow shelves
  (sediment-loaded, no subduction). → wide coast band.
- **Active margins** (convergent/transform/subducting — Pacific analogue): narrow, steep shelves
  (trench close to shore). → thin coast band.
- Every shoreline has *some* shallow nearshore water before the drop-off → a guaranteed thin ring.

So the physically-correct coast = **the continental shelf**: `water ∧ shallow(bathymetry) ∧
within margin-dependent distance of land`, plus a guaranteed 1-tile shoreline ring. This is *exactly*
what `compute-shelf-mask` already computes (margin-aware `cap` + bathymetric `shallowCutoff`). The op
is correct physics; it is currently flattened by config and overridden by a uniform band (see FRAMING
root-cause chain). **The fix is to let the shelf own the coast, not to invent new physics.**

## Chosen design — "Shelf-anchored coast"

Final water classification in `map-morphology/plot-coasts`:

```
waterClass[i] = LAND                              if landMask[i] == 1
              = COAST  if water ∧ ( shelfMask[i]==1            // physics shelf (margin-aware, depth-gated)
                                  ∨ coastalWater[i]==1 )       // guaranteed shoreline ring (1-tile)
              = COAST  if ocean ∧ adjacent-to-land             // heal late land injection / island peaks
              = OCEAN  otherwise
```

i.e. **coast = `sourceCoastMask` (shelf ∪ shoreline ring) ∪ land-adjacent ring** — the uniform
`coastBufferTiles` distance band is removed. Coast width now varies with margin type and bathymetry.

Supporting changes:
- **Shelf physics restored:** fix the `capTilesMax` double-clamp so margin-aware caps (active<passive)
  survive, and correct `latest_juicy`'s shelf block (`capTilesMax:1`, `shallowQuantile:0.9`) to
  non-degenerate values. The shelf becomes the real driver.
- **Coast-ring as a named policy primitive:** the "every land tile has ≥1 adjacent coast" guarantee
  moves into the policy adapter `@civ7/map-policy` as `applyCiv7CoastRingPolicy` (replacing the
  misappropriated `applyCiv7CoastClassificationPolicy` / `oceanWaterColumns` distance band). Policy
  lives in the policy package, not ad hoc in the projection.
- **De-duplicate:** `ecology-features/score-layers` stops recomputing the coast policy and reads the
  authoritative `coastClassification.waterClass` artifact, so feature scoring sees the real coast.
- **Retire dead surface:** once unused, remove `applyCiv7CoastClassificationPolicy`, `coastBufferTiles`,
  and the `oceanWaterColumns` misappropriation from `@civ7/map-policy`; rename artifact field
  `policyCoastMask` → `coastRingMask` (viz/diagnostics only).

Keep: `restoreProjectedCoastTerrain` (the structural locus that keeps coast MapGen-owned across
map-rivers/placement) and the no-water-drift guards.

## Rejected structural alternative (step-5 requirement)

**Alt B — "Band clamped to shelf":** keep `applyCiv7CoastClassificationPolicy` but intersect the
distance band with the shelf (`band ∩ shelfMask`) so it can only *fill within* the shelf.
**Rejected:** it keeps the misappropriated `oceanWaterColumns` constant and a redundant distance pass
that can only ever shrink the shelf it's intersected with — pure indirection. The shelf already *is*
the band; layering a distance gate on top is the confusing indirection we're removing, not adding to.

**Alt C — "Fix upstream bathymetry/sea-level instead":** treat the weak shelf as an upstream surface
problem. **Rejected** (held as the FRAMING falsifier): evidence shows the shelf op is sound; the loss
is config + override, not a missing shelf break. Out of frame exterior.

## Slice sequence (OpenSpec dominoes → Graphite stack)

Causally linear (coast determination is a tight chain): shelf must be correct *before* the projection
relies on it; the policy primitive must exist *before* the projection wires it; cleanup follows.

| Slice | Behavior change | Lands in | Proof (per-slice) |
|---|---|---|---|
| **S0** (this branch) | none — framing + design + ledger | `docs/projects/coastal-shelf-tiling/` | doc review |
| **S1 — shelf footgun fix** | shelf becomes margin-aware + non-degenerate | `domain/morphology` clamp semantics + config audit (`latest-juicy` et al.) | tests + diag:dump (capTilesByTile varies; shallowCutoff<0; shelf share up) |
| **S2 — coast-ring policy primitive** | none (pure addition) | `@civ7/map-policy` (`applyCiv7CoastRingPolicy`) | unit test on the primitive |
| **S3 — shelf-anchored projection** | **coast follows shelf; uniform band removed** | `plot-coasts.ts`, `score-layers`, artifact field, tests, diagnostics | diag:dump ledger rows C1–C3; no-water-drift |
| **S4 — retire dead policy surface** | none (refactor/cleanup) | remove `applyCiv7CoastClassificationPolicy`/`coastBufferTiles`/`oceanWaterColumns` | build + tests green; boundaries lint |
| **S5 — live verification milestone** | none — proof | live gate + parity + placement-metrics | `studio-run-in-game-live`; ledger close |

Each implementation slice = one OpenSpec change + one Graphite branch stacked on the prior; artifacts
regenerated in-slice; architecture review (Grit/Biome boundaries) per slice. Finalization hands off to
`civ7-open-spec-workstream`.
