## 1. ExplorePanel view toolbar

- [ ] 1.1 Wrap the Render option row in a segmented container
      (`bg-input-background` + hairline border + 2px padding); active option
      `bg-muted text-foreground rounded-sm`, inactive flush.
- [ ] 1.2 Same treatment for the Space option row.
- [ ] 1.3 Leave fit/edges/debug toggles unwrapped; confirm tooltips, `aria-label`,
      `aria-pressed`, and callbacks unchanged.

## 2. Verification

- [ ] 2.1 `bun run openspec -- validate mapgen-studio-explore-toolbar --strict`
- [ ] 2.2 tsc + mapgen-studio vitest project green
- [ ] 2.3 Visual on :5173 (dark + light): segmented controls read as controls;
      active segment unambiguous at a squint.
