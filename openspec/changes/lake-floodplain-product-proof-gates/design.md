## Design

Lake gates:

- exact log includes `PLACEMENT_SURFACE_PREPARATION_V1` with
  `acceptedLakeTileCount`;
- final accepted-lake water drift is `0`;
- final accepted-lake classification drift is `0`;
- `missing-exact-log` is unresolved, not pass.

Floodplain gates:

- keep a floodplain-producing seed such as the existing active proof row;
- require exact and local floodplain-family feature-apply counters to agree;
- require the active row to apply at least one floodplain-family feature;
- require live final feature-grid readback to match the local final feature
  surface for active rows;
- preserve zero-count seeds only as inactive/no-signal controls, reported as
  out-of-scope rather than product passes;
- derive floodplain eligibility from Hydrology/final-surface truth plus Civ
  legality/readback, not from projected navigable-river adjacency alone.

Product matrix:

- fixture layer;
- fast deterministic generated-map layer;
- Earthlike acceptance seed;
- holdout seeds;
- mountain-patch vs mountain-rivers-patch contrast;
- floodplain active seed;
- arid/desert no-signal controls;
- final reviewer disposition.

## Review Lanes

- Lake readback review.
- Floodplain product review.
- Product acceptance matrix review.
- Closure audit review.
