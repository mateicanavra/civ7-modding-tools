## 1. Pin The Engine Table (live probe — gate before behavioral change)

- [x] 1.1 Ran a bounded read-only `getAdjacentPlotLocation` probe via `game exec`
      on a live in-game session; recorded the engine's six neighbor `(dx, dy)`
      offsets for all four x/y parity combos.
- [x] 1.2 Confirmed: neighbor set depends only on row parity (odd-R); diagonals
      on the west column for even rows, east column for odd rows. Matches the
      predicted table exactly.
- [x] 1.3 Recorded the probed table in `workstream/verification-and-runtime-proof.md`.

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

- [x] 3.1 `hex-oddq.ts`: odd-R offset table; selector `x & 1` -> `y & 1`.
- [x] 3.2 `hex-space.ts`: row-shift projection (`HALF_HEX_WIDTH` on odd rows);
      `oddqToCube` body -> odd-R (`q = x - (y - (y&1))/2; r = y`);
      `hexDistance...PeriodicX` follows. (Names kept; rename is Task 2.)
- [x] 3.3 `vector-field.ts`: odd-R offset table (matches canonical), row-parity
      selector, row-based direction-vector base; divergence/curl follow.
- [x] 3.4 `policy-grid.ts`: neighbor deltas -> canonical odd-R set keyed `y & 1`.
- [x] 3.5 Verified `components.ts`/`flow-routing.ts` import the primitives (no
      inlined offsets); they follow automatically.

## 4. Consolidate The Coast Ring (supersede PR #1811)

- [x] 4.1 Authored the `plotCoasts` coast-ring safety net using canonical odd-R
      `getHexNeighborIndicesOddQ`; folded into `policyCoastMask` /
      `promotedOceanToCoast` with the `landAdjacentCoastRing` trace event.
- [x] 4.2 No Moore-8 widening present (re-authored fresh off main with the
      six-neighbor odd-R ring); dump confirms zero land-adjacent ocean under odd-R.
- [x] 4.3 PR #1811 recorded as superseded in `next-packet.md`.

## 5. Verification (local)

- [x] 5.1 mapgen-core unit suite green (103/0), incl. vector-field divergence/curl.
- [x] 5.2 mod fixture suites green (51/0): plot-coasts, world-balance,
      drainage-routing, shipped-map-identity, maps-schema-valid, standard-run.
- [x] 5.3 Diagnostics dump: **exposed land = 0 under engine odd-R** (46 under
      legacy odd-Q); land/water counts intact.
- [~] 5.4 Single-seed delta recorded; multi-seed matrix sweep still recommended.
- [x] 5.5 No golden/identity drift needed — `shipped-map-identity` hashes
      unchanged; land/water truth intact (purely runtime adjacency change).
- [x] 5.6 `bun run --cwd mods/mod-swooper-maps check` clean; biome clean; OpenSpec
      strict + repo-wide validate pass.

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
