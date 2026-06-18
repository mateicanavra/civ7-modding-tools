## 1. Pin The Engine Table (live probe — gate before behavioral change)

- [ ] 1.1 Run the live `getAdjacentPlotLocation` probe via
      `mods/mod-swooper-maps/src/dev/diagnostics/live-parity.ts` (or a bounded
      read-only probe per the `civ7-live-map-launch-and-capture` runbook) and
      record, for several tiles at both row parities, the engine's six neighbor
      `(dx, dy)` offsets.
- [ ] 1.2 Confirm the offsets match the predicted odd-R table (diagonals on the
      west column for even rows, east column for odd rows, keyed `y & 1`). If
      they differ, re-derive the table from the probe and update `design.md`
      before continuing.
- [ ] 1.3 Record the probed table in `workstream/verification-and-runtime-proof.md`
      with branch/commit/log boundaries.

## 2. Mechanical Rename (zero behavior change)

- [ ] 2.1 Rename `OddQ` → `OddR` across mapgen-core grid symbols
      (`forEachHexNeighborOddQ`, `getHexNeighborIndicesOddQ`,
      `forEachHexNeighborOddQWithDirection`, `getHexRadiusIndicesOddQ`,
      `oddqToCube`, `projectOddqToHexSpace`, `hexDistanceOddQPeriodicX`,
      vector-field `*OddQ`, `computeMaskDistanceFieldOddQ`,
      `collectMaskComponentsOddQ`) and all call sites, identifier-only.
- [ ] 2.2 Rename the `@civ7/map-policy` `forEachHexNeighborOddQ` and its
      consumers.
- [ ] 2.3 Run typecheck + biome + full test suite; confirm green (no behavior
      changed yet).

## 3. Correct The Canonical Model (behavioral)

- [ ] 3.1 `hex-oddq.ts`: replace the offset table with the probed odd-R table and
      change the selector from `x & 1` to `y & 1`.
- [ ] 3.2 `hex-space.ts`: `projectOddrToHexSpace` row-shift
      (`hx += y&1 ? HALF_HEX_WIDTH : 0`, `hy = y*HEX_HEIGHT`); `oddrToCube`
      (`q = x - (y - (y&1))/2; r = y`); point `hexDistance...PeriodicX` at it.
      Add `HALF_HEX_WIDTH`.
- [ ] 3.3 `vector-field.ts`: import the canonical offset table + projection from
      the grid lib (remove the duplicate `OFFSETS_*`); verify direction vectors
      and divergence/curl recompute from the corrected projection.
- [ ] 3.4 `policy-grid.ts`: replace the re-implemented neighbor deltas with the
      canonical odd-R neighbor set keyed `y & 1`.
- [ ] 3.5 Verify `components.ts` and `flow-routing.ts` carry no inlined offset
      assumptions and follow the corrected primitives.

## 4. Consolidate The Coast Ring (supersede PR #1811)

- [ ] 4.1 Author the `plotCoasts` coast-ring safety net (promote any ocean tile
      adjacent to land → coast) using the corrected odd-R `forEachHexNeighborOddR`;
      fold into `policyCoastMask` / `promotedOceanToCoast` with the
      `landAdjacentCoastRing` trace event.
- [ ] 4.2 Remove the Moore-8 / eight-offset superset widening; the corrected
      six-neighbor ring must leave zero land-adjacent ocean.
- [ ] 4.3 Mark PR #1811 superseded in the next packet; do not merge it.

## 5. Verification (local)

- [ ] 5.1 mapgen-core unit tests: neighborhood adjacency (assert engine table),
      hex-space distance, vector-field divergence/curl.
- [ ] 5.2 map-policy tests and mod fixture tests (plot-coasts, world-balance,
      flow/drainage routing, shipped-map-identity, maps-schema-valid,
      standard-run).
- [ ] 5.3 Standard-pipeline diagnostics dump: zero coastless land on deep ocean
      under the engine (odd-R) adjacency, corrected ring, no Moore-8 widening.
- [ ] 5.4 Pre-declared adjacency-delta expectations vs observed over the seed/
      config matrix (`workstream/expectation-strategy-ledger.md`); record in
      `workstream/verification-and-runtime-proof.md`.
- [ ] 5.5 Update golden/identity baselines that legitimately shifted; confirm no
      per-tile land/water truth drift.
- [ ] 5.6 `bun run --cwd mods/mod-swooper-maps check`, biome, `bun run openspec:validate`,
      and `openspec validate mapgen-core-hex-oddr-adjacency-correction --strict`.

## 6. Live Proof And Closure

- [ ] 6.1 Deploy and run a generated map on the live engine; capture a render
      showing natural island coastlines, no notch, no floating plateaus.
- [ ] 6.2 Record live proof with exact branch/commit/deploy/path boundaries.
- [ ] 6.3 Complete `workstream/closure-checklist.md`; disposition review findings;
      Graphite submit; downstream realignment recorded.

## 7. Downstream Realignment

- [ ] 7.1 Audit adjacency-derived consumers (coast metrics, components, distance
      fields, drainage routing, climate vector fields, resource/start spacing)
      for behavior shifts; record acceptance or follow-up per
      `workstream/downstream-realignment-ledger.md`.
- [ ] 7.2 Update the hex-convention audit doc disposition: engine-side migration
      no longer open.
