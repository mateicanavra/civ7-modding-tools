## 1. Implementation

- [x] 1.1 `GameConsole` sheds panel chrome + "Civ7" identity label; renders
      an inline command cluster safe to compose into a bar row.
- [x] 1.2 `AppHeader`: World → Game identity; remove Size/Players selects;
      setup dropdown loses Resources and its "Setup" label (icon-only,
      trailing); compose the game cluster into the bar row.
- [x] 1.3 `AppFooter`: gain `globalSettings`/`onGlobalSettingsChange`;
      Size/Players/Resources selects left of Seed; last-run cluster →
      History icon button (tooltip = last run, click = copy seed).
- [x] 1.4 `StudioShell`: reroute WorldSettings wiring; bar composition.
- [x] 1.5 Tests: header/footer/console assertions follow the moved
      controls; gating coverage on relocated selects.

## 2. Verification

- [x] 2.1 `bun run openspec -- validate mapgen-studio-toolbar-architecture-v2 --strict`
- [x] 2.2 tsc + mapgen-studio vitest green
- [x] 2.3 Visual on :5173 (dark + light): one Game bar (no console panel),
      setup disclosure last + game-setup-only row, footer authoring
      Size/Players/Resources/Seed, History tooltip + copy. Screenshot.
