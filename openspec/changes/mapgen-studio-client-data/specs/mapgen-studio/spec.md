## ADDED Requirements

### Requirement: Studio Client Performs Zero Manual Fetch Of /api

Mapgen Studio's React client SHALL reach the backend exclusively through the typed
oRPC client (`src/lib/orpc.ts`) bound to the studio contract; it SHALL NOT perform
any manual `fetch` of `/api/*`. All server-data callers route through `orpcClient`
or oRPC-native TanStack Query.

#### Scenario: All client→server traffic flows over /rpc
- **WHEN** the studio runs against the dev server and exercises setup catalog,
  saved configs, the live-runtime poll, autoplay, run-in-game, and save/deploy
- **THEN** every backend request is a `POST` to `/rpc/<namespace>/<procedure>`
- **AND** no request targets `/api/*` from the client

#### Scenario: Feature api wrappers preserve their result envelopes
- **WHEN** a `features/*/api.ts` wrapper (`fetchCiv7SetupConfig`,
  `fetchCiv7SavedSetupConfigs`, `fetchCiv7SetupCatalog`, `requestCiv7Autoplay`,
  `runCurrentConfigInGame`, `fetchRunInGameStatus`, `saveRepoBackedConfig`,
  `fetchMapConfigSaveDeployStatus`) succeeds or fails
- **THEN** it returns the same `{ ok, … }` / `{ ok:false, error, statusCode?, … }`
  shape its caller consumed before the migration
- **AND** on failure `ORPCError.status` is surfaced as `statusCode` and
  `ORPCError.data` fields (`details`, `observedAt`) are surfaced unchanged

#### Scenario: Run-in-game status 404 still drives restart detection
- **WHEN** `fetchRunInGameStatus` is called for an unknown or pruned request id and
  the procedure returns a 404
- **THEN** the wrapper returns `{ ok:false, error, statusCode: 404 }` so the caller
  can detect a server restart, exactly as the legacy `fetch` path did

#### Scenario: Legacy /api middleware is not removed
- **WHEN** this change lands
- **THEN** the legacy `/api/*` handlers remain mounted (coexistence) and no
  standalone Bun server is introduced

### Requirement: Live-Runtime Poll Preserves Staleness And Backoff Over oRPC

The live-runtime poll SHALL read `civ7.live.status`, `civ7.live.snapshot`, and the
inlined `civ7.setupConfig` through the oRPC client while preserving its request-key
staleness gating and adaptive backoff exactly.

#### Scenario: Status outer failure maps to the legacy catch path
- **WHEN** `civ7.live.status` throws an `ORPCError` (status 500) during a poll tick
- **THEN** it is rethrown as an `Error` carrying the message and handled by the
  poll's existing failure path (`buildLiveRuntimeErrorState` + incremented failure
  count), driving the same adaptive backoff as before
- **AND** a 200 response with per-field embedded `{ error }` is NOT treated as a
  transport failure

#### Scenario: Snapshot 400 maps to the legacy error envelope
- **WHEN** `civ7.live.snapshot` throws an `ORPCError` (status 400) during a poll tick
- **THEN** the poll builds `{ ok:false, error }` and feeds it to
  `buildLiveRuntimeSnapshotState`, the same value the legacy `res.ok ? … : …`
  branch produced

#### Scenario: Request-key staleness and abort are unchanged
- **WHEN** a newer snapshot request supersedes an in-flight one
- **THEN** `shouldCommitLiveRuntimeSnapshot` still discards the stale result and the
  prior request's `AbortController` is aborted, with no snapshot tearing
- **AND** `nextLiveRuntimePollDelayMs` continues to set the poll cadence from the
  max status/snapshot failure count and document visibility

#### Scenario: No manual fetch remains in the poll
- **WHEN** `App.tsx` is inspected after this change
- **THEN** it contains no `fetch(` call; the poll's three reads all go through the
  oRPC client

### Requirement: Browser-Only View State Is Owned By A Zustand Store

Mapgen Studio SHALL own browser-only view state in a single Zustand store
(`viewStore`), replacing the scattered `App.tsx` `useState` for that surface, and
SHALL NOT mirror TanStack Query results into Zustand.

#### Scenario: viewStore is the single owner of view state
- **WHEN** view state (canvas grid/edge toggles, overlay selection/opacity/variant,
  era mode + manual era, panel collapse/expand, selected stage/step) changes
- **THEN** the change is read from and written to `useViewStore`, and `App.tsx`
  holds no `useState` mirror of that state
- **AND** the store setters accept a value OR an updater function so existing
  `setX((prev) => …)` call sites are unchanged

#### Scenario: The TanStack Query client is provided once
- **WHEN** the app mounts
- **THEN** a single `QueryClient` (from `src/lib/query.ts`) is provided via
  `QueryClientProvider` in `main.tsx`, created at module root so it survives
  re-renders and the dev-only StrictMode skip

#### Scenario: Server data is never mirrored into Zustand
- **WHEN** server-owned data (live status/snapshot, setup catalog, saved configs,
  run-in-game / save-deploy status) is needed
- **THEN** it is read through the oRPC client / TanStack Query layer, not copied
  into `viewStore` or any other Zustand store
