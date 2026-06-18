# Verification And Runtime Proof

Proof classes are tracked separately. This slice authored the change packet only;
all behavioral proof classes are **open**.

## Live Adjacency Probe (Task 1 — gate) — PASSED

- Status: **PASSED 2026-06-18.** The behavioral gate is cleared.
- Method: bounded read-only `game exec` against the live tuner (`--state Tuner`,
  port 4318) on an already-running in-game session (`game status` →
  `inGame:true`). No mod deploy / map regeneration (adjacency is pure grid
  geometry). Probe source: `/tmp/oddr-probe.js` (calls
  `GameplayMap.getAdjacentPlotLocation({x,y}, dir)` for `dir 0..NUM_DIRECTION_TYPES`
  at all four x/y parity combos).
- Engine output (grid `W=106 H=66`, `ND=6`), offsets `(dir,dx,dy)`:
  - (54,34) even-x even-y: `(0,1)(1,0)(0,-1)(-1,-1)(-1,0)(-1,1)`
  - (53,34) odd-x even-y: identical to (54,34)
  - (54,33) even-x odd-y: `(1,1)(1,0)(1,-1)(0,-1)(-1,0)(0,1)`
  - (53,33) odd-x odd-y: identical to (54,33)
- Conclusion: the neighbor set depends only on **y-parity** (identical across
  x-parity) → engine is **odd-R (row-offset)**. Exact table:
  - **y even** diagonals: `(-1,-1),(-1,1)` (west column)
  - **y odd** diagonals: `(1,-1),(1,1)` (east column)
  - always: `(-1,0),(1,0),(0,-1),(0,1)`
- This matches the predicted odd-R table in `design.md` exactly. The migration
  proceeds against this confirmed table.
- Boundary: this proves the engine's adjacency convention. It does NOT yet prove
  the migrated mod renders correctly in-game (separate proof class below).

## Local Tests — PASSED (2026-06-18)

- `tsc --noEmit` (mod): clean (after building SDK/mapgen-core/map-policy dists).
- biome on the 5 changed files: clean.
- mapgen-core unit suite (`nx test @swooper/mapgen-core`): **103 pass / 0 fail**
  (17 files), incl. vector-field divergence/curl and core-purity boundary.
- mod adjacency-sensitive suites (`bun test`): **51 pass / 2 skip / 0 fail**
  (8 files): plot-coasts, earthlike-coasts-smoke, hydrology-ocean-currents,
  drainage-routing (highest-risk consumer), world-balance-stats,
  maps-schema-valid, **shipped-map-identity (hashes unchanged → no config/
  generated drift)**, standard-run.

## Local Statistics / Diagnostics Dump — PASSED (2026-06-18)

- `run-standard-dump.ts` on `latest-juicy` 106x66 seed 12345. Analysis of the
  dumped `map.morphology.coasts.waterClass` layer:
  - counts: land=2568, coast=2206, ocean=2222 (land/water truth intact).
  - **EXPOSED land under engine odd-R adjacency: `0`** — zero land tiles border
    deep ocean; no notch is possible on the live engine.
  - EXPOSED land under legacy odd-Q adjacency: `46` — what the old model would
    have left wrong (the bug class), quantified.
- Boundary: the dump proves the AUTHORED surface against the probe-confirmed
  engine adjacency. Because the live engine IS odd-R, an authored surface with
  zero odd-R-exposed land cannot render a notch. The MockAdapter's own
  `validateAndFixTerrain` still simulates coast with a non-odd-R adjacency
  (hence ~46 `COAST_TERRAIN_RESTORED` ocean-reverts in the mock run — deep-shelf
  width, not notches); on the live engine those reverts should not occur. The
  in-game render below is the final confirmation.

## OpenSpec Validation

- Status: this packet — run `openspec validate mapgen-core-hex-oddr-adjacency-correction --strict`
  and `bun run openspec:validate`; record result on commit.

## Runtime / In-Game Proof (closure gate)

- Status: **pending**.
- Planned: deploy + run a generated map on the live engine; capture a render
  showing natural island coastlines, no notch, no floating plateaus. Record
  branch/commit/deploy path/seed/screenshot. This is the only proof class that
  can validate the correction (the MockAdapter shares the model).
