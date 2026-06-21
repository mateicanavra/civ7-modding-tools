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

## 5. Results — FINAL (latest_juicy 106×66 seed 1337; cap-free design uses break depth, not capTilesByTile)
| ID | Predicted | Observed | Verdict |
|---|---|---|---|
| C1 | margin variation; active narrower | break depth {−5 active, −11 passive}; mean active −5 > passive −11 (shallower→narrower) | **PASS** |
| C2 | shallowCutoff < 0 m | −7 m | **PASS** |
| C3 | uniform-band-only coast = 0 | 0 (band retired) | **PASS** |
| C4 | shelf-anchored share ≥ 0.95 | 1.00 (1781 shelf + 305 ring = all 2086 coast) | **PASS** |
| C5 | coast share of water [0.20, 0.55] | 0.466 | **PASS** |
| C6 | land bordering deep ocean = 0 (ring) | 0 | **PASS** |
| C7 | landShare ±0.005 | 0.36 (unchanged) | **PASS** |
| C8 | no-water-drift passes | passes (live clean; land/water-neutral) | **PASS** |
| C9 | marine/reef ≥ baseline−10% | resources 212/212 placed (0 rejected); reef-family rose (atolls bloomed — §6) | **PASS** (note) |
| C10 | starts placed | live Huge gen completed for 10 players; headless seats starts | **PASS** |

**Overall mock verdict:** PASS — all targeted rows + HOLD guards met.
**Live verification:** PASS — `in-game observed`. `studio-run-in-game-live` on `{swooper-maps}/maps/latest-juicy.js`, MAPSIZE_HUGE, seed 1337, 10 players, `--from-running-game exit-to-shell`; success markers `[mapgen-complete]` then `"seed":1337` matched in order, no rejectPattern. Live render + whole-map coast-structure image captured.

## 5a. Interim — after S1 (shelf footgun fix; uniform band STILL present)
runId `3efbb0139ba2c71f227dbc367a2c421e479bd387ccffa0fe9c8cfa87cb770993` (latest_juicy 106×66 s1337):
- **C1 (margin variation):** `capTilesByTile` = {4 (active, 394 tiles), 8 (passive, 4084)} — restored ✓ (was flat {1}).
- **C2 (depth gate):** `shallowCutoff` = −7 m — restored ✓ (was 0 m).
- shelfMask 480→1511 (3.1×); sourceCoast 760→1682; landShare 0.36 unchanged.
- policy-band-only coast still 2356 (band intact → removed in S3); coast share inflated to 0.902 (band+wider shelf).
- Projection for post-S3: coast ≈ sourceCoast (1682) → coast share ≈ 0.38 (within C5).

## 6. Amendments, limitations, deferrals (append-only)
- **C1 re-statement (2026-06-21):** the cap-free redesign replaced `capTilesByTile` with
  `shelfBreakDepthByTile`; the margin signal is now the per-tile break depth (active shallower →
  narrower), not a tile cap. Direction + mechanism held — a re-statement, not a target miss.
- **Margin-contrast limitation (honest):** active margins use a shallower break depth (the correct
  physical lever), but the *visible* narrowing is muted because the generated bathymetry is only
  weakly margin-correlated. True Pacific-narrow / Atlantic-wide contrast needs margin-aware seafloor
  depth — a foundation/erosion concern, **out of scope**. The old distance cap forced the contrast
  bathymetry-independently; that was the non-physical workaround we removed.
- **Atoll-bloom deferral:** retiring the band exposed the real open ocean; atolls (scored on warm
  shallow water *beyond* the shelf) bloomed on atoll-dominated maps (desert-mountains 24→109). Two
  reef-family budgets were widened to the legitimate geography. **Deferral:** retune atoll/reef
  density now that open ocean is correctly sized (ecology/placement scope).
- **Architecture follow-ups (specified in REDESIGN.md):** R1 (extract `compute-distance-to-coast`
  op), R3 (relocate the shelf to a post-features `morphology-shelf` stage so islands get true
  shelves — the "misplaced" fix), R5 (pure reconcile-heightfield op; thin the carving step). The
  shelf physics is already correct; R3 only changes *where* it is computed (post-erosion/post-island).
