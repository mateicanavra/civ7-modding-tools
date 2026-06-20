# Tasks

Grouped by domino = Graphite slice on `start-dist-homeland-rebalance`. Status as
of 2026-06-20: D0–D3 implemented, locally verified, and **in-game closure
PASSED** (`in-game observed`, Huge/earthlike/10p/seed 1337).

## S1 — Design + OpenSpec (branch `start-dist-homeland-rebalance`)
- [x] Four-lane systematic diagnosis (planner, inputs, policy/engine, gameplay)
- [x] Project packet: `diagnosis.md`, `design.md`, `expectations.md`
- [x] OpenSpec change: proposal, design, spec delta, tasks
- [x] `openspec validate start-distribution-homeland-rebalance --strict`
- [x] Pre-code review gate (scope/approach confirmed with user before code)

## S2 — D0 region-balance metric + baseline (branch `start-dist-2-region-metric`)
- [x] Metric ids E5.1 (ER1), E5.2 (ER2), E5.3 (ER3), E5.4 (ER4) in `placement-metrics.ts`
- [x] Harness self-test extended to expect E5.x
- [x] Baseline recorded (`evidence/baseline-2026-06-20.md`); ER2 FAILS at baseline (bug reproduced)

## S3 — Policy primitives (branch `start-dist-3-policy-primitives`)
- [x] `CIV7_START_PLACEMENT_POLICY_V0`, `balancedHemisphereMeridian`,
  `hemisphereSlotForColumn`, `feasibleStartCeiling` (+`startFootprintTiles`),
  `apportionStartsByCapacity`, `dispersionTerm` in `@civ7/map-policy/src/starts`
- [x] Exported from `src/index.ts`
- [x] 18 unit tests; `bun test` + tsc + Biome clean; package builds

## S4 — D1 land-aware partition (branch `start-dist-4-partition`)
- [x] `plot-landmass-regions` uses `balancedHemisphereMeridian` + circular centroid
- [x] Artifact + engine WEST/EAST/NONE stamping + viz preserved
- [x] Region-projection test passes; metric delta recorded (gap 0.353 → 0.263)

## S5 — D2 capacity-proportional allocation (branch `start-dist-5-allocation`)
- [x] Per-homeland capacity + feasibility ceilings; `apportionStartsByCapacity`
- [x] `buildSeatIdentities` bound to computed allocation; op reports actual split
- [x] `feasibleStartCeiling` ≥1 for non-empty region (+ regression test)
- [x] Ladder unit tests updated; over-subscription degrade-as-data test added
- [x] Metric delta: ER1 passes (gap 0.088), ER2 0/5 (headline bug eliminated)

## S6 — D3 dispersion (branch `start-dist-6-dispersion`)
- [x] Region-aware dispersion target via `dispersionTerm`; floor/relaxation unchanged
- [x] Metric delta: ER3 spreadIndex 0.797 → 0.943 (allocation undisturbed)

## S7 — Verification + closure (this branch)
- [x] Full gate run (5 seeds): ER1–ER4 pass; E1.1/E1.3/E1.4/E1.5/E1.6/E1.8 no regression
  → `evidence/results-2026-06-20.md`
- [x] `nx run mod-swooper-maps:build` (schema-compile gate) passes
- [x] `bun run --cwd mods/mod-swooper-maps check` **fully green (0 errors)** —
  the pre-existing `hydrography.slopeClass` base error is fixed in
  `fix-hydrography-slopeclass-typeerror` at the stack base
- [x] Calibration note for `balanceBias` / `spacingFootprintFactor` / dispersion cap
- [x] **In-game live verification (closure test)** — `studio-run-in-game-live
  --mutate`, `swooper-earthlike` @ `MAPSIZE_HUGE` (106×66), 10 players, seed
  1337: full 53-step recipe → `[mapgen-complete]` + `"seed":1337`, all placement
  steps `ok`, no rejectPattern. Label `in-game observed`. See
  `evidence/results-2026-06-20.md` (Proof labels).
- [x] Final OpenSpec validate (`--strict`) re-run after closure; handoff to
  `civ7-open-spec-workstream` closure.
