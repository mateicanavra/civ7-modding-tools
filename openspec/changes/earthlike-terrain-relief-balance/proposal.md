## Why

Swooper Earthlike can produce only a handful of planned non-volcano mountains
across a full 106x66 map. Visible terrain also appears as broad continental
center bulges sloping to coasts, without mountain belts, foothills, basins, or
varied relief. The likely upstream cause is insufficient active-margin overlap
with land plus strict mountain candidate gates.

## Target Authority Refs

- `openspec/changes/earthlike-balance-diagnostic-gates`: terrain balance must
  measure mountain/hill coverage and continental elevation profile shape.
- `docs/system/libs/mapgen/MAPGEN.md`: morphology owns terrain truth before
  map projection.
- `mods/mod-swooper-maps/AGENTS.md`: generated `mod/` output is regenerated,
  not hand edited.

## What Changes

- Repair Earthlike active-margin land overlap and ridge candidate availability.
- Add product-visible mountain, hill, and non-bulge relief gates.
- Separate planned ridge mountains from volcano-stamped mountain terrain in
  diagnostics.
- Add post-projection terrain persistence checks around validation stages.

## Write Set

- Earthlike morphology config.
- Morphology coasts/landmask and mountain planner code only if config is
  insufficient.
- Map-morphology projection diagnostics and terrain tests.
- World-balance stats support for terrain relief.

## Forbidden Non-Goals

- No noise-only mountain fill.
- No relying on volcanoes to satisfy mountain-belt balance.
- No exact visual snapshot as the only acceptance proof.

## Verification Gates

- Multi-seed terrain density tests.
- World-balance terrain metrics.
- `bun run openspec -- validate earthlike-terrain-relief-balance --strict`
- `bun run openspec:validate`
- `git diff --check`
