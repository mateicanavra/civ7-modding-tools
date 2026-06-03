# Orogenic Provinces And Volcanic Archipelagos

Date: 2026-06-03

## Objective

Deliver Swooper Earthlike terrain where the generated physical unit is a
landscape province, not a final tile class. Mountain systems should be planned
as multi-tile orographic provinces with internal peak spines, ridge corridors,
passes, valleys, foothills, highlands, forests, resources, and settlement-capable
basins. Island systems should be planned as volcanic or tectonic archipelago
provinces: hotspot chains, subduction arcs, and variable-size island clusters
formed from Foundation history and volcanism drivers, not scattered dot fill.

## Frame

- In scope: Morphology truth, island/mountain planning ops, physically grounded
  author inputs, Earthlike config, generated map config, local stats, tests,
  deploy, and bounded live readback.
- Foreground: regions/provinces, internal composition, passability, component
  structure, and causal ties to Foundation history or volcanism signals.
- Exterior: landmass silhouette rewrites, projection-stage truth decisions,
  output-shaped count controls, and random dot placement as a primary mechanism.
- Falsifier: if tests or live readback can only prove total mountain/island
  coverage, not multi-tile province structure and internal composition, the
  solution has not met the product outcome.
- Complexity posture: unnecessary helper duplication, output-shaped controls,
  boolean/optional soup, scatter-style random fallbacks, and public types without
  runtime backing should be removed when encountered. New TypeScript surfaces
  should stay inference-friendly and proportional to the current consumers:
  masks and ids first; richer province objects only when downstream consumers
  need those fields.

## Acceptance

- Mountain regions scale by official map area from a physical spacing input and
  contain both mountain-peak cells and non-mountain interior relief/valley cells.
- Foothills and rough lands consume the same orographic footprint, so hills and
  settlement-capable basins can live inside mountain country instead of only
  outside mountain masks.
- Island chains and archipelagos are generated from named physical mechanisms
  such as hotspot tracks, subduction island arcs, and volcanic clusters.
- Generic reusable helpers live in `packages/mapgen-core`; Swooper-specific
  morphology policy remains in the mod domain ops.
- Verification separates local stats, tests, generated artifacts, deploy, and
  live-game readback.

## Current Outcome

- Branch/worktree:
  `codex/swooper-earthlike-post-foundation-tuning` in
  `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-swooper-earthlike-tuning`.
- Studio parity: the live Studio server now runs from this worktree on
  `http://127.0.0.1:5174/`. A fresh restart was required after recipe artifact
  regeneration so the UI stopped rendering stale internal mountain config fields.
- Coordinate parity root cause: the standard recipe emitted map tile grids with
  `spaceId: "tile.hexOddR"` while generation and Civ7 readback use row-major
  odd-q topology. Standard recipe viz layers now emit the canonical odd-q tile
  space and a guard test rejects future odd-r standard-layer regressions.
- Live game coordinate readback: `civ7 game map --bounds 0,0,4,4 --fields
  terrain,biome,resource --json` on the running `84x54` game reports
  `(x=0,y=1) -> index 84`, matching `index = y * width + x`.
- Resource row artifact root cause: resource tied candidates were ordered by
  plot index, so broad ties could collapse into row-aligned placement artifacts.
  Resource planning now uses seed-keyed tile-local micro-suitability and hash
  tie-breaks, and world-balance stats track max-row/bottom-row resource shares.

## Earth-Scaled Range Controls

Official Civ7 dimensions used for map-size scaling:

| Size | Width | Height |
| --- | ---: | ---: |
| Tiny | 60 | 38 |
| Small | 74 | 46 |
| Standard | 84 | 54 |
| Large | 96 | 60 |
| Huge | 106 | 66 |

`rangeSystemLengthTiles` uses Large (`96x60`) as its baseline. Swooper
Earthlike sets `rangeSystemLengthTiles: 30`; other sizes scale by
`sqrt((width * height) / (96 * 60))`. The planner now treats that value as the
target span of an orographic province axis, not as a mountain-tile count. Axes
may continue through ordinary land so internal valleys/passes can exist, while
peak promotion still requires physical mountain support.

Large Earthlike seed matrix `[1018,1,2,3,42,99]` now proves:

- largest mountain province span: mean `30`, per-seed minimum `29`;
- distinct mountain province ids: mean `9.5`, per-seed minimum `8`;
- planned peak-spine span: per-seed minimum `15`, maximum `27`;
- final mountain share stays under `13%` of pre-lake land.

This matches the intended product shape: long mountain regions with discontinuous
peak spines, foothills, highlands, and non-mountain internal room for valleys and
settlement rather than solid peak carpets.

## Verification 2026-06-03

- `bun test packages/mapgen-core/test/lib/grid/distance-to-mask.test.ts
  packages/mapgen-core/test/lib/grid/hex-disk.test.ts
  packages/mapgen-core/test/lib/rng/hash.test.ts
  mods/mod-swooper-maps/test/morphology/mountain-family-controls.test.ts
  mods/mod-swooper-maps/test/morphology/plan-island-chains.test.ts
  mods/mod-swooper-maps/test/placement/plan-ops.test.ts
  mods/mod-swooper-maps/test/pipeline/viz-tile-space-contract.test.ts
  --timeout 90000`
- `bun test mods/mod-swooper-maps/test/m11-config-knobs-and-presets.test.ts
  mods/mod-swooper-maps/test/config/maps-schema-valid.test.ts
  mods/mod-swooper-maps/test/standard-compile-errors.test.ts
  apps/mapgen-studio/test/viz/dataTypeModel.test.ts
  apps/mapgen-studio/test/browserRunner/standardLayerVisibility.test.ts
  --timeout 90000`
- `bun test mods/mod-swooper-maps/test/pipeline/world-balance-stats.test.ts
  mods/mod-swooper-maps/test/pipeline/terrain-relief-diagnostics.test.ts
  --timeout 120000`
- `bun run --cwd packages/mapgen-core check`
- `bun run --cwd mods/mod-swooper-maps check`
- `bun run --cwd apps/mapgen-studio check`
- `bun run --cwd mods/mod-swooper-maps deploy`
