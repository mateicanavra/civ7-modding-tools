## ADDED Requirements

### Requirement: Tile Spaces Render With Their Native Hex Orientation

The renderer SHALL draw `tile.hexOddR` layers as pointy-top hexes on a
row-offset lattice, and `tile.hexOddQ` layers as flat-top hexes on the
model's canonical hex-space lattice (`projectOddqToHexSpace`: columns
√3·size apart, rows 1.5·size apart, odd columns shifted 0.75·size) — the
same frame the Delaunay mesh and all `world.xy` layers live in — with
centers, fractional points, polygons, and grid bounds all derived from the
same convention per space.

#### Scenario: Odd-R renders pointy-top

- **WHEN** a grid layer in `tile.hexOddR` renders
- **THEN** its hex polygons have vertices at 30°+60°·i around their centers
  (top edge is a point) and rows offset alternately by half a tile width

#### Scenario: Odd-Q renders flat-top on the canonical lattice

- **WHEN** a grid layer in `tile.hexOddQ` renders
- **THEN** its hexes are flat-top (an east/west vertex, no vertex straight
  above center), tile the canonical lattice exactly (no gaps, overlaps, or
  shear), and co-register with `world.xy` layers of the same run
- **AND** `boundsForTileGrid` covers exactly that lattice

### Requirement: Unfilled Tiles Render Nothing

Tiles whose value is noData or non-finite SHALL render fully transparent —
zero fill alpha and zero stroke alpha — so only filled tiles are visible and
no phantom tile mesh appears over the canvas background.

#### Scenario: noData tile is invisible

- **WHEN** a grid tile's value matches the layer's declared noData sentinel
- **THEN** that tile's fill alpha is 0 and its hex border alpha is 0

### Requirement: Tile Borders Use One Background-Legible Ink

Filled tiles SHALL stroke their hex border with the single shared
`TILE_BORDER_COLOR` — a mid-luminance ink legible against white, black, and
graphite canvas backgrounds — replacing per-call hardcoded border colors.

#### Scenario: Borders share the standard ink

- **WHEN** any tile-space polygon layer renders (grid or gridFields)
- **THEN** filled tiles stroke with `TILE_BORDER_COLOR`
