# Tasks

Grouped by domino = Graphite slice. `[ ]` open, `[x]` done. Each slice is one
branch stacked on `start-dist-homeland-rebalance`. Verify the odd-R distance
helper name on this branch before any distance math.

## S1 — Design + OpenSpec (this branch)
- [x] Four-lane systematic diagnosis (planner, inputs, policy/engine, gameplay)
- [x] Project packet: `diagnosis.md`, `design.md`, `expectations.md`
- [x] OpenSpec change: proposal, design, spec delta, tasks
- [ ] `bun run openspec -- validate start-distribution-homeland-rebalance --strict`
- [ ] Pre-code review gate (authority/owners/scope/no-shortcut language)

## S2 — D0 region-balance metric + baseline (parallel with S3)
- [ ] Add metric ids to `dev/diagnostics/placement-metrics.ts`: starts-per-region
  vs capacity (ER1), `maxSingleLandmassStartShare` vs capacity share (ER2),
  normalized spatial-spread index (ER3), `regionReassignedRate` (ER4)
- [ ] Harness-works test (metric reported with valid status), not behavior assert
- [ ] Measure + record baseline over the fixed seed set →
  `docs/projects/start-distribution-homeland-rebalance/evidence/baseline-2026-06-20.md`
- [ ] Confirm ER2 FAILS at baseline (reproduces the reported symptom)

## S3 — Policy primitives (`@civ7/map-policy/src/starts/`) (parallel with S2)
- [ ] `CIV7_START_PLACEMENT_POLICY_V0` (6/12 buffers, homeland model,
  `balanceBias`, `tilesPerStart` derivation)
- [ ] `balancedHemisphereSplit({ columnWeights, landmassCentroids, width })`
- [ ] `feasibleStartCeiling(settleableTiles, spacingFloor)`
- [ ] `apportionStartsByCapacity({ capacities, ceilings, total, balanceBias })`
  (largest-remainder + clamp + redistribute)
- [ ] `dispersionScore(plotIndex, seatedPlots, width)` (odd-R distance)
- [ ] Export `src/starts/` from `src/index.ts`; export needed `policy-grid` helpers
- [ ] Unit tests (determinism, total-preservation, feasibility clamp, balanced vs
  lopsided inputs, seam wrap)
- [ ] `bun run --cwd packages/civ7-map-policy test`

## S4 — D1 land-aware partition
- [ ] `plot-landmass-regions/index.ts:resolveSlotByTile` → `balancedHemisphereSplit`
  (settleable-land column weights; landmasses kept whole by centroid)
- [ ] Preserve artifact + engine `WEST`/`EAST`/`NONE` stamping + viz
- [ ] Step/unit test: asymmetric land splits near-evenly; dominant continent is cut
- [ ] Metric delta: region capacity balance improves vs S2 baseline

## S5 — D2 capacity-proportional allocation
- [ ] `runtime.ts` / `derive-placement-inputs`: stop fixing per-region split;
  total `N` from `getAliveMajorIds()` (MapInfo sum as fallback)
- [ ] `plan-starts/strategies/default.ts`: compute per-region capacity + ceilings
  from screened candidates; call `apportionStartsByCapacity`
- [ ] `seat-identity.ts buildSeatIdentities`: bind seats to computed per-region counts
- [ ] Tests: land-poor region gets fewer; feasibility beats balance; seats == alive count
- [ ] Metric delta: ER1 passes; ER2 improves

## S6 — D3 dispersion
- [ ] Per-landmass quotas within region (reuse `apportionStartsByCapacity`)
- [ ] `selection-ladder.ts`: farthest-point/dispersion term + quota constraint on
  the regional rung; adaptive spread weight under capacity pressure
- [ ] Tests: multi-landmass regions seat each landmass; seats fan out; floor held
- [ ] Metric delta: ER3 passes

## S7 — D4 reconciliation + verification + closure
- [ ] `default.ts:702-719`: capacity-aware rebalance (recorded), replaces zero-only
- [ ] Calibrate `tilesPerStart` + `balanceBias` against baseline
- [ ] Full gate run: ER1–ER4 pass, E1.1/E1.2/E1.3/E1.4/E1.5/E1.6/E1.8 no regression
  → `evidence/s-results-2026-06-20.md`
- [ ] `bun run --cwd mods/mod-swooper-maps check` + `nx run mod-swooper-maps:build`
- [ ] In-game live verification (closure test) + screenshots
- [ ] OpenSpec validate; hand off to `civ7-open-spec-workstream` / `civ7-systematic-workstream` closure
