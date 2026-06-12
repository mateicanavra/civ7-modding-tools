## 1. Implementation

- [x] 1.1 Audit: establish Civ7's grid convention with concrete evidence
      (official dumpers, direction set, boundary pass-through) →
      `research/03-hex-convention-audit.md`; spawn the engine-migration
      task.
- [x] 1.2 `render.ts`: both tile spaces → pointy-top odd-R (regular hexes);
      remove the odd-Q lattice math + squashed polygon; one bounds branch.
- [x] 1.3 `TILE_BORDER_COLOR` → graphite (#0d0d11, α200), both themes.
- [x] 1.4 Tests: regular-pointy vertex assertions + row-offset lattice
      spacing for BOTH tile spaces.

## 2. Verification

- [x] 2.1 `bun run openspec -- validate mapgen-studio-tile-game-geometry --strict`
- [x] 2.2 tsc + vitest green (168)
- [x] 2.3 Visual on :5173 (dark + light): regular pointy-top tiles, no
      vertical squish, row-offset lattice, graphite seams legible against
      fills in both themes. Screenshots at map and tile zoom.
