## ADDED Requirements

### Requirement: The Studio Server Surface Is One oRPC Mount

The studio daemon SHALL serve exactly one oRPC mount at `/rpc`, hosting the
unified contract — the studio read/engine surface, the Civ7 control
namespaces under `civ7.*`, and `recipeDag.*` — behind a single `RPCHandler`
over the one `ManagedRuntime` in `@civ7/studio-server`. The former satellite
mounts (`/api/civ7/rpc`, `/api/recipe-dag/rpc`) and every other `/api` path
respond 404. This supersedes the three-mount topology requirement of
`mapgen-studio-bun-server`; that change's daemon-process, engines-ownership,
and legacy-REST-retirement requirements remain in force.

#### Scenario: All namespaces answer on one mount

- **WHEN** the daemon receives `/rpc/studio/serverInfo`,
  `/rpc/civ7/readiness/current`, and `/rpc/recipeDag/get` requests
- **THEN** all three are answered by the same handler with their unchanged
  contract I/O shapes

#### Scenario: Retired mounts are gone

- **WHEN** a request targets `/api/civ7/rpc/readiness/current` or
  `/api/recipe-dag/rpc/recipeDag/get` (or any other `/api` path)
- **THEN** the daemon responds 404 and no handler-specific behavior runs

#### Scenario: Namespace merge cannot shadow

- **WHEN** the unified contract composes the studio `civ7.*` entries with
  the control namespaces
- **THEN** the key sets are disjoint, and a test fails if a future control
  namespace would shadow a studio procedure (or vice versa)

### Requirement: Session Sharing Is Structural

The shared `Civ7TunerSession` SHALL flow into every control procedure's
`endpointDefaults` inside `@civ7/studio-server`'s handler — resolved from
the one runtime, not threaded by the host. No host-side session patch
exists; the handler exposes no session-extraction port (only
`tuner.health()` and `dispose()`); the host supplies its dependencies via
required `StudioServerContext` fields (`recipeDagService`, `civ7Control`).

#### Scenario: Control calls ride the shared session

- **WHEN** a control procedure (e.g. `civ7.readiness.current`) executes via
  the unified handler
- **THEN** its direct-control call receives the runtime's shared session in
  `endpointDefaults` along with the host-configured timeout

#### Scenario: Handler construction opens no socket

- **WHEN** the unified handler is constructed and serves non-control
  procedures (e.g. in tests with fake context)
- **THEN** no connection to the game is opened (the session object is
  acquired unconnected; `connect()` runs on first command)

### Requirement: The Studio App Has One oRPC Client

The studio app SHALL reach the entire server surface through exactly one
oRPC client typed off the unified contract, and the dev frontend SHALL proxy
exactly one path prefix (`/rpc`) to the daemon. No satellite clients, no
second proxy rule, no client-side mount-path constants.

#### Scenario: Control and DAG features ride the one client

- **WHEN** the live-control port issues `readiness.current` /
  `display.explore.request`, or the pipeline view loads a recipe DAG
- **THEN** the calls go through the single `orpcClient`
  (`civ7.*` / `recipeDag.*`) over `/rpc`

#### Scenario: Dev proxy has one rule

- **WHEN** the Vite dev server starts
- **THEN** its proxy configuration forwards only `/rpc` to the daemon
