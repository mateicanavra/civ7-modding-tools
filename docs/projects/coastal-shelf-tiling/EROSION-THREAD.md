# Thread 1 finding — erosion is NOT why the R3 shelf grew

> **Question (from the workstream resume):** the R3 relocation moved the shelf downstream so it now
> reads POST-erosion bathymetry. Did erosion shallow the nearshore seafloor (so more water passes the
> depth gate), and is the wider shelf "correct post-erosion physics" or "erosion over-shallowing"?
>
> **Answer: erosion contributes ZERO. The hypothesis is refuted.** The seafloor bathymetry is
> byte-identical before and after erosion. The entire R3 shelf growth is island injection — and 78% of
> it is a non-local *global-cutoff coupling*, not island shelves per se.

## Method (validated, reproducible)

- Config: `latest-juicy` (shelfWidth **wide**), Huge **106×66 seed 1337**; cross-checked on `swooper-earthlike`.
- Added two keeper debug bathymetry taps so the full chain is observable in one dump:
  `morphology-coasts` → `bathymetryPreErosion` (post-carve, pre-erosion), `morphology-erosion` already
  dumps the post-erosion buffer, and `morphology-shelf` → `bathymetryInput`/`landMaskInput` (the exact
  post-island state the shelf classifier reads).
- The viz dumper writes bytes **synchronously at dump time** (`dump.ts:187`), so each snapshot is the
  buffer's true state at that pipeline moment (not a late reference) — verified.
- `scripts/diag/analyze-erosion-bathymetry.ts` replays the **real** shelf physics
  (`compute-shelf-mask`) offline over each snapshot under controlled counterfactuals. The replica is
  byte-exact: offline shelf = **2300** tiles = live `shelfMask` bin (diff **0**); offline distance BFS
  matches the live shelf distance (diff **0**). So the counterfactual swaps are trustworthy.

## Result — factor isolation (latest-juicy, wide)

The pre-R3 shelf was computed in `morphology-coasts` on the pre-erosion/pre-island state, so the
decomposition is `OLD ≈ shelf(pre-erosion) → +Δerosion → +Δisland → NEW`:

| State (held: landmask/distance/boundary within each step) | Shelf tiles |
|---|---|
| pre-erosion, pre-island (≈ the OLD pre-R3 shelf) | 1788 |
| post-erosion, pre-island | **1788** |
| post-island (= NEW R3 shelf, validated vs live) | 2300 |

| Factor | Δ tiles | % of +512 growth |
|---|---|---|
| **Erosion** | **0** | **0%** |
| Island geometry (new island shelf rings + distance re-windowing, at the old cutoff) | +112 | 22% |
| **Global nearshore-cutoff shift** (islands add samples → cutoff −7 → −9 → deeper gate widens *every* shelf) | **+400** | **78%** |

Supporting evidence that erosion cannot touch the shelf:
- Pre- vs post-erosion bathymetry: **0 tiles changed** (byte-identical), on BOTH latest-juicy and swooper-earthlike.
- Erosion DID run: nonzero elevation deltas on all 6996 tiles. But it is a **subaerial** (flow-accumulation)
  process — max |Δ| on **land** = 2.69, max |Δ| on **water** = **0.057** engine-elevation units, with
  **0** water tiles at |Δ| ≥ 0.5. Every underwater change is ~2 orders of magnitude below the int16
  bathymetry quantization step, so the seafloor never changes. This is structural, not config-specific.
- `shallowCutoff`: −7 (pre-erosion) = −7 (post-erosion) → −9 (post-island). The deepening is caused by
  island samples, not erosion.

## Verdict

**"Correct physics" — and specifically NOT "erosion over-shallowing the nearshore."** There is nothing
to fix in erosion; it does not alter the seafloor. The R3 shelf growth is:
1. **Intended island-shelf physics** (+112): R3's whole point was that islands get real shelves once the
   shelf is computed after island injection. Working as designed.
2. **A non-local global-cutoff coupling** (+400, the dominant term): the shelf-break depth is a SINGLE
   global quantile over all nearshore samples map-wide. When islands inject many (often shallow)
   nearshore samples, the global cutoff deepens (−7→−9), which widens the depth gate **everywhere** —
   including continental margins nowhere near an island. So island *density* sets continental shelf
   *width*. That is physically questionable (a continent's shelf break shouldn't depend on island count
   elsewhere), but it is a deliberate consequence of the global-quantile design, not a bug, and
   `shelfWidth` still scales it via config.

This reconciles with the earlier component classification (82% of final shelf tiles border continents):
most of the +400 cutoff-shift tiles land on the big continental margins, even though islands *caused*
the shift.

## Recommendation

1. **Close the erosion question: no action.** Erosion is a non-factor; do not pursue an erosion/
   bathymetry-shallowing fix. Update the EXPECTATIONS C5 note (the "+0.10 is island shelves" framing is
   right in spirit but the dominant mechanism is the global-cutoff coupling, not island rings).
2. **Hand the real lever to Thread 2.** The +400-tile global-cutoff coupling is the concrete,
   quantified target for the margin-aware seafloor work: replace the single global `shallowCutoff`
   quantile with a **local** break-depth estimate (per-margin / per-connected-basin / per-region) so
   continental shelf width is decoupled from island density. That is the physically-grounded version of
   the same margin-contrast goal the realism lever already targets.
3. If no behavior change is wanted now, **0.563-at-wide is defensible** (correct island physics + a
   documented global coupling) and is narrowable via `shelfWidth`.

## Artifacts (keepers)

- `scripts/diag/analyze-erosion-bathymetry.ts` — factor-isolation harness (validates its shelf replica
  against the live bin; `SHELF_CONFIG` is pinned to latest-juicy-wide — update it for other configs, the
  validation gate will flag a mismatch).
- Debug bathymetry taps: `morphology-coasts/steps/ruggedCoasts.ts` (`bathymetryPreErosion`),
  `morphology-shelf/steps/computeShelf.ts` (`bathymetryInput` + `landMaskInput`).
- Repro: `bun ./src/dev/diagnostics/run-standard-dump.ts -- 106 66 1337 --label erosion-thread
  --configFile "$PWD/src/maps/configs/latest-juicy.config.json"` then
  `bun scripts/diag/analyze-erosion-bathymetry.ts dist/visualization/erosion-thread/<runId>`.
