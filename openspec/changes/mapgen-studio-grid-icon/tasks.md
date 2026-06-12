## 1. Implementation

- [x] 1.1 `ViewControls`: grid toggle renders `Grid3x3` (lucide, `w-4 h-4`).
- [x] 1.2 Categorical sweep: src grep (empty icon-sized divs, inline svg,
      non-lucide libs) + live-DOM scan for glyph-less visible buttons.

## 2. Verification

- [x] 2.1 `bun run openspec -- validate mapgen-studio-grid-icon --strict`
- [x] 2.2 tsc + vitest green
- [x] 2.3 Live DOM: grid toggle contains an `svg`; only the overrides
      Switch is legitimately glyph-less.
