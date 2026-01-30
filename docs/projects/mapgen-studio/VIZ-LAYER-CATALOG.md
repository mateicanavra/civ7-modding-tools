# Viz Layer Catalog (Contract vs Internal)

This catalog defines **stable, user-facing layer IDs** that the browser pipeline can rely on, and distinguishes them from **internal/debug layers** that may change as implementation evolves.

## Contract layers (stable, UI-first)

These IDs are the **tile-space contract** for browser visualization and downstream stages. They should remain stable across refactors.

- `foundation.tile.height` (grid, f32)
  - Tile-space elevation signal (derived from Foundation projection)
- `foundation.tile.landmask` (grid, u8)
  - Tile-space land/ocean mask (0 = ocean, 1 = land)

## Internal/debug layers (implementation detail)

These are emitted for debugging or inspection only. They are **not** the contract for downstream stages and may be renamed or removed as the pipeline matures.

- `foundation.crustTiles.*`
- `foundation.tileToCellIndex`
- `foundation.plateTopology.*`
- Other step-local layers (points/segments) used for visualization of intermediate signals

## UI behavior

- The MapGen Studio UI should **prioritize contract layers** and may hide internal/debug layers by default.
- Internal layers can be exposed via a “show internal layers” toggle for debugging and research.

## Notes

- Contract layers intentionally **duplicate** some internal signals under stable IDs.
- This is a deliberate bridge until the pipeline has a dedicated “data products” registry.
