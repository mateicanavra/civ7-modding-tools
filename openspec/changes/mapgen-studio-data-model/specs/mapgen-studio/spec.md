## ADDED Requirements

### Requirement: Read Surface Uses oRPC-Native TanStack Query

Mapgen Studio SHALL read its non-live server surface (saved setup configs, the setup
catalog, and the run-in-game + save-deploy operation status) through oRPC-native
TanStack Query (`orpc.<namespace>.<procedure>.queryOptions()` into `useQuery`),
replacing the hand-rolled `useEffect` load/poll loops, while preserving the exact
view shapes and poll cadence. The live-runtime status/snapshot poll and its inlined
`setupConfig` read SHALL remain imperative (their request-key staleness and adaptive
backoff are hard core). Query results SHALL NOT be mirrored into Zustand.

#### Scenario: Saved configs and catalog load via useQuery

- **WHEN** the studio mounts and the saved-configs / setup-catalog data is needed
- **THEN** it is read through `orpc.civ7.savedConfigs` / `orpc.civ7.setupCatalog`
  `queryOptions()` into `useQuery`, not a hand-rolled `useEffect` fetch loop
- **AND** the derived `{ status, directory, configurations, updatedAt, error }` /
  `{ status, catalog, updatedAt, error }` shapes consumed by `setupControlOptions`
  are unchanged
- **AND** retry-on-failure and refetch-on-window-focus are provided by the query
  client defaults (matching the legacy retry timer + `focus` listener)

#### Scenario: Run-in-game and save-deploy status poll via useQuery

- **WHEN** a run-in-game or save-deploy operation has an active request id
- **THEN** its status is polled by a `useQuery` keyed on that request id with a
  `refetchInterval` of `document.hidden ? 3000 : 1000` ms
- **AND** the poll STOPS (no further refetch) once the operation reaches a terminal
  phase (run-in-game) or a non-running status (save-deploy)
- **AND** a 404 / missing-operation response is mapped to the same synthetic
  `uncertain` / `operation-status-missing` operation the imperative refresh produced

#### Scenario: Start and save mutations seed the poll

- **WHEN** a run-in-game start or save-deploy mutation returns its immediate response
- **THEN** the response seeds the operation state synchronously and sets the active
  request id in `runStore`, and the poll's `initialData` keeps that seed fresh for one
  interval — so the operation is shown immediately and the first network refresh is the
  interval-driven one, with no extra immediate round-trip

#### Scenario: Live-runtime poll stays imperative

- **WHEN** the live-runtime status/snapshot poll runs
- **THEN** it still reads `civ7.live.status`, `civ7.live.snapshot`, and the inlined
  `civ7.setupConfig` imperatively through the oRPC client, preserving the request-key
  staleness gate and adaptive backoff exactly (it is NOT migrated to `useQuery`)

#### Scenario: Query results are not mirrored into Zustand

- **WHEN** server-owned data (saved configs, catalog, run/save status) is needed
- **THEN** it is read through the TanStack Query layer, never copied into a Zustand
  store; the stores hold only request ids and browser-authored state

### Requirement: Run-In-Game Contract Selected-Config Id Is Optional

The `runInGame.start` contract input SHALL declare `selectedConfig.id` as optional,
matching `parseRunInGameSetupRequest` (disposable runs omit `id`), and the client
SHALL assemble the start request without an `as unknown as Parameters<…>` cast,
restoring full input type checking on the `assertNoRawControlFields`-protected path.

#### Scenario: Disposable run without a selected-config id type-checks

- **WHEN** a disposable run-in-game request is assembled with a `selectedConfig` that
  has no `id`
- **THEN** it satisfies the `runInGame.start` contract input type directly (no cast)
- **AND** the server `parseRunInGameSetupRequest` accepts it exactly as before

#### Scenario: The raw-control-fields scan is unaffected

- **WHEN** the start request is sent
- **THEN** the server still runs `assertNoRawControlFields` over the body and the
  `.catchall(z.unknown())` pass-through still carries unknown keys to that scan

### Requirement: Authoring And Run State Are Persisted Zustand Stores

Mapgen Studio SHALL own authoring state in a persisted `authoringStore` and run/save
correlation state in a persisted `runStore` (Zustand `persist`), replacing the
`StudioShell` `useState` + manual persistence effects. Both stores SHALL reproduce
the EXISTING localStorage schema — same keys, same serializers, same migrations —
byte-for-byte (the reference impl is copied, not modified).

#### Scenario: authoringStore round-trips the existing schema

- **WHEN** authoring state (`worldSettings`, `recipeSettings`, `setupConfig`,
  `pipelineConfig`, `overridesDisabled`, `repoBackedPresetOverridesByRecipe`) changes
  and the page is reloaded
- **THEN** it is persisted under the existing `STUDIO_AUTHORING_STATE_KEY` with the
  same `schemaVersion:1` / `savedAt` / normalized payload the reference impl wrote
- **AND** it is rehydrated through the same `parseStudioAuthoringState` path, so a
  payload written before this change still loads unchanged

#### Scenario: runStore preserves the request-id bridge

- **WHEN** a run-in-game or save-deploy request id, last source snapshot, last run
  snapshot, or last save-deploy config is recorded
- **THEN** it is persisted under the existing `RUN_IN_GAME_LAST_*` /
  `MAP_CONFIG_SAVE_LAST_REQUEST_KEY` strings with the existing serializers
- **AND** on reload the stored request ids feed the status `useQuery`s so an
  in-flight operation resumes polling, exactly as the legacy mount effect did

#### Scenario: StudioShell holds no authoring/run useState mirror

- **WHEN** `StudioShell` is inspected after this change
- **THEN** the authoring and run/save state is read from and written to the stores,
  with no local `useState` mirror and no standalone `saveStudioAuthoringState`
  persistence `useEffect`
