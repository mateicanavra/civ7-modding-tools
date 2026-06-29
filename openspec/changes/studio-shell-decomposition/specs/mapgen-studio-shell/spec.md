## ADDED Requirements

### Requirement: StudioShell behaves identically as a thin host

After the decomposition, the application's observable behavior SHALL be identical to its pre-decomposition behavior across every flow (authoring, browser run/auto-run, viz/layer selection, save/deploy, run-in-game, live runtime, setup, shortcuts). The host SHALL delegate domain orchestration to controller hooks and retain only layout, the error-boundary host, the global-shortcuts host, and the cross-cutting coordination wiring; it SHALL NOT inline or re-derive any pure logic that already lives in `features/*` or `app/*` modules. The host's structural shape (orchestration relocated, not inlined) and the file/hook topology are NON-NORMATIVE here — they are enforced by the architecture-boundary review lane and `habitat classify`, not by a behavior test (the topology lives in design.md).

#### Scenario: Behavior is identical after the host collapses
- **WHEN** the decomposition is complete and the host is reduced to layout + error-boundary + shortcuts host + coordination wiring
- **THEN** every flow's user-observable behavior matches the pre-decomposition baseline (verified by the union of the per-slice parity gating tests plus the manual in-game proofs)
- **AND** no domain orchestration logic is re-derived in the host that duplicates `features/*`/`app/*` pure logic

### Requirement: Every extraction is a behavior-preserving move verified against the behavior-test plan

Each slice SHALL be verified against its gating tests in `BEHAVIOR-TEST-PLAN.md` before the next slice stacks on it. A slice is complete only when its gating tests are green and its declared atomic-group / contract constraints hold. A green diff that fails a gating test is a regression, not a refactor.

#### Scenario: A pure-move slice keeps behavior identical
- **WHEN** a pure-move slice (e.g. `useViewportLayout`, `useBrowserRun`) is implemented
- **THEN** its `BEHAVIOR-TEST-PLAN.md` gating specs pass unchanged
- **AND** no behavior outside the slice drifts (effect order, shared-value timing, request-key staleness, accepted-then-background operation semantics)

#### Scenario: An improve-slice pins exactly one defined change
- **WHEN** an improve-slice (IMPROVE-1, IMPROVE-2, BR-13) is implemented
- **THEN** it is a separate, flagged change carrying its own target-behavior test
- **AND** no other behavior changes in that slice

### Requirement: Pure moves and behavior changes are separated

A behavior change SHALL NOT be smuggled into a slice labeled a pure move. Authorized improvements ship as their own flagged, tested improve-slices.

#### Scenario: Two consecutive clusters cannot be moved purely
- **WHEN** two consecutive target clusters can only be extracted by introducing an unflagged, untested behavior change
- **THEN** implementation stops and the seam map is re-derived before continuing

### Requirement: Effect execution order is preserved per atomic group

React fires effects in call order. The decomposition SHALL preserve hook call order = effect fire order. The four atomic effect groups SHALL each be lifted into a single hook with their coordinating refs and their relative source order intact, identified by semantics + the ref they coordinate (concrete line anchors live in design.md / the behavior-test plan, which are re-anchorable without changing this contract): (1) the **preset default-seed effect → preset-apply effect**, sharing `lastAppliedPresetRef`; (2) the **stage-default → step-default → viz-sync** cascade; (3) the **auto-run trio** (disable-arm, debounce-arm, pending-flush-arm), sharing `autoRunPendingRef`/`autoRunTimerRef`; (4) the **era-clamp effect → overlay-variant-preference effect**, sharing ownership of `manualEra`. The two lower-risk Tier-B ordered pairs SHALL likewise keep their relative source order within their owning hook: the **deck-autofit pair** (space-change fit before first-manifest fit) and the **save-deploy waiter pair** (terminal-waiter mirror/resolve before unmount-cleanup).

#### Scenario: An atomic effect group stays co-resident and ordered
- **WHEN** an atomic group is extracted
- **THEN** all of its effects and their shared refs live in the same hook
- **AND** the earlier effect's body precedes the later effect's body in source order
- **AND** the group's coordinating refs (`lastAppliedPresetRef`, `autoRunPendingRef`/`autoRunTimerRef`, `manualEra` ownership) are not shared with any other hook

