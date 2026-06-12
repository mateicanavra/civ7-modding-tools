## 1. Implementation

- [x] 1.1 Odd-Q canonical hex-space math (centers + fractional points,
      matching `projectOddqToHexSpace`); remove the dead pointy-axial
      helpers.
- [x] 1.2 `hexPolygonOddQ` (the canonical lattice's tiling hexagon) +
      per-space polygon dispatch in the grid geometry builder.
- [x] 1.3 `boundsForTileGrid` odd-Q branch covers the canonical lattice.
- [x] 1.4 Mesh contract: transparent `UNKNOWN_COLOR`, per-tile stroke alpha
      follows fill alpha, shared `TILE_BORDER_COLOR` ink.
- [x] 1.5 Tests: per-space vertex orientation; canonical lattice spacing;
      noData tile invisibility.

## 2. Verification

- [x] 2.1 `bun run openspec -- validate mapgen-studio-tile-orientation --strict`
- [x] 2.2 tsc + vitest green (167)
- [x] 2.3 Visual on :5173 (dark + light): odd-Q tile layers render flat-top
      on a clean lattice (no shear, no gaps), zoom inspection confirms
      shared edges. Screenshots.
