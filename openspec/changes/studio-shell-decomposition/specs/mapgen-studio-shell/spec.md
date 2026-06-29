## ADDED Requirements

### Requirement: StudioShell is a thin host

After the decomposition, `StudioShell` SHALL contain only layout, the error-boundary host, the global-shortcuts host, and the coordination wiring that assembles controller hooks into JSX. All domain orchestration glue (handlers, derived memos, orchestration effects, and their coordinating refs) SHALL live in controller hooks under `app/controllers/`. The host SHALL NOT inline or re-derive any pure logic that already lives in `features/*` or `app/*` modules.

#### Scenario: Host delegates every domain to a controller hook
- **WHEN** the decomposition is complete
- **THEN** `StudioShell` reads each domain's state and handlers from a controller hook (`useStudioOperations`, `useViewportLayout`, `useBrowserRun`, `useVizSelection`, `usePresetLifecycle`, `useSaveDeploy`, `useRunInGame`, `useLiveRuntime`, `useSetupControls`, `useKeyboardShortcuts`)
- **AND** the rendered output and every user-observable interaction are identical to the pre-decomposition behavior
- **AND** no domain `useEffect`/`useCallback`/`useMemo` orchestration remains defined inline in the host beyond the assembly of JSX and the coordination wiring

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

React fires effects in call order. The decomposition SHALL preserve hook call order = effect fire order. The four atomic effect groups SHALL each be lifted into a single hook with their coordinating refs and their relative source order intact: (1) preset default-seed (410) → preset-apply (435); (2) stage-default (857) → step-default (862) → viz-sync (867); (3) the auto-run trio (929/939/973); (4) era-clamp (2164) → overlay-variant-preference (2198).

#### Scenario: An atomic effect group stays co-resident and ordered
- **WHEN** an atomic group is extracted
- **THEN** both/all of its effects and their shared refs live in the same hook
- **AND** the earlier effect's body precedes the later effect's body in source order
- **AND** the group's coordinating refs (`lastAppliedPresetRef`, `autoRunPendingRef`/`autoRunTimerRef`, `manualEra` ownership) are not shared with any other hook

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

Preset application SHALL replace the pipeline config only when `normalizeStrict` returns zero errors (otherwise the config is left untouched and an error is surfaced). The `lastAppliedPresetRef` skip-guard SHALL remain a single-owner `===` object-identity check: after a save, the preset-apply effect SHALL NOT re-run `applyPresetConfig` for the just-saved config. `lastAppliedPresetRef` SHALL be owned by exactly one hook (`usePresetLifecycle`); other hooks SHALL record an applied preset only via a synchronous `markPresetApplied({key, config})` callback that preserves the exact config object reference.

#### Scenario: A failed preset does not mutate config
- **WHEN** a selected preset fails schema validation
- **THEN** the pipeline config is unchanged
- **AND** a preset-error is surfaced

#### Scenario: Saving does not re-apply and clobber the config
- **WHEN** a save-to-current completes and selects the saved preset key
- **THEN** the preset-apply effect's `===` guard short-circuits (the stored config object is the same reference the resolver returns)
- **AND** `applyPresetConfig` is not called again for that config (the saved config is not reverted)

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

The repository SHALL provide a DOM test environment for controller-hook tests without changing the existing node-environment tests. `@testing-library/react` and a jsdom (or happy-dom) environment SHALL be scoped via `environmentMatchGlobs` to `test/controllers/**` only.

#### Scenario: Controller tests run in jsdom; existing tests stay node
- **WHEN** the `mapgen-studio` vitest project runs
- **THEN** tests under `test/controllers/**` execute in a DOM environment with `renderHook` available
- **AND** the pre-existing `mapgen-studio` tests continue to run in the `node` environment and stay green

### Requirement: Dead write-only live-runtime snapshot state is removed

The dead write-only `setLiveRuntimeSnapshot` state (whose value is never read) SHALL be removed as a flagged improve-slice; the live snapshot tile readback continues to be consumed locally within the snapshot reader.

#### Scenario: Removing the dead state changes no observable behavior
- **WHEN** the dead write-only state is removed
- **THEN** live snapshot reads, the displayed failure count, and all live-runtime status behavior are unchanged