#### Scenario: Tier-B ordered pairs keep relative order
- **WHEN** the deck-autofit pair or the save-deploy waiter pair is extracted
- **THEN** the space-change autofit body precedes the first-manifest autofit body (so the first-manifest fit wins the initial camera), and the waiter mirror/resolve body precedes the unmount-cleanup body (so an operation completing at unmount resolves rather than reports a spurious "wait cancelled")

#### Scenario: The stage→step→viz cascade keeps its dependency contract
- **WHEN** the viz-sync effect (867) is extracted
- **THEN** its `exhaustive-deps` suppression is preserved (it depends on `selectedStepId` only)
- **AND** a stage change still settles to the first step then syncs viz exactly once, with no transient stale step

### Requirement: Operation mutual-exclusion has no one-render race

The three busy booleans (`browserRunning`, `runInGameRunning`, `saveDeployRunning`) SHALL be derived synchronously from operation status in render scope and exposed stable-from-first-render (default `false`). They SHALL NOT be republished via `useState`+`useEffect`. A second user-initiated operation SHALL be blocked in the same render in which another operation becomes active.

#### Scenario: A second operation cannot slip through after one begins
- **WHEN** an operation's status becomes `running` in a render
- **THEN** its busy boolean is `true` in that same render
- **AND** any other operation gate evaluated in that render sees the busy boolean as `true` and is blocked with a user-facing message (no silent swallow)

#### Scenario: Pending-selection gating tracks the running flag without lag
- **WHEN** `browserRunning` transitions
- **THEN** `viz.allowPendingSelection` reflects the new value in the same render (not one render late)

### Requirement: Browser auto-run fires exactly once per settled config change

When auto-run is enabled and not gated, a settled configuration change SHALL trigger exactly one browser run — never zero (dropped) and never two (duplicated). Auto-run SHALL be suppressed while `overridesDisabled`, `runInGameRunning`, or `saveDeployRunning`, and a change made during an in-flight run SHALL fire exactly one queued run after completion. No debounce timer SHALL survive auto-run being disabled.

#### Scenario: A change during a run produces one queued run
- **WHEN** the config changes while a browser run is in flight and auto-run is enabled
- **THEN** a pending flag is set and no timer is scheduled
- **AND** exactly one browser run fires after the in-flight run completes

#### Scenario: Disabling auto-run cancels a pending debounce
- **WHEN** auto-run is disabled while a 300 ms debounce timer is scheduled
- **THEN** the timer is cancelled and no browser run fires afterward

### Requirement: Preset application is atomic and identity-preserving

Preset application SHALL replace the pipeline config only when `normalizeStrict` returns zero errors (otherwise the config is left untouched and an error is surfaced). The `lastAppliedPresetRef` skip-guard SHALL remain a single-owner `===` object-identity check: after a save OR a live-sync, the preset-apply effect SHALL NOT re-run `applyPresetConfig` for the just-applied config. `lastAppliedPresetRef` SHALL be owned by exactly one hook; other hooks SHALL record an applied preset only via a synchronous `markPresetApplied({key, config})` callback that preserves the exact config object reference. Two object-identity invariants make the `===` guard survive extraction and SHALL be preserved: (a) the repo-backed save path SHALL store, in the repo-backed preset, the SAME config object that the apply-effect resolver returns (no clone/re-normalize), and the repo-backed entry SHALL be recorded BEFORE the preset-key change that triggers the apply-effect; (b) the live-sync path SHALL keep the host live-preset config referentially equal to the proved run-in-game source config, so resolving the live-game preset returns that identical object.

#### Scenario: A failed preset does not mutate config
- **WHEN** a selected preset fails schema validation
- **THEN** the pipeline config is unchanged
- **AND** a preset-error is surfaced

#### Scenario: Saving does not re-apply and clobber the config
- **WHEN** a save-to-current completes and selects the saved preset key
- **THEN** the repo-backed preset entry is recorded before the preset-key change, and the preset-apply effect's `===` guard short-circuits (the stored config object is the same reference the resolver returns)
- **AND** `applyPresetConfig` is not called again for that config (the saved config is not reverted)

#### Scenario: Live-sync does not re-apply and clobber the synced config
- **WHEN** sync-from-live-game applies the proved source via `applyAuthoringSnapshot` and selects the live-game (or durable) preset key
- **THEN** the host live-preset config is referentially the proved source config, so the apply-effect's `===` guard short-circuits
- **AND** `applyPresetConfig` is not called again for that config (the just-synced config is not reverted)

