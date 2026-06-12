## ADDED Requirements

### Requirement: Tile Layers Render The Game's Plot Geometry

The renderer SHALL draw every tile-space layer as regular pointy-top hexes
on the game's row-offset (odd-R) lattice — columns √3·size apart, rows
1.5·size apart, odd rows shifted east half a tile — treating `tile.hexOddQ`
as a mislabel of the same grid per the hex-convention audit. This
supersedes the canonical-lattice odd-Q scenario of
`mapgen-studio-tile-orientation`; the noData-invisibility and shared-ink
requirements of that change carry forward unchanged.

#### Scenario: Tiles are regular pointy-top hexes

- **WHEN** any tile-space grid layer renders
- **THEN** every hex polygon is regular (all vertices at exactly tile-size
  radius) and pointy-top (a vertex straight above the center) — no axis is
  compressed

#### Scenario: The lattice matches the in-game grid

- **WHEN** any tile-space grid layer renders
- **THEN** row 0 sits north, columns are √3·size apart, rows 1.5·size
  apart, and odd rows shift east by half a column — the same picture as
  Civ7's own grid (and Firaxis's debug dumpers)

### Requirement: Tile Borders Use One Graphite Ink In Both Themes

Filled tiles SHALL stroke their borders with a single graphite ink (the
dark page substrate) in both dark and light themes — dark seams against the
fills, never a mid-luminance color that competes with the data palette.

#### Scenario: Borders are graphite in both themes

- **WHEN** a tile-space polygon layer renders in dark or light theme
- **THEN** filled tiles stroke with the shared graphite `TILE_BORDER_COLOR`
  and unfilled tiles still stroke nothing
