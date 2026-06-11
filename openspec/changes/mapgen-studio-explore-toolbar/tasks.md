## 1. ExplorePanel view toolbar

- [x] 1.1 Wrap the Render option row in a segmented container
      (`bg-input-background` + hairline border + 2px padding); active option
      `bg-muted text-foreground rounded-sm`, inactive flush.
- [x] 1.2 Same treatment for the Space option row.
- [x] 1.3 Leave fit/edges/debug toggles unwrapped; confirm tooltips, `aria-label`,
      `aria-pressed`, and callbacks unchanged.

## 2. Verification

- [x] 2.1 `bun run openspec -- validate mapgen-studio-explore-toolbar --strict`
- [x] 2.2 tsc + mapgen-studio vitest project green
- [x] 2.3 Visual on :5173 (dark + light): segmented controls read as controls;
      active segment unambiguous at a squint.
