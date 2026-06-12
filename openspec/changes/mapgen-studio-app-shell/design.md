## Context

After the helper-corpus extraction, `App.tsx` was still ~2,583 LoC: a thin `App`
provider wrapper plus a single `AppContent` closure holding 42 `useState`, 24
`useEffect`, 34 `useMemo`, 37 `useCallback`, and an inlined provider shell, deck
canvas stage, floating docks, and error banner. The component tree the audit and
architecture/10 §4 call for never materialized.

The challenge is that `AppContent` is a **tightly interconnected state web**:
authoring settings, presets, the live-runtime poll, run-in-game, save/deploy, and
viz selection all read and write each other's state and share refs. Splitting that
web into independent stateful hooks in this slice would be a logic rewrite with real
risk to the hard-core behaviors (live-poll request-key staleness + adaptive backoff,
run-in-game fingerprint/relation/materialization, browserRunner gating). That is
explicitly out of scope for a behavior-preserving decomposition.

## Goals / Non-Goals

- **Goal:** Establish the component tree (`App` → `StudioProviders` → `StudioShell`
  → presentational children) so `App.tsx` becomes a thin root and the orchestration
  lives in a navigable, named container.
- **Goal:** Extract the purely-presentational subtrees (`CanvasStage`, `LeftDock`,
  `RightDock`, `ErrorBanner`) and the provider shell (`StudioProviders`) and the
  toast adapter (`useToast`) as standalone, reusable units.
- **Goal:** Preserve every hard-core behavior verbatim — the orchestration MOVES,
  it is not rewritten.
- **Non-Goal (deferred to the post-decompose UI slices):** the container/
  presentational split that makes `RecipePanel` / `ExplorePanel` / `AppFooter` read
  the Zustand stores / oRPC queries directly and drop their 30–38-prop interfaces.
  That is a prop-flow rewrite; doing it here would risk live-loop and run-in-game
  parity and conflate two concerns. The docks therefore stay positioning-only
  wrappers around the existing panels for now.
- **Non-Goal:** recoloring the canvas backdrop's hard-coded hexes — the MOVE keeps
  the exact pixels; token migration is the design-craft slice's job.

## Decisions

### Decision: `StudioShell` owns the orchestration; `App.tsx` is a 17-LoC root

`AppContent` is moved verbatim into `src/app/StudioShell.tsx` (renamed, same body).
`App.tsx` reduces to `return <StudioProviders />`. The provider wrapper
(`TooltipProvider` + `Toaster` + `useThemePreference`) moves to
`src/app/StudioProviders.tsx`, which renders `StudioShell` with the resolved theme
props. The `QueryClientProvider` intentionally stays at the `main.tsx` module root
(client-data slice) so the cache survives the dev-only StrictMode skip.

- **Why not split `AppContent` into per-domain stateful hooks now?** The shared
  refs and cross-domain reads/writes make that a rewrite, not a move; the parity
  risk (live poll, run-in-game) is too high for a decomposition slice. The thin
  shell + verbatim container achieves the architectural goal (navigable tree, thin
  root) at zero behavior risk, and unblocks the store-reading split as a separate,
  smaller slice.

### Decision: docks are positioning frames, not containers (yet)

`LeftDock`/`RightDock` accept `top` + `children` and own only the absolute
positioning + z-index that was inline in the shell's `return`. The architecture/10
§4 `RecipeConfigPanel`/`ExploreController` container layer that reads stores is
deferred to the store-reading slice; introducing it here would re-thread the 30–38
panel props through new containers without the store backing, which is churn.

### Decision: `CanvasStage` / `ErrorBanner` are pure props-in components

`CanvasStage` takes the exact `DeckCanvas` inputs (`layers`, `effectiveLayer`,
`viewportSize`, `activeBounds`, deck api ref + ready handler) plus two display flags
(`lightMode`, `backgroundGridEnabled`) and a `hasManifest` gate for the empty state.
`ErrorBanner` takes `message` + `top`. Both render the identical DOM/classes the
inline blocks produced.

## Risks / Mitigations

- **Risk:** a moved effect or memo subtly changes evaluation order or closure
  capture. **Mitigation:** the entire `AppContent` body is copied verbatim into
  `StudioShell` with only import paths rewritten and the three inline JSX blocks
  replaced by component calls that receive the same values; `tsc` + build + live
  preview (no console errors, controls functional) confirm parity.
- **Risk:** localStorage schema drift. **Mitigation:** no persistence code is
  touched; the keys + serializers are imported from the same feature modules as
  before.

## Migration / Rollout

Single behavior-preserving slice. The new `src/app/*` modules are additive; `App.tsx`
shrinks. No data migration. Later UI slices build on the new tree.