### Requirement: Authoring-snapshot sync preserves setter write order

The sync-from-live-game authoring write SHALL be performed as one ordered action (`applyAuthoringSnapshot`) owned by the preset/authoring layer, writing `setWorldSettings → setPipelineConfig → setSetupConfig → setOverridesDisabled → setRecipeSettings` with `setRecipeSettings` last, and recording the applied preset before it. Only visible-control paths (`recipeSettings.seed`, `setupConfig`) SHALL be written; hidden fields SHALL NOT be silently overwritten.

#### Scenario: Sync does not let preset-apply overwrite the synced config
- **WHEN** `applyAuthoringSnapshot` runs
- **THEN** `setRecipeSettings` is the last setter called
- **AND** the subsequent preset-apply effect sees the recorded applied-preset and does not overwrite the just-synced pipeline config

### Requirement: Live-runtime reads honor request-key staleness and abort

Live snapshot and live setup reads SHALL commit a response only when its request key matches the active request key and the request was not aborted, and SHALL be skipped after unmount. A new request SHALL abort the prior in-flight request. The failure counter SHALL remain display-only and SHALL NOT drive any client-side retry delay or polling cadence.

#### Scenario: A stale response does not overwrite newer data
- **WHEN** a superseded live-snapshot response resolves after a newer request has begun
- **THEN** the stale response is not committed to state

#### Scenario: No client-side backoff or polling is introduced
- **WHEN** live reads fail repeatedly
- **THEN** no `setTimeout`/`setInterval`-driven retry or poll is scheduled by the client (cadence is daemon-owned)

### Requirement: Save/Deploy terminal-waiter semantics are preserved

The save/deploy terminal waiter SHALL resolve immediately if the operation is already terminal, otherwise register a per-requestId waiter that resolves on the terminal event or rejects after the 5-minute timeout, and SHALL reject all pending waiters on unmount. An adopted terminal status SHALL resolve a pending waiter.

#### Scenario: An adopted terminal status resolves a pending wait
- **WHEN** the operation-adoption path sets a save/deploy operation to a terminal status while a waiter is pending
- **THEN** the waiter resolves with that status and does not hang until timeout

### Requirement: Run-in-Game fingerprint, relation, and materialization integrity

The run-in-game fingerprint SHALL include the materialization mode; `relation=current` SHALL hold only when the fingerprint matches, and `stale` SHALL require a matching requestId. The materialization-mode decision SHALL be a deterministic pure function computed at render time (a `useMemo` over its inputs), not captured via a ref or effect. The process-restart flag SHALL be set only when the relation is not stale and the reload boundary requires it.

#### Scenario: A changed input makes the operation non-current
- **WHEN** any run input changes after a run-in-game operation
- **THEN** the fingerprint differs and the relation is no longer `current`

### Requirement: Operation adoption never reverts terminal state

Operation adoption on `hello`/mount SHALL never replace a newer local terminal operation state with an older in-flight incoming one, and SHALL skip adoption when the daemon identity (`serverInstanceId`+`serverStartedAt`) differs between the `hello` event and the `operations.current` response.

#### Scenario: A daemon-identity mismatch is not adopted
- **WHEN** the daemon identity differs between `hello` and `operations.current`
- **THEN** the response is discarded and a recovery error is surfaced rather than adopting a foreign daemon's operations

### Requirement: The viz selection fixpoint is single-owned

The full selection cascade (`useVizState` + stage/step/dataType/space/render-mode/variant/era/overlay → resolved layer key) SHALL be owned by a single hook (`useVizSelection`). `overlayDataTypeKey` SHALL be derived in render scope before `useVizState`, and `overlayVariantKeyPreference` (the back-edge) SHALL be produced inside the same hook, so the circular dependency through `useVizState` is internal. No other hook SHALL write `selectedStageId`/`selectedStepId` or the mutable `viz` object; only the viz read-projection (`activeBounds`/`manifest`/`effectiveLayer`) SHALL be threaded out.

#### Scenario: Selection is one shared object across JSX and callbacks
- **WHEN** the selection is read by JSX and by the change-handler callbacks in a render
- **THEN** all read the identical `selection` object (no independent re-derivation that could disagree)

