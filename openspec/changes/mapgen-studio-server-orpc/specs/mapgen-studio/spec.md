## ADDED Requirements

### Requirement: Studio Exposes Its Own oRPC Server Implementing The Studio Contract

Mapgen Studio SHALL implement the committed `@civ7/studio-server` oRPC contract
(16 procedures) as an effect-orpc router mounted at `/rpc` inside the existing
Vite dev middleware, with the legacy `/api/*` handlers kept alive alongside it.
The router SHALL be backed by Effect services for the read surface and by a
host-injected context seam for the stateful surface, with no behavior change.

#### Scenario: oRPC procedures answer over /rpc
- **WHEN** a client posts to `/rpc/<namespace>/<procedure>` for any of the 16
  studio-server procedures
- **THEN** the effect-orpc router resolves the procedure and returns the same
  success payload the corresponding `/api/*` handler produced
- **AND** `studio.serverInfo` returns `{ ok:true, serverInstanceId, startedAt,
  runInGameApiVersion: 2, viteCommand }`

#### Scenario: Legacy /api handlers stay alive (coexistence)
- **WHEN** the same operation is requested through both `/rpc` and the legacy
  `/api/*` path
- **THEN** both transports respond, and both observe the SAME serialized operation
  queue, operation stores, and process-singleton identity
- **AND** neither the existing `/api/*` middleware nor a standalone Bun server is
  removed or introduced in this change

#### Scenario: Read surface stays direct-control-backed
- **WHEN** a live read procedure (`civ7.status`, `civ7.mapSummary`,
  `civ7.gameInfo`, `civ7.live.*`, `civ7.setupConfig`, `civ7.savedConfigs`) runs
- **THEN** it reads through `@civ7/direct-control` via the `Civ7TunerClient`
  Effect service with the same call shapes as the `/api` handler
- **AND** no new FireTuner read path is added

### Requirement: Studio oRPC Server Preserves The Parity Registry Exactly

The studio-server router SHALL reproduce the non-uniform error semantics and
stateful invariants of the hand-rolled `/api/*` handlers without alteration.

#### Scenario: Error status codes are non-uniform
- **WHEN** a procedure fails
- **THEN** the transport error carries the legacy status code for that procedure:
  `civ7.gameInfo` and `civ7.live.*` map a failure to 400, `civ7.setupConfig` to
  503, and `civ7.status`/`civ7.mapSummary`/`civ7.savedConfigs`/`civ7.setupCatalog`
  to 500
- **AND** the failure carries the legacy body fields (`details`, `observedAt`)
  on the oRPC error `data`

#### Scenario: live.status returns 200 with embedded per-field errors
- **WHEN** `civ7.live.status` runs and one or more of its four aggregated reads
  rejects
- **THEN** the response is HTTP 200 and the failed field carries
  `{ error: <reason> }` while successful fields carry their payload
- **AND** only an outer (non-aggregated) failure yields a transport error

#### Scenario: Run-in-game status 404 echoes server identity; map-config status 404 does not
- **WHEN** `runInGame.status` is polled for an unknown or pruned request id
- **THEN** the 404 error `data` includes `serverInstanceId` and `serverStartedAt`
  for client restart detection
- **WHEN** `mapConfigs.status` is polled for an unknown request id
- **THEN** the 404 error does NOT include `serverInstanceId`/`serverStartedAt`

#### Scenario: Raw control fields are rejected
- **WHEN** `runInGame.start` receives a body containing any of
  `command|script|javascript|rawJs|rawCommand` at any depth
- **THEN** the request is rejected with status 400 by `assertNoRawControlFields`
- **AND** no map materialization, deploy, or game launch occurs

#### Scenario: Stateful operations share one serialized queue and dual mutex
- **WHEN** an autoplay, run-in-game, or save/deploy operation is active
- **THEN** a conflicting operation requested through either transport is refused
  with status 409 carrying the active operation's `code`/`requestId`/`phase`
- **AND** run-in-game start with a fingerprint matching an active operation returns
  the active operation snapshot (duplicate request) rather than a 409

### Requirement: Studio Provides A Typed oRPC Client Without Switching Call Sites

Mapgen Studio SHALL provide a typed oRPC client and oRPC-native TanStack Query
utils for the studio contract, while leaving the existing hand-rolled `/api`
fetch call sites unchanged in this slice.

#### Scenario: Client and query utils are available
- **WHEN** application code imports `src/lib/orpc.ts`
- **THEN** it receives an oRPC client typed off the studio contract (pointed at
  `/rpc`) and `createTanstackQueryUtils`-derived query utils
- **AND** the existing `/api` fetch call sites are not modified, so both the legacy
  and oRPC paths remain available during cutover

#### Scenario: Build and typecheck stay clean
- **WHEN** the studio-server package is typechecked and the app is typechecked and
  built
- **THEN** `bun run check` for `packages/studio-server` reports zero errors
- **AND** `bun run check` and `bun run build` for `apps/mapgen-studio` succeed,
  including the worker-bundle check
