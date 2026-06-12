# Audit: mapgen-core hex convention vs Civ7's native grid

Date: 2026-06-11. Trigger: while fixing studio tile rendering (Pass-5 X3) we
found mapgen-core models the plot grid as odd-Q (column-offset, flat-top)
while Civ7's native direction set looked pointy-top. The user then flagged
the studio grid as "vertically squished" — which turned out to be the same
issue surfacing visually. This audit establishes the game's actual
convention with concrete evidence.

## Verdict

**Civ7's plot grid is pointy-top, row-offset — odd-R, odd rows shifted
east. mapgen-core's odd-Q (column-parity) convention is a mislabel of that
grid, and nothing at the engine boundary compensates.**

## Evidence

### 1. Firaxis's own debug dumpers indent odd ROWS

`.civ7/outputs/resources/Base/modules/base-standard/maps/map-debug-helpers.js`
(repeated in `dumpContinents`, `dumpTerrain`, …, and in
`snow-generator.js:80`):

```js
for (let iY = iHeight - 1; iY >= 0; iY--) {
  let str = "";
  if (iY % 2 == 1) {
    str += " ";   // odd ROWS shifted half a tile right
  }
  for (let iX = 0; iX < iWidth; iX++) { ... }
}
```

Firaxis renders their own grid as ASCII with odd rows offset east — the
textbook odd-R picture. (Top-down print order with the indent on odd `iY`
⇒ odd rows shift +x/2.)

### 2. The official direction set has no NORTH/SOUTH

`Base/modules/base-standard/ui/lenses/layer/building-placement-layer.js`
(also trade-routes-model.js, interface-mode files) enumerates exactly:
`DIRECTION_EAST, DIRECTION_WEST, DIRECTION_NORTHEAST, DIRECTION_NORTHWEST,
DIRECTION_SOUTHEAST, DIRECTION_SOUTHWEST`. Same-row E/W neighbors with four
vertical diagonals and no N/S is pointy-top adjacency; flat-top would have
N/S and no E/W. Official map scripts themselves never hand-roll offsets —
they iterate `0..NUM_DIRECTION_TYPES` through
`GameplayMap.getAdjacentPlotLocation` (`map-utilities.js:391`), so the
engine owns the (row-parity) neighbor math.

### 3. The mod's write boundary is an untransposed pass-through

`mods/mod-swooper-maps/.../map-morphology/steps/plotCoasts.ts:85-94`:

```ts
for (let y = 0; y < height; y++)
  for (let x = 0; x < width; x++) {
    const idx = y * width + x;
    ...
    context.adapter.setTerrainType(x, y, terrain);
  }
```

Model index `i = y·width + x` maps 1:1 to game plot `(x,y)`. No
transposition, no parity remap, anywhere in the adapter path.

### 4. mapgen-core's convention (for contrast)

- `packages/mapgen-core/src/lib/grid/neighborhood/hex-oddq.ts` — textbook
  odd-Q offsets keyed on **x parity** (matches the Red Blob odd-q table).
- `packages/mapgen-core/src/lib/grid/hex-space.ts` —
  `projectOddqToHexSpace`: `hx = x·√3`, `hy = y·1.5 + (x&1 ? 0.75 : 0)`.
  Note the spacings are the POINTY-top constants (√3 columns, 1.5 rows);
  only the offset axis is wrong (column-parity vertical shift instead of
  row-parity horizontal shift). The lattice is therefore not a regular hex
  tiling at all — which is why studio tiles drawn to tile it looked
  vertically squashed.
- `packages/mapgen-core/src/lib/mesh/delaunay.ts:139` builds the Delaunay
  world over `width · HEX_WIDTH` — the same frame, so `world.xy` layers
  share the (correct) global spacings and the (sub-tile) offset error.

## Impact

The four orthogonal-ish neighbors agree between the conventions; the two
remaining diagonal slots differ whenever the relevant parities disagree —
roughly 1–2 of 6 neighbors per tile. Everything adjacency-driven during
generation (coast shaping, flow routing, distance fields, region growth,
hex distances via `oddqToCube`) computes against a slightly different graph
than the game applies in play. Global structure survives (same spacings,
same wrap axis); fine-grained adjacency effects (river edges, chokepoints,
distance ties) can differ from in-game truth.

## Disposition

- **Studio renderer (done, Pass-5 X6):** tile layers render the GAME's
  geometry — pointy-top odd-R, regular hexes — for both tile spaceIds;
  `tile.hexOddQ` is treated as a mislabeled odd-R grid. World frame
  (√3·width × 1.5·height) is unchanged, so `world.xy` co-registration
  holds; per-tile positions differ from the model's internal hex space by
  at most half a tile, which is the model's error, not the renderer's.
- **Engine fix (open, separate workstream):** migrate mapgen-core to odd-R
  (neighborhood table keyed on y parity, `projectOddrToHexSpace`,
  `oddrToCube`, and the call sites in mod-swooper-maps domain ops). This is
  gameplay-affecting and needs its own regression plan (golden-map diffs,
  river/coast acceptance checks). Tracked as a spawned task.