#### Scenario: Default selection prefers the first tile-space grid layer
- **WHEN** a freshly generated manifest emits a world-space layer first and a tile-space grid layer later, with no prior user selection
- **THEN** the default resolved selection lands on the first tile-space grid layer (not the first-emitted world-space layer)

### Requirement: The map canvas stays mounted under the pipeline view

While the Pipeline (DAG) view is shown, the map canvas SHALL remain mounted (hidden via CSS), never unmounted. The host-collapse work SHALL preserve this so deck camera state and in-flight generation loops survive the tab switch.

#### Scenario: Switching to the pipeline view does not unmount the canvas
- **WHEN** the stage view switches from map to pipeline and back
- **THEN** the map canvas is hidden (CSS) while pipeline is active but is not unmounted/remounted
- **AND** deck camera state and any in-flight generation are preserved across the switch

### Requirement: The recipe-DAG query is gated on the pipeline view

The recipe-DAG query SHALL fetch only when the Pipeline view is active and SHALL NOT prefetch or refetch on window focus / interval (its result is cached with infinite stale time per recipe).

#### Scenario: DAG query fires only when pipeline is visible
- **WHEN** the studio is on the map view
- **THEN** the recipe-DAG query is disabled (no fetch)
- **WHEN** the user switches to the pipeline view
- **THEN** the query fetches once for that recipe and is not re-fetched on focus or interval

### Requirement: Saved setup-config selection replaces, never merges

Selecting a saved setup config SHALL replace the entire `setupConfig` (it SHALL NOT merge over the prior state, so no stale key survives). Any subsequent edit or live-sync SHALL flip the selector to "Custom" (via normalized-JSON equality), and re-selecting SHALL restore the file exactly.

#### Scenario: Selecting a saved config replaces setup state and drift shows Custom
- **WHEN** a saved setup config is selected
- **THEN** the entire `setupConfig` is replaced by the file-derived state (no merged-over stale keys)
- **WHEN** the user then edits any setup option or a live-sync writes a different setup
- **THEN** the saved-config selector reports "Custom" (drift detected by normalized-JSON equality)

### Requirement: Render-phase latest-value refs are not deferred into effects

The render-phase latest-value ref writes (`runInGameOperationRef`/`saveDeployOperationCurrentRef`, `vizIngestRef`, `shortcutsRef`) SHALL remain assignments executed during render, never moved into a `useEffect`. The pattern SHALL be formalized as a `useLatestRef(value)` helper that writes during render.

#### Scenario: A latest-value reader observes the current render's value
- **WHEN** an event-stream consumer or the global keydown handler reads a latest-value ref
- **THEN** it observes the value from the current render, not a one-render-stale value

### Requirement: The error channel is single-owner with synchronous status derivation

`localError` SHALL be owned by a single coordination owner (the host or `useStudioOperations`), with `setLocalError` and `clearLocalErrorIfCurrent` threaded to every writer. `error` and `status` SHALL be derived synchronously in render scope (never republished via state), so the footer status and the assistive-tech live-region announcement are the same value in the same render.

#### Scenario: A write from any source surfaces without a11y desync
- **WHEN** any of the error writers (viz, browser-run, run-in-game, adoption, studio-events) sets an error
- **THEN** the error surfaces through the single owner
- **AND** the footer `status` and the aria-live `status` reflect the same value in the same render

### Requirement: Controller-hook test infrastructure is available

The repository SHALL provide a DOM test environment for controller-hook tests under `test/controllers/` (enabling `renderHook` + React Testing Library) WITHOUT changing the environment of the existing node tests. The scoping mechanism is non-normative (chosen in design.md — vitest-4 per-file environment override).

#### Scenario: Controller tests run in a DOM env; existing tests stay node
- **WHEN** the `mapgen-studio` vitest project runs
- **THEN** tests under `test/controllers/` execute in a DOM environment with `renderHook` available
- **AND** the pre-existing `mapgen-studio` tests continue to run in `node` and stay green

### Requirement: Dead write-only live-runtime snapshot state is removed

The dead write-only `setLiveRuntimeSnapshot` state (whose value is never read) SHALL be removed as a flagged improve-slice; the live snapshot tile readback continues to be consumed locally within the snapshot reader.

#### Scenario: Removing the dead state changes no observable behavior
- **WHEN** the dead write-only state is removed
- **THEN** live snapshot reads, the displayed failure count, and all live-runtime status behavior are unchanged
