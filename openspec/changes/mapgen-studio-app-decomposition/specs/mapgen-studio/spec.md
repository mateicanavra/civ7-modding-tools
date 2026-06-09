## ADDED Requirements

### Requirement: App.tsx Non-React Helpers Are Extracted Without Behavior Change

Mapgen Studio SHALL host the non-React helper corpus (fetch wrappers, config
builders, deterministic merge/path utilities, preset adapters, setup option
helpers, source-snapshot storage, and shared predicates) in named feature modules
rather than inline at the top of `App.tsx`, with identical runtime behavior.

#### Scenario: Helpers move into modules
- **WHEN** the non-React helpers previously defined at the top of `App.tsx` are referenced
- **THEN** they are imported from feature modules under `features/*` or `shared/*`
- **AND** each helper's implementation is byte-for-byte the same as before extraction
- **AND** `tsc --noEmit` reports zero errors and the production build succeeds

#### Scenario: localStorage schema is preserved
- **WHEN** the run-in-game and map-config persistence keys are read or written
- **THEN** the key strings and serialized shapes are identical to the pre-extraction values
- **AND** a session persisted before the change rehydrates identically after it

### Requirement: Studio Provider Shell And Presentational Chrome Are Separated

Mapgen Studio SHALL render through a provider shell component and dedicated
presentational chrome components, separated from the authoring closure, without
changing the rendered output or interaction behavior.

#### Scenario: Provider shell wraps the app
- **WHEN** the Studio app mounts
- **THEN** the tooltip provider, toast surface, and theme preference wiring are owned by a `StudioProviders` shell
- **AND** the mounted component tree and provider configuration are unchanged from before extraction

#### Scenario: Canvas and error chrome render identically
- **WHEN** the deck canvas stage and the error banner render
- **THEN** they are produced by dedicated presentational components receiving the same inputs
- **AND** the resulting DOM, classes, and Deck.gl inputs match the pre-extraction output

### Requirement: Hard-Core Behaviors Are Untouched By Decomposition

The decomposition SHALL NOT alter map-generation, Deck.gl rendering, recipe
semantics, the run-in-game flow, the live-runtime poll staleness/backoff gating,
or the materialization-mode decision.

#### Scenario: Live loop and run-in-game parity hold
- **WHEN** the live-runtime poll runs and a Run in Game request is issued after the change
- **THEN** the request-key staleness gating, adaptive backoff, fingerprint/relation equality, and materialization-mode decision behave identically to before
- **AND** no live read is re-implemented and no FireTuner read is introduced
