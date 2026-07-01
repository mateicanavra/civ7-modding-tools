# Storybook workbench — excluded components (Stage 1)

The workbench stories the **46-component presentational surface** enumerated by
the design-sync `componentSrcMap` (every one is a pure, prop-driven leaf). The
components below are deliberately **not** storied in Stage 1, with reasons. These
are orchestration hosts and deck.gl/WebGL surfaces — storying them would violate
the change's stop conditions (an orchestration host given a story; StrictMode /
live canvas in a story) or require live data.

| Component | Reason excluded |
|---|---|
| `StudioShell` (`src/app/StudioShell.tsx`) | Top-level orchestration host — composes the whole app from hooks/stores, not a prop-driven leaf. Stop condition: an orchestration host is never given a story. |
| `StudioProviders` (`src/app/StudioProviders.tsx`) | Provider/orchestration host (theme effect + TooltipProvider + Toaster + shell). Its job is reproduced by the global decorator (`.storybook/preview.tsx`), not storied. |
| `DeckCanvas` (`src/features/viz/DeckCanvas.tsx`) | deck.gl/luma WebGL surface. Cannot render as an isolated pure leaf; deck.gl double-mounts under StrictMode (which the app disables in dev) and needs a live viz manifest. Stop condition: no StrictMode/live-canvas story. |
| `CanvasStage` (`src/app/CanvasStage.tsx`) | Wraps `DeckCanvas` (deck.gl). Its empty-state branch was a best-effort Tier-3 candidate (`design.md` §7) but is **deferred** in Stage 1: the deck.gl-free empty branch is low-value relative to the WebGL-host risk, and `CanvasStage` is not part of the 46-component design-sync surface this change covers. Revisit if the empty state earns a dedicated story. |

**Data-coupling exclusions:** none. The census confirmed all 46 in-scope
components are prop-driven and reach no `/rpc`/daemon data; none had to be
excluded for live-data coupling. The per-story stub `QueryClient` is the cold-
`/rpc` backstop, not a mock for any storied component's own queries.
