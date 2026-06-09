## 1. Extract the provider shell + presentational chrome

- [x] 1.1 `app/hooks/useToast.ts`: move the sonner adapter (`toast(message, { variant })`) verbatim
- [x] 1.2 `app/CanvasStage.tsx`: move the canvas JSX (backdrop, optional grid, `DeckCanvas`, empty state); props-in, no logic change
- [x] 1.3 `app/ErrorBanner.tsx`: move the error banner JSX (message + top offset)
- [x] 1.4 `app/LeftDock.tsx` / `app/RightDock.tsx`: move the positioned floating-dock frames (positioning only)
- [x] 1.5 `app/StudioProviders.tsx`: move the `App` wrapper body (tooltip + toaster + theme preference)

## 2. Move the orchestration container

- [x] 2.1 `app/StudioShell.tsx`: move the `AppContent` closure verbatim (state, effects, callbacks, memos)
- [x] 2.2 Delegate the inline canvas/dock/error JSX in the shell's `return` to `CanvasStage`/`LeftDock`/`RightDock`/`ErrorBanner`
- [x] 2.3 Source the toast adapter from `useToast` instead of the inline `useCallback`
- [x] 2.4 Reduce `App.tsx` to a thin root rendering `StudioProviders`

## 3. Verify parity

- [x] 3.1 `bun run check` clean (tsc --noEmit)
- [x] 3.2 `bun run build` succeeds incl. worker-bundle check
- [x] 3.3 Live preview: no console errors; recipe authoring, stage/step nav, run controls present + functional
- [x] 3.4 localStorage keys/shapes unchanged (no persistence code touched; keys imported from feature modules)
- [x] 3.5 OpenSpec strict validation passes
