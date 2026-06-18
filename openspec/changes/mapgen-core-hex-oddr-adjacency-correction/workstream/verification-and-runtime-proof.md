# Verification And Runtime Proof

Proof classes are tracked separately. This slice authored the change packet only;
all behavioral proof classes are **open**.

## Live Adjacency Probe (Task 1 — gate)

- Status: **pending**. Must run before any behavioral commit.
- Path: `mods/mod-swooper-maps/src/dev/diagnostics/live-parity.ts` or a bounded
  read-only `getAdjacentPlotLocation` probe per `civ7-live-map-launch-and-capture`.
- To record: for tiles at both row parities, the engine's six `(dx,dy)` offsets;
  pass/fail vs the predicted odd-R table; branch/commit/log boundaries.

## Local Tests

- Status: **pending** (no behavior changed yet in this slice).
- Planned: mapgen-core neighborhood/hex-space/vector-field unit tests;
  `@civ7/map-policy` tests; mod fixtures (plot-coasts, world-balance-stats,
  flow/drainage routing, shipped-map-identity, maps-schema-valid, standard-run).

## Local Statistics / Diagnostics Dump

- Status: **pending**.
- Planned: standard-pipeline dump (`run-standard-dump.ts --configFile`) asserting
  zero coastless land on deep ocean under the **engine (odd-R)** adjacency, with
  the corrected six-neighbor ring and Moore-8 widening removed; pre-declared
  adjacency-delta bands vs observed (see expectation-strategy-ledger).
- Boundary: the dump proves the authored surface via the MockAdapter; it does
  **not** prove the rendered engine surface.

## OpenSpec Validation

- Status: this packet — run `openspec validate mapgen-core-hex-oddr-adjacency-correction --strict`
  and `bun run openspec:validate`; record result on commit.

## Runtime / In-Game Proof (closure gate)

- Status: **pending**.
- Planned: deploy + run a generated map on the live engine; capture a render
  showing natural island coastlines, no notch, no floating plateaus. Record
  branch/commit/deploy path/seed/screenshot. This is the only proof class that
  can validate the correction (the MockAdapter shares the model).
