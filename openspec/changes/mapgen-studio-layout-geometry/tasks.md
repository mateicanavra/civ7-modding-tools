## 1. Constants

- [x] 1.1 `layout.ts`: `PANEL_WIDTH` 280 → 340; `EXPLORE_PANEL_WIDTH` 240 → 260;
      `HEADER_HEIGHT` 104 → 48 with doc comment re-stated as "initial estimate of
      the measured header height (ResizeObserver is the authority), not a reserve".

## 2. Header

- [x] 2.1 `AppHeader.tsx`: remove the `style={{ minHeight: HEADER_HEIGHT }}` reserve;
      keep the ResizeObserver reporting pipeline untouched.

## 3. Docks and panels

- [x] 3.1 `LeftDock.tsx` / `RightDock.tsx`: accept and apply a `bottom` constraint
      (`FOOTER_HEIGHT + 2×SPACING` supplied by `StudioShell`); document the new
      single-responsibility (top+bottom positioning).
- [x] 3.2 `RecipePanel.tsx`: root drops `w-[280px]` + `max-h-[calc(100vh-180px)]`
      for `style` width from `LAYOUT.PANEL_WIDTH` + `max-h-full`.
- [x] 3.3 `ExplorePanel.tsx`: root drops `w-[260px]` for `LAYOUT.EXPLORE_PANEL_WIDTH`,
      gains `max-h-full` and internal overflow scrolling.

## 4. Scroll affordance

- [x] 4.1 Recipe panel scroll body: add the sticky bottom token-gradient fade
      (`pointer-events-none`).

## 5. Verification

- [x] 5.1 `bun run openspec -- validate mapgen-studio-layout-geometry --strict`
- [x] 5.2 tsc + mapgen-studio vitest project green
- [x] 5.3 Visual: DOM-measure dock boxes on :5173 (left 340 wide, top ≈ header+16,
      bottom clear of footer); screenshot dark + light; squint-test the column.
