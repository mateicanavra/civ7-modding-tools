## 1. Metrics Harness

- [x] 1.1 Add `mods/mod-swooper-maps/src/dev/diagnostics/placement-metrics.ts`:
  headless standard-recipe run (mock adapter, studio-worker compile shape) +
  per-expectation metric computation (E1.1–E1.8, E2.1/E2.4/E2.6/E2.8/E2.9,
  E3.1–E3.3) with explicit skip statuses for E1.6, E2.2/E2.3/E2.5/E2.7, E3.4,
  E4.1–E4.4.
- [x] 1.2 Add multi-seed aggregation (`aggregatePlacementMetrics`: min/mean/max
  + boolean trueCount per summary key).
- [x] 1.3 Add runner `scripts/placement/placement-metrics.ts`
  (`--seed`, `--seeds`, `--size`, `--players`, `--studio-mapinfo`, `--json`)
  and root `verify:placement-metrics` script.

## 2. Harness Self-Test

- [x] 2.1 Add
  `mods/mod-swooper-maps/test/placement/placement-metrics-harness.test.ts`:
  all expectation IDs present, statuses declared, computed summaries finite,
  deterministic per seed, aggregation schema stable. No expectation-range
  assertions (S0 reports, never gates).

## 3. Instrumented Baseline

- [x] 3.1 Run 5 seeds (1337–1341) at standard size with hemisphere-split
  mapInfo; run one studio-mapinfo probe
  (`PlayersLandmass1 = PlayersLandmass2 = 8`) for the E1.2 doubling defect.
- [x] 3.2 Record
  `docs/projects/placement-realignment/evidence/baseline-2026-06-09.md`:
  observed values per expectation ID vs predeclared range, confirmed defects,
  non-reproduced predictions (marine resources, fallback usage, spacing
  decay), exact reproduction commands.

## 4. Verification

- [x] 4.1 Run the harness self-test via `bun test`.
- [x] 4.2 Run `bun run --cwd mods/mod-swooper-maps check`.
- [x] 4.3 Run `bun run verify:placement-metrics -- --seed 1337 --seeds 5 --size standard`.
- [x] 4.4 Run `bun run openspec -- validate placement-realignment-s0-metrics --strict`.
- [x] 4.5 Run `bun run openspec:validate`.
