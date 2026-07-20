import { StudioProviders } from "./app/StudioProviders";

/**
 * `App` — the thin application root (architecture/10 §4).
 *
 * The former 2,500-line `App.tsx` god-component is decomposed into the component
 * tree under `src/app/`: `StudioProviders` (the provider shell) hosts
 * `StudioShell` (layout + orchestration), which composes `CanvasStage`,
 * `AppHeader`, `LeftDock`/`RecipePanel`, `RightDock`/`ExplorePanel`, `AppFooter`,
 * the config save dialog, and `ErrorBanner`. State lives in the Zustand `viewStore`,
 * oRPC-backed queries, and the feature modules under `src/features/*`. This root
 * only re-exports the provider shell so `main.tsx` (which owns the
 * `QueryClientProvider`) has a stable mount point.
 */
export function App() {
  return <StudioProviders />;
}
