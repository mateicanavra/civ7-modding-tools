## Why

The prior `mapgen-studio-app-decomposition` slice extracted the ~535-LoC non-React
helper corpus out of `App.tsx`, but the **component tree itself was never split**:
the file remained a single ~2,583-LoC module whose `AppContent` closure held 42
`useState`, 24 `useEffect`, and the entire authoring / live-runtime / run-in-game /
viz orchestration, with the provider shell and presentational chrome (canvas stage,
docks, error banner) inlined in its `return`. That is the actual ceiling on
reviewability and the blocker for every later UI slice.

This change performs the **component-tree decomposition** per architecture/10 §4 and
audit/03: it MOVES the `AppContent` body verbatim into a dedicated `StudioShell`
container under `src/app/`, splits out the provider shell (`StudioProviders`) and
the purely-presentational chrome (`CanvasStage`, `LeftDock`, `RightDock`,
`ErrorBanner`), and reduces `App.tsx` to a ~17-LoC thin root. The sonner toast
adapter that was inlined in every shell becomes a shared `useToast` hook. No logic
is rewritten; the state web, effects, and hard-core behaviors move byte-for-byte.

## Target Authority Refs

- `docs/projects/mapgen-studio-redesign/FRAME.md` (§3 hard core, §4.7 oRPC)
- `docs/projects/mapgen-studio-redesign/architecture/10-target-architecture.md` (§4 component tree, §7 do-not-break registry)
- `docs/projects/mapgen-studio-redesign/audit/03-component-architecture.md` (§4 decomposition target)

## What Changes

- Add `src/app/StudioProviders.tsx` — the provider shell (tooltip portal + toast
  surface + theme preference wiring), the former `App` wrapper body.
- Add `src/app/StudioShell.tsx` — the layout + orchestration container, the former
  `AppContent` closure MOVED verbatim, with the inline canvas/dock/error JSX
  delegated to the new presentational components and the toast adapter sourced from
  `useToast`.
- Add `src/app/CanvasStage.tsx` — the full-bleed deck.gl host (backdrop, optional
  grid, `DeckCanvas`, empty state), props-driven, MOVED from the inline `canvas`
  block.
- Add `src/app/LeftDock.tsx` / `src/app/RightDock.tsx` — the positioned floating
  docks that host `RecipePanel` / `ExplorePanel` (positioning frame only).
- Add `src/app/ErrorBanner.tsx` — the centered destructive-toned error chrome.
- Add `src/app/hooks/useToast.ts` — the sonner adapter preserving the legacy
  `toast(message, { variant })` shape.
- Reduce `src/App.tsx` to a thin root that renders `StudioProviders`.

## Requires

- App-decomposition (helper corpus extraction), design-system foundation,
  primitives, shell-reskin, and client-data (`viewStore` + oRPC client) slices —
  all already lower in the stack.

## Enables Parallel Work

- The container/presentational store-reading split (RecipeConfigPanel,
  ExploreController, store-backed AppFooter) and the primitives/rjsf re-skin + craft
  pass — both now operate on small, named components instead of one god-file.

## Affected Owners

- `apps/mapgen-studio/src/App.tsx`
- `apps/mapgen-studio/src/app/**` (new)

## Forbidden Owners

- No change to map-generation, Deck.gl math, recipe semantics, or the run-in-game flow.
- No change to the live-runtime poll request-key staleness / adaptive backoff gating.
- No change to the localStorage schema (keys + serialized shapes preserved verbatim).
- No new hand-rolled `fetch`; live reads continue through the typed oRPC client.
- No container/presentational store-reading rewrite of the panels (separate slice).

## Stop Conditions

- Any extraction would require rewriting logic rather than moving it.
- Behavior parity on recipe authoring, viz selection, or run-in-game cannot be preserved.

## Consumer Impact

Developers get a navigable component tree: `App` → `StudioProviders` →
`StudioShell` → `{CanvasStage, AppHeader, LeftDock/RecipePanel,
RightDock/ExplorePanel, AppFooter, PresetDialogs, ErrorBanner}`. End users see no
behavior change — the rendered DOM, interactions, and live loop are identical.

## Verification Gates

- `bun run check` (tsc --noEmit) clean.
- `bun run build` succeeds, including the worker-bundle check.
- Live preview renders with no console errors; recipe authoring, stage/step nav, and
  run controls are present and functional.
- OpenSpec strict validation.
