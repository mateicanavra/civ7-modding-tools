## ADDED Requirements

### Requirement: The Studio Server Surface Runs As A Standalone Bun Daemon

The Studio's server surface SHALL be owned by a standalone Bun daemon
process hosting exactly three mounts — the studio-server `/rpc` mount, the
control-oRPC mount at `/api/civ7/rpc`, and the recipe-DAG mount at
`/api/recipe-dag/rpc` — with the Vite dev server reduced to a frontend-only
role that proxies `/rpc` and `/api` to the daemon. The oRPC path contracts
and client transports are unchanged by the cutover.

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
one place — the daemon process — shared by every oRPC mount; no studio
server state may live in the Vite process. The engine behaviors move
verbatim: non-uniform error status codes are preserved per-procedure,
run-in-game status 404 echoes the server instance identity while
save/deploy status 404 does not, and `civ7.live.status` returns success
with per-field embedded errors.

#### Scenario: All mounts observe one queue

- **WHEN** a run-in-game operation is active and a save/deploy request
  arrives on the `/rpc` mount
- **THEN** the request is rejected with the 409 dual-mutex semantics
  naming the active operation

#### Scenario: Restart detection identity

- **WHEN** the daemon restarts and a client polls a stale run-in-game
  request id
- **THEN** the 404 response carries the new process's `serverInstanceId`
  and `serverStartedAt`

### Requirement: The Legacy REST Surface Is Retired

The Studio server SHALL NOT serve the hand-rolled legacy `/api/*` REST
endpoints (user retirement directive, 2026-06-12: no legacy paths, no
fallbacks, forward only): any `/api` path other than the control-oRPC and
recipe-DAG mounts is a 404, and every consumer — the studio client and
repo scripts — talks to the oRPC surface.

#### Scenario: Retired paths are gone

- **WHEN** a retired legacy endpoint such as `/api/civ7/status` or
  `/api/map-configs` is requested
- **THEN** the daemon responds 404 and no handler-specific behavior runs

#### Scenario: Consumers ride oRPC

- **WHEN** the run-in-game proof verification script polls an operation's
  status
- **THEN** it calls the `runInGame.status` oRPC endpoint, not a legacy
  REST path
