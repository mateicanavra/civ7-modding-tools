## Design

Lake gates:

- exact log includes `acceptedLakeTileCount`;
- final accepted-lake water drift is `0`;
- final accepted-lake classification drift is `0`;
- `missing-exact-log` is unresolved, not pass.

Floodplain gates:

- keep a floodplain-producing seed such as the existing active proof row;
- require local/exact/live floodplain-family feature counts and at least one
  live floodplain-family tile for active rows;
- preserve zero-count seeds only as inactive/no-signal controls.

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
