# Start Distribution — Predeclared Expectations

> Systematic-workstream gate 6: declare expected behavior **before** tuning, so
> verification cannot be retrofitted to the result. Baselines marked `TBD` are
> measured in slice S2 (the D0 region-balance metric) on fixed seeds before any
> behavior change lands. These extend — they do not replace — the existing
> placement ledger (`docs/projects/placement-realignment/expectations.md`,
> E1.x).

Measurement harness: the placement metrics diagnostic
(`mods/mod-swooper-maps/src/dev/diagnostics/placement-metrics.ts`) over a fixed
seed set at standard size, plus `.bin` u8 layer dumps
(`diag run-standard-dump --configFile`) for spatial inspection.

## New expectations (this workstream)

### ER1 — Player allocation tracks region capacity
A homeland region's seated start count is proportional to its settleable
capacity and never exceeds its feasibility ceiling.
- **Metric:** per-region `seatedStarts` vs `feasibleCeiling` and vs
  capacity-proportional target.
- **Target:** `seatedStarts_r ≤ feasibleCeiling_r` for every region (hard); and
  `|seatedStarts_r − proportionalTarget_r| ≤ 1` after balance-bias + rounding.
- **Baseline:** TBD (today: fixed 4/4 regardless of capacity).

### ER2 — No single small landmass hoards half the civs (the headline bug)
No single landmass holds a disproportionate share of starts relative to its
share of settleable capacity.
- **Metric:** `maxSingleLandmassStartShare` = max over landmasses of
  (starts on landmass / total starts), reported alongside that landmass's
  capacity share.
- **Target:** `maxSingleLandmassStartShare ≤ landmassCapacityShare + tolerance`
  (tolerance ≈ one start). Concretely, the failing pattern "≥ 50% of civs on a
  landmass holding < 25% of capacity" must not occur on any baseline seed.
- **Baseline:** TBD (expected to FAIL today — this is the reported symptom).

### ER3 — Starts are spatially dispersed, not clumped
Beyond the pairwise floor, starts spread across each region's extent.
- **Metric:** normalized spatial-spread index — mean nearest-neighbor start
  distance ÷ the ideal even-dispersion distance for `N` starts over the
  settleable area (1.0 = perfectly even; → 0 = clumped). Reported per region and
  global.
- **Target:** global spread index ≥ a threshold calibrated at S2 baseline (aim:
  materially above baseline; provisional ≥ 0.6), with no region < 0.4.
- **Baseline:** TBD (today: greedy quality-first, only pairwise floor).

### ER4 — Reconciliation is rare and loud
Capacity rebalancing across regions is a recorded exception, not the norm.
- **Metric:** `regionReassignedRate` = reassigned seats / total, all surfaced as
  region relaxations in the fairness report.
- **Target:** ≤ 5% of seats on balanced maps; every reassignment recorded
  per-seat (never silent). Mirrors E1.7.
- **Baseline:** TBD.

## Preserved expectations (must not regress)

The kept gates from the existing ledger — the redesign changes *where* and *how
many*, not the per-tile quality bar:

- **E1.1** 0% starts on water / lake / mountain / volcano / natural-wonder.
- **E1.2** Exactly the configured alive-player count seated, correct ids
  (now sourced from `getAliveMajorIds()`, not slot index).
- **E1.3** ≥ 80% of starts with freshwater (river/lake) within ≤ 1 tile.
- **E1.4** Mean start fertility ≥ 1.05× local land mean (radius 2).
- **E1.5** Min pairwise start spacing ≥ 6 tiles (official floor); score tapers
  to 12. *Spread (ER3) is additive to — not a replacement for — this floor.*
- **E1.6** Worst-pair fairness gap on `StartRecord.score` ≤ 0.3.
- **E1.8** ≤ 10% of starts in climate extremes.

## Falsifier

If, after D1–D4, a baseline seed still places ≥ 50% of civs on a landmass
holding < 25% of settleable capacity (ER2 fail) **and** that landmass had a
feasible alternative region with spare capacity, the homeland model is still
mis-allocating and the design is wrong — stop and re-frame rather than tune
weights.
