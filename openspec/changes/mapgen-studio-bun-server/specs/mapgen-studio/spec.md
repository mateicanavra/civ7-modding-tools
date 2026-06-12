## ADDED Requirements

### Requirement: The Studio Server Surface Runs As A Standalone Bun Daemon

The Studio's server surface SHALL be owned by a standalone Bun daemon
process hosting the studio-server `/rpc` mount, the control-oRPC mount at
`/api/civ7/rpc`, the recipe-DAG mount at `/api/recipe-dag/rpc`, and the
legacy `/api/*` REST compat surface, with the Vite dev server reduced to a
frontend-only role that proxies `/rpc` and `/api` to the daemon. All path
contracts and client transports are unchanged by the cutover.

#### Scenario: One-command dev runs both processes

- **WHEN** the developer runs the studio dev script
- **THEN** the daemon starts and reports healthy before Vite starts, the
  app is served on the Vite port, and every `/rpc` and `/api` request is
  answered by the daemon process

#### Scenario: Recipe-DAG mount loads natively under Bun

- **WHEN** the daemon serves a recipe-DAG RPC request
- **THEN** the handler is a statically imported module (no SSR loader
  indirection) and the response matches the previous Vite-hosted mount

#### Scenario: Frontend-only Vite config

- **WHEN** the Vite config is evaluated (dev or build)
- **THEN** it imports no engine, direct-control, or server-handler modules
  and registers no server middleware beyond the proxy

### Requirement: Studio Server State Lives In One Process

The Studio SHALL keep the serialized operation queue, the run-in-game and
save/deploy operation stores, and the server instance identity in exactly
one place — the daemon process — shared by every transport (oRPC mounts
and legacy compat); no studio server state may live in the Vite process. The engine
behaviors move verbatim: non-uniform error status codes are preserved
per-procedure, run-in-game status 404 echoes the server instance identity
while save/deploy status 404 does not, and `live/status` returns 200 with
per-field embedded errors.

#### Scenario: Both transports observe one queue

- **WHEN** a run-in-game operation is active and a save/deploy request
  arrives on either the oRPC mount or the legacy compat surface
- **THEN** the request is rejected with the 409 dual-mutex semantics
  naming the active operation

#### Scenario: Restart detection identity

- **WHEN** the daemon restarts and a client polls a stale run-in-game
  request id
- **THEN** the 404 response carries the new process's `serverInstanceId`
  and `serverStartedAt`

### Requirement: Legacy REST Surface Survives The Cutover Until The Retirement Checkpoint

The legacy `/api/*` REST handlers SHALL remain available through the
cutover as a daemon-hosted compat layer with response bodies and status
codes identical to the Vite-hosted handlers, and SHALL NOT be retired
without an explicit user-approved retirement decision recorded in this
workstream.

#### Scenario: Compat parity

- **WHEN** a legacy endpoint is requested after the cutover
- **THEN** the response status and body shape match the pre-cutover
  Vite-hosted handler for the same engine state

#### Scenario: Retirement is gated

- **WHEN** the cutover slices land without a recorded user checkpoint
  decision
- **THEN** the compat surface is still mounted and the retirement remains
  an open follow-up in the workstream record
