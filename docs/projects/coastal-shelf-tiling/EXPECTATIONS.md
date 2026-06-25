# Earth-like Expectation Ledger — Coastal Shelf Tiling

> Step-5 GATE. Declared BEFORE tuning/implementation. Amendments are append-only (§6) with runId+date.
> Grounding config `latest_juicy`; reference size Huge **106×66, seed 1337** (matches the baseline dump).

## 0. Change under test
- **Request:** make coastal tiles follow the physics shelf (margin-aware, depth-gated) instead of a
  uniform fixed-distance band.
- **Arm:** behavioral / generation-logic. **Domains:** morphology (shelf), projection (`map-morphology`),
  policy adapter (`@civ7/map-policy`).
- **Structural alternative chosen:** shelf-anchored coast (`coast = shelfMask ∪ shoreline-ring`, uniform
  band removed). Rejected: band∩shelf (Alt B), upstream bathymetry (Alt C). See `DESIGN.md`.
- **Hypothesis (falsifiable):** coast width is currently set by a uniform `coastBufferTiles` band that
  overrides the margin-aware shelf; removing it + un-flattening the shelf yields physically varying
  coast (passive-margin-wide, active-margin-narrow) while preserving Civ7 coast-ring + marine adequacy.
- **Baseline run:** runId `1f0df895725b5e6640a66ee0fc13049f23c35fb5d9406a9e6402834c5733bc7f`
  (latest_juicy, 106×66, seed 1337).

## 1. Baseline (measured, BEFORE)
| Metric | Baseline (latest_juicy 106×66 s1337) |
|---|---|
| coast tiles / ocean tiles | 2594 / 1884 |
| coast share of water | 0.579 |
| **policy-band-only coast** (band, not physics) | **1834 (70.7% of coast)** |
| shelf-derived coast | 480 (18.5% of coast) |
| `capTilesByTile` distinct values (water) | **{1} — flat** |
| `shallowCutoff` | 0 m |
| shelfMask count | 480 |

## 2. Pre-declared expectations (targets, AFTER — measured at the same size/seed; report mean[min..max] over ≥5 seeds)

| ID | Metric | Direction | Pre-declared bound | Physical / gameplay rationale |
|---|---|---|---|---|
| **C1** | `capTilesByTile` distinct values | UP | ≥ 2 distinct; mean(active-margin cap) < mean(passive-margin cap) | margin-aware shelf restored (Atlantic-wide vs Pacific-narrow) |
| **C2** | `shallowCutoff` | DOWN (more negative) | < 0 m (strictly; not collapsed to 0) | a real shelf-break depth gate exists |
| **C3** | uniform-band-only coast (ocean promoted purely by fixed distance) | DOWN | **= 0** | the uniform distance band is gone |
| **C4** | shelf-anchored share of coast (coast tiles in shelfMask ∪ shoreline-ring ∪ minimal land-ring) | UP | ≥ 0.95 | coast is now physics-driven, not band-driven |
| **C5** | coast share of water | DOWN then HOLD | within [0.20, 0.55] | shelf is narrower than the bloated band but still a substantial neritic zone |
| **C6** | land-tile coast-ring coverage | HOLD | **= 100%** of land tiles have ≥1 adjacent coast | no floating cliffs; coastal settlement legality |
| **C7** | `landShare` | HOLD | within ±0.005 of baseline | coast change must not move land/water |
| **C8** | no-water-drift assertion | HOLD | passes at every guard (`map-morphology`, `map-elevation`) | engine ownership invariant intact |
| **C9** | marine resource count (placement-metrics) | HOLD/floor | ≥ baseline − 10% AND within official feasible band | shelf must still support marine resources/reefs (REPORT concern: 1-ring too thin) |
| **C10** | player starts placed | HOLD | all 10 players placed; island starts within `maxIslandStartCoastDistance` | start legality + island/mainland connectivity preserved |

Guard rows (HOLD) C6–C10 are not optional — the most likely failure is a coast that is prettier but
under-produces marine sites or breaks the coast ring.

## 3. Pass / fail rule (declared now)
- **PASS** = C1–C5 land inside declared bounds AND every HOLD guard (C6–C10) holds, over the seed set.
- **FAIL (target miss)** = C1–C5 miss → hypothesis/implementation wrong; loop to step 4.
- **FAIL (collateral)** = any C6–C10 breaks → coverage/legality regression; loop to step 4/6.
- **AMEND** = a bound was mis-set but direction+mechanism held → record in §6 with runId+date, re-judge.
- Mock metrics gate entry to live; **closure requires the step-7 live in-game gate** (`studio-run-in-game-live`)
  on latest_juicy, plus marine/start adequacy (placement-metrics) and parity.

## 4. Diagnostic command (reproducible)
```bash
cd mods/mod-swooper-maps
bun ./src/dev/diagnostics/run-standard-dump.ts -- 106 66 1337 --label coast-juicy \
  --configFile "$PWD/src/maps/configs/latest-juicy.config.json"
# then read manifest.json + data/*.bin u8 layers: map.morphology.coasts.{waterClass,sourceCoastMask,
#   policyCoastMask→coastRingMask,shelfMask,coastalWater}, morphology.coastlineMetrics.shelfMask, capTilesByTile
```

## 5. Results (fill AFTER)
| ID | Predicted | Observed (mean[min..max], N) | runId | Verdict |
|---|---|---|---|---|
| C1 | ≥2 distinct; active<passive | _pending_ | | |
| C2 | < 0 m | _pending_ | | |
| C3 | = 0 | _pending_ | | |
| C4 | ≥ 0.95 | _pending_ | | |
| C5 | [0.20, 0.55] | _pending_ | | |
| C6 | 100% | _pending_ | | |
| C7 | ±0.005 | _pending_ | | |
| C8 | passes | _pending_ | | |
| C9 | ≥ baseline−10% | _pending_ | | |
| C10 | 10/10 placed | _pending_ | | |

**Overall mock verdict:** _pending_  ·  **Live verification:** _pending_

## 5a. Interim — after S1 (shelf footgun fix; uniform band STILL present)
runId `3efbb0139ba2c71f227dbc367a2c421e479bd387ccffa0fe9c8cfa87cb770993` (latest_juicy 106×66 s1337):
- **C1 (margin variation):** `capTilesByTile` = {4 (active, 394 tiles), 8 (passive, 4084)} — restored ✓ (was flat {1}).
- **C2 (depth gate):** `shallowCutoff` = −7 m — restored ✓ (was 0 m).
- shelfMask 480→1511 (3.1×); sourceCoast 760→1682; landShare 0.36 unchanged.
- policy-band-only coast still 2356 (band intact → removed in S3); coast share inflated to 0.902 (band+wider shelf).
- Projection for post-S3: coast ≈ sourceCoast (1682) → coast share ≈ 0.38 (within C5).

## 6. Amendments (append-only; runId + date required)
- _(none yet)_
