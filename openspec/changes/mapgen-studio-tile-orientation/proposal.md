# Tile orientation (odd-Q flat-top) + the tile-mesh contract

## Why

The user flagged tiles rendering in the wrong orientation ("might be an odd
Q vs odd R issue"). Root cause: `render.ts` renders BOTH tile spaces with
pointy-top geometry — `tile.hexOddQ` centers go through a pointy-top axial
conversion and every polygon is built with vertices at 30°+60°·i. Column-
offset (odd-q) layouts are flat-top by construction; the result was rotated
tiles on a sheared lattice for every odd-Q visualization. Alongside the
orientation fix, the user set a tile-mesh contract: borders legible against
any canvas background, unfilled tiles fully invisible (no phantom mesh), one
consistent background treatment.

## Target Authority Refs

- `docs/projects/mapgen-studio-redesign/pass-5-design-fixes.md` (X3)

## What Changes

- `render.ts`: odd-Q centers use the model's canonical hex-space lattice —
  the same frame mapgen-core's `projectOddqToHexSpace` defines and the
  Delaunay mesh (`world.xy` layers) is built in: `x = √3·s·col`,
  `y = 1.5·s·row + (col odd ? 0.75·s : 0)`, then the shared north-up flip.
  (A textbook flat-top layout — `1.5·s` columns, `√3·s` rows — was
  considered and rejected: its world frame would misalign every tile stage
  against the mesh/world stages of the same run.) The fractional-point
  variant matches; the dead pointy-axial helpers are removed.
  `hexPolygonOddQ` — the flat-top hexagon that exactly tiles the canonical
  lattice (vertical pitch compressed to the 1.5·s row spacing) — joins
  `hexPolygonPointy`, and the grid-geometry builder dispatches by space.
  `boundsForTileGrid`'s odd-Q branch covers the same lattice.
- Tile-mesh contract: `UNKNOWN_COLOR` (noData / non-finite values) becomes
  fully transparent — unfilled tiles draw nothing; the per-tile hex stroke
  follows its fill's alpha (no border around invisible tiles); the border
  ink becomes the exported `TILE_BORDER_COLOR`, a mid-luminance slate
  legible on white, black, and graphite (replacing the near-black literal
  that vanished on dark canvases). The square background graticule
  (`bg.mesh.grid`, already theme-aware) remains the only sanctioned empty
  mesh. Vector-arrow ink is data marking, not tile mesh — out of scope.
- Tests: flat-top vs pointy-top vertex assertions per space; noData tiles
  render with zero fill and stroke alpha.

## Impact

- Affected specs: `mapgen-studio`
- Affected code: `apps/mapgen-studio/src/features/viz/deckgl/render.ts`,
  `apps/mapgen-studio/src/features/viz/presentation.ts`,
  `apps/mapgen-studio/test/viz/tileOrientation.test.ts`
