## Why

`mapgen-core-hex-oddr-adjacency-correction` (PR #1812) corrected the **four shared**
grid primitives to the engine's odd-R model (`hex-oddq.ts`, `hex-space.ts`,
`vector-field.ts`, `@civ7/map-policy/policy-grid.ts`) but left **multiple
inlined hex-geometry consumers on the legacy odd-Q model** (parity keyed on
`x & 1`, with their own duplicated offset tables). With the shared primitives now
odd-R, the pipeline was in a **mixed state**: geometry/neighborhood/distance =
odd-R, while plate topology and the entire climate/ocean/moisture vector family
stayed odd-Q.

odd-Q and odd-R neighbor sets differ by **exactly one neighbor on every tile**
(audit `civ7-engine-hex-adjacency-oddr`), so a partial migration is wrong
everywhere it touches adjacency — there is **no safe mixed state**. Worse, the
inlined climate/ocean ops built hex-space neighbor deltas with a **row-0 base**
projection (`getNeighborDeltaHexSpaceFrom(baseX, 0)`); under the corrected odd-R
`projectOddqToHexSpace` (which shifts ODD ROWS) that produces a **geometrically
degenerate neighbor** (length 3.0 vs the correct 1.732) and a per-tile parity
frame (`x & 1`) that disagrees with the geometry/divergence frame (`y & 1`) on
every tile.

Empirical proof (standard dump, latest-juicy 84×54 seed 1337, three states —
odd-Q baseline / mixed / fully-migrated): the wind-field column-parity sawtooth
(`col/row` energy) drops from windU 1.8 → **0.26**, windV 2.5 → **0.52**,
divergence → **0.52** once every consumer is on the shared odd-R primitive — i.e.
the degenerate-delta/`x&1`-frame artifact is removed and the wind field becomes
geometrically clean (row-dominant, as a smooth field should be).

This change completes the migration: **every live hex-geometry consumer routes
through the single canonical odd-R primitive** (or, where a project boundary
forbids the import — the `kind:adapter` mock — the table is corrected in place
and kept in sync). It also removes dead code surfaced during the audit.

## Target Authority Refs

- Direct current user decision (this session): finish the odd-R migration across
  all affected pipeline consumers; remove dead code rather than patch it.
- `mapgen-core-hex-oddr-adjacency-correction` (PR #1812) — the prior slice this
  completes; memory `civ7-engine-hex-adjacency-oddr`, `civ7-mapgen-coast-ring-invariant`.
- `openspec/specs/mapgen-normalization-workstreams/spec.md`.

## What Changes

- **Migrate every remaining inlined odd-Q hex consumer to canonical odd-R:**
  - `packages/mapgen-core/src/lib/plates/topology.ts` → shared `getHexNeighborIndicesOddQ`.
  - mod hydrology ops (`compute-precipitation/strategies/vector.ts`,
    `compute-atmospheric-circulation/rules`, `transport-moisture/strategies/vector-advection.ts`,
    `compute-ocean-surface-currents/rules`, `compute-ocean-thermal-state/rules`)
    → shared `getHexNeighborDirectionVectorsOddQ` + `forEachHexNeighborOddQWithDirection`
    / `getHexNeighborIndicesOddQ` / `bestHexNeighborDirectionIndexOddQ`. Delete the
    inlined `OFFSETS_*`, `HEX_DELTAS_*`, and the row-0 `getNeighborDeltaHexSpaceFrom`.
  - mod `compute-landmask/strategies/default.ts` coarse-average axial binning →
    odd-R axial (`q = x - (y - (y&1))/2`, `r = y`).
  - mod `dev/diagnostics/surface-delta-context.ts` neighbor tables → odd-R.
  - `@civ7/adapter` `mock-adapter.ts` neighbor table → odd-R **in place** (the
    `kind:adapter -> kind:foundation` boundary forbids importing mapgen-core), so
    the mock predicts the live engine adjacency instead of masking it.
- **Remove dead code:** delete `packages/mapgen-core/src/lib/heightfield/`
  (`generateBaseHeightfield` + `computeSeaLevel` had no live importer — the mod
  uses its own `compute-sea-level` op), plus its `tsup.config.ts` entry and
  `package.json` `./lib/heightfield` subpath export.

## Out Of Scope (flagged follow-ups)

- **Lake-admission policy** (small/saddle lakes nestled in mountain ranges): the
  A/B shows this is **pre-existing** (odd-Q baseline 6 saddle / 15 rough-adjacent
  lakes) and only modestly amplified by the corrected adjacency; it is a separate
  behavioral slice (sink admission / mountain-saddle protection), not part of this
  consistency migration.
- **The mid-map "seam":** the A/B shows the localized vertical discontinuity is a
  near-vertical **coastline** of comparable magnitude in all three states (it
  relocated, it is not a parity artifact); not addressed here.
- **`@civ7/map-policy/natural-wonder-footprints.ts` `CIV7_DIRECTION_OFFSETS`:** a
  parity-naive table encoding the engine `naturalWonderDirection` enum. Making it
  parity-correct needs a live per-direction `getAdjacentPlotLocation` probe;
  deferred (the standard configs place 0 natural wonders).

## Affected Owners

- `packages/mapgen-core/src/lib/plates/topology.ts`, `tsup.config.ts`, `package.json`
- `packages/mapgen-core/src/lib/heightfield/**` (deleted)
- `packages/civ7-adapter/src/mock-adapter.ts`
- `mods/mod-swooper-maps/src/domain/hydrology/ops/{compute-precipitation,compute-atmospheric-circulation,transport-moisture,compute-ocean-surface-currents,compute-ocean-thermal-state}/**`
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-landmask/strategies/default.ts`
- `mods/mod-swooper-maps/src/dev/diagnostics/surface-delta-context.ts`
- Earthlike/golden baselines that encode adjacency-derived output (see
  `workstream/downstream-realignment-ledger.md`).

## Forbidden Owners

- No inlined per-consumer hex-offset table or `x & 1` adjacency parity left in the
  live generation pipeline. The one boundary-blocked mock adapter mirrors the
  canonical odd-R table in place (documented), it does not re-introduce odd-Q.
- No change to per-tile land/water *truth* ownership; only adjacency-derived
  classification/topology and climate vector geometry may shift.
- No dead code carried forward or patched — remove it.
- No product/in-game closure claimed from generated arrays or Studio alone.

## Stop Conditions

- A migrated consumer changes the *algorithm* (weights, clamps, iteration counts,
  fallbacks) rather than only the neighbor set / hex-space deltas.
- A renamed/relocated consumer still computes odd-Q math or keeps an `x & 1`
  adjacency parity.
- Deleting `heightfield/` breaks any live importer (none found; verified).

## Verification Gates

- `nx build` for `@swooper/mapgen-core`, `@civ7/adapter`, `mod-swooper-maps`
  (tsup compile gate); Biome clean on changed files; OpenSpec strict.
- `@swooper/mapgen-core` unit tests green.
- mod test suite: pre-existing/environmental failures separated from
  adjacency-driven golden/band shifts (`workstream/downstream-realignment-ledger.md`).
- Standard-dump before/after: wind-field column-parity sawtooth collapses to
  row-dominant on the fully-migrated build (windV col/row 2.5 → 0.52).
- Live in-game render proof (closure gate, user-driven): corrected map renders
  on the live engine.
