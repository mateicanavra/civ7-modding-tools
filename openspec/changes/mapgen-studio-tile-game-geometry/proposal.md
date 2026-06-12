# Tile grid renders the game's geometry (no squish) + graphite border ink

## Why

The user flagged two grid issues live: (1) the tile grid looked vertically
squished; (2) the slate tile borders clashed with the palette — expected
darker, black/graphite, consistent across themes.

The squish traced back to the hex-convention audit
(`docs/projects/mapgen-studio-redesign/research/03-hex-convention-audit.md`):
Civ7's plot grid is pointy-top odd-R (official direction set has no N/S;
Firaxis's own debug dumpers indent odd ROWS; the engine boundary writes
(x,y) untransposed), while mapgen-core's "odd-q" canonical projection puts
the offset on the wrong axis — its lattice is not a regular hex tiling, so
the X3 renderer's exact tiling hexagon for it was necessarily a vertically
compressed flat-top. Rendering the GAME's lattice instead uses regular
pointy-top hexes: no squish, and the studio matches the in-game picture.
This supersedes X3's canonical-lattice scenario; the world frame (√3·width
× 1.5·height) is identical, so `world.xy` co-registration is unchanged.

## Target Authority Refs

- `docs/projects/mapgen-studio-redesign/research/03-hex-convention-audit.md`
- `docs/projects/mapgen-studio-redesign/pass-5-design-fixes.md` (X3 addendum)

## What Changes

- `render.ts`: BOTH tile spaces render pointy-top odd-R (regular hexes,
  odd rows shifted east) — `tile.hexOddQ` is, by audit evidence, a mislabel
  of the same game grid; the odd-Q lattice math and its squashed tiling
  hexagon are removed. `boundsForTileGrid` collapses to the one lattice.
- `TILE_BORDER_COLOR` becomes graphite (`#0d0d11` at α200) — one ink in
  both themes. Borders only ever separate filled tiles (unfilled draw
  nothing), so the dark seam reads against fills everywhere: grout-like in
  dark mode, a crisp graphite grid in light mode.
- Tests: both tile spaces assert regular pointy-top vertices (unit radius,
  vertex straight above center) and the row-offset lattice spacing.
- The engine-side convention fix (mapgen-core odd-Q → odd-R) is tracked as
  a spawned task; it is gameplay-affecting and out of scope here.

## Impact

- Affected specs: `mapgen-studio`
- Affected code: `apps/mapgen-studio/src/features/viz/deckgl/render.ts`,
  `apps/mapgen-studio/src/features/viz/presentation.ts`,
  `apps/mapgen-studio/test/viz/tileOrientation.test.ts`
