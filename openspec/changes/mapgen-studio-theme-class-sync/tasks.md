## 1. Runtime class sync

- [x] 1.1 `StudioProviders.tsx`: effect syncing `document.documentElement.classList`
      `.dark` to `!isLightMode` on change (bootstrap keeps pre-paint ownership).

## 2. Verification

- [x] 2.1 `bun run openspec -- validate mapgen-studio-theme-class-sync --strict`
- [x] 2.2 tsc + mapgen-studio vitest project green
- [x] 2.3 Visual on :5173: cycle theme → live light + dark screenshots; reload
      keeps the chosen theme.
