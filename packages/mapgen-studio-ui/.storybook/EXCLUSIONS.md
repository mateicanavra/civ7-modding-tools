# Storybook workbench — excluded components (the oracle's boundary)

> Moved from `apps/mapgen-studio/src/storybook/` at the B7 extraction repoint
> (2026-07-02): this package now hosts the one Storybook (the design-sync
> fidelity oracle) and the app has zero story files. The components below are
> **app-side hosts** that stay unstoried; their paths are app paths.

The workbench stories the **46-component presentational surface** (every one a
pure, prop-driven leaf — now this package's public barrel; story titles are the
sync's grouping authority). The components below are deliberately **not**
storied, with reasons. These are orchestration hosts and deck.gl/WebGL surfaces
— storying them would violate the workbench's stop conditions (an orchestration
host given a story; StrictMode / live canvas in a story) or require live data.

| Component | Reason excluded |
|---|---|
| `StudioShell` (`src/app/StudioShell.tsx`) | Top-level orchestration host — composes the whole app from hooks/stores, not a prop-driven leaf. Stop condition: an orchestration host is never given a story. |
| `StudioProviders` (`src/app/StudioProviders.tsx`) | Provider/orchestration host (theme effect + TooltipProvider + Toaster + shell). Its job is reproduced by the global decorator (`.storybook/preview.tsx`), not storied. |
| `DeckCanvas` (`src/features/viz/DeckCanvas.tsx`) | deck.gl/luma WebGL surface. Cannot render as an isolated pure leaf; deck.gl double-mounts under StrictMode (which the app disables in dev) and needs a live viz manifest. Stop condition: no StrictMode/live-canvas story. |
| `CanvasStage` (`src/app/CanvasStage.tsx`) | Wraps `DeckCanvas` (deck.gl). Its empty-state branch was a best-effort Tier-3 candidate (`design.md` §7) but is **deferred** in Stage 1: the deck.gl-free empty branch is low-value relative to the WebGL-host risk, and `CanvasStage` is not part of the 46-component design-sync surface this change covers. Revisit if the empty state earns a dedicated story. |

**Data-coupling exclusions:** none. The census confirmed all 46 in-scope
components are prop-driven and reach no `/rpc`/daemon data; none had to be
excluded for live-data coupling. (The app-era per-story stub `QueryClient` and
store reset were retired with the app Storybook at B7 — no storied component
ever read a store or mounted a query, so the package preview provides only
`TooltipProvider` + `Toaster`.)
