## 1. RecipePanel

- [x] 1.1 Remove the Run button from the panel footer row; Save & Deploy becomes the
      row's full-width action.
- [x] 1.2 Remove now-unused props (`onRun`, `isRunning`-only-for-button, dirty-ring
      plumbing) from `RecipePanelProps` and from `StudioShell`'s `<RecipePanel …>`
      wiring; keep any prop still used elsewhere in the panel (verify each).

## 2. AppFooter

- [x] 2.1 Add the dirty ring emphasis to the footer Run button when `isDirty`.
- [x] 2.2 `formatting.ts`: `formatResourceMode` returns full words ("Balanced", …);
      update its doc example.

## 3. Verification

- [x] 3.1 `bun run openspec -- validate mapgen-studio-run-console --strict`
- [x] 3.2 tsc + mapgen-studio vitest project green (AppFooter suite unchanged)
- [x] 3.3 Visual on :5173: one Run on screen; edit a field → footer Run shows the
      dirty ring + "Modified"; summary shows "Balanced".
