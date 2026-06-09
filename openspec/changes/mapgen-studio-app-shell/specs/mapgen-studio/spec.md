## ADDED Requirements

### Requirement: App.tsx Is A Thin Root Over The Studio Component Tree

Mapgen Studio SHALL render through a decomposed component tree — `App` →
`StudioProviders` → `StudioShell` → presentational children — with `App.tsx`
reduced to a thin root that only mounts the provider shell, and no authoring,
live-runtime, run-in-game, or viz orchestration logic remaining inline in `App.tsx`.

#### Scenario: App root only mounts the provider shell
- **WHEN** the Studio app mounts
- **THEN** `App.tsx` renders the `StudioProviders` shell and contains no `useState`/`useEffect` orchestration
- **AND** the orchestration closure (formerly `AppContent`) is hosted by a dedicated `StudioShell` container under `src/app/`
- **AND** `tsc --noEmit` reports zero errors and the production build (including the worker-bundle check) succeeds

#### Scenario: Provider shell owns the cross-cutting providers
- **WHEN** the Studio app mounts
- **THEN** the tooltip portal, toast surface, and theme-preference wiring are owned by `StudioProviders`
- **AND** the `QueryClientProvider` remains owned at the module root in `main.tsx`
- **AND** the mounted component tree and provider configuration are unchanged from before the decomposition

### Requirement: Presentational Chrome Is Extracted As Standalone Components

Mapgen Studio SHALL render the deck.gl canvas host, the left/right floating docks,
and the error banner through dedicated presentational components that receive their
inputs as props, without changing the rendered DOM, classes, or Deck.gl inputs.

#### Scenario: Canvas stage renders identically
- **WHEN** the deck.gl canvas host renders
- **THEN** it is produced by a `CanvasStage` component receiving the layers, effective layer, viewport size, active bounds, deck api ref, light-mode flag, background-grid flag, and manifest gate
- **AND** the resulting DOM, classes, backdrop, optional grid, and `DeckCanvas` inputs match the pre-decomposition output
- **AND** the "Click Run to generate a map" empty state shows exactly when no viz manifest is present

#### Scenario: Docks and error banner render identically
- **WHEN** the recipe and explore panels and the error banner render
- **THEN** the panels are hosted inside `LeftDock` / `RightDock` positioning frames at the same offsets and z-index as before
- **AND** the error banner is produced by an `ErrorBanner` component that renders only when an error message is present, with the same destructive-toned classes

### Requirement: Decomposition Preserves Hard-Core Studio Behavior

The component-tree decomposition SHALL NOT alter map-generation, Deck.gl rendering,
recipe semantics, the run-in-game flow, the live-runtime poll request-key staleness
and adaptive-backoff gating, the materialization-mode decision, the browserRunner
gating, or the localStorage schema. Live reads SHALL continue through the typed
oRPC client with no new hand-rolled `fetch`.

#### Scenario: Authoring and run controls stay functional
- **WHEN** the decomposed shell renders in the live preview
- **THEN** recipe authoring (recipe/preset/config form), stage/step navigation, and the run controls (Run, Reroll, Run in Game) are present and functional
- **AND** no console errors are emitted

#### Scenario: Live loop and run-in-game parity hold
- **WHEN** the live-runtime poll runs and a Run in Game request is issued after the decomposition
- **THEN** the request-key staleness gating, adaptive backoff, fingerprint/relation equality, and materialization-mode decision behave identically to before
- **AND** the live status and snapshot reads still flow through the oRPC client, with no FireTuner read and no new manual `fetch`

#### Scenario: localStorage schema is preserved
- **WHEN** the run-in-game and map-config persistence keys are read or written
- **THEN** the key strings and serialized shapes are identical to the pre-decomposition values
- **AND** a session persisted before the change rehydrates identically after it
