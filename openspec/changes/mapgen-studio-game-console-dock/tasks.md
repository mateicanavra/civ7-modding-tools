## 1. Implementation

- [x] 1.1 Add a `gameConsole` slot to `AppHeader`, rendered as a centered row
      in the center column after the setup panel.
- [x] 1.2 Compose `GameConsole` into the header slot from `StudioShell`,
      passing the props previously routed through `AppFooter`.
- [x] 1.3 Remove the game console and right zone from `AppFooter`; center the
      studio console; keep `isRunInGameRunning`/`isSaveDeployRunning` gating.
- [x] 1.4 Move game-console test scenarios into `GameConsole.test.tsx`; keep
      studio + gating assertions in `AppFooter.test.tsx`; sweep stale
      `lightMode` props from test mounts.

## 2. Verification

- [x] 2.1 `bun run openspec -- validate mapgen-studio-game-console-dock --strict`
- [x] 2.2 tsc + mapgen-studio vitest green
- [x] 2.3 Visual on :5173: game console sits under the world bar; setup panel
      opens between them; footer shows only the centered studio console; side
      panels start below the taller header. Screenshot (dark + light).
