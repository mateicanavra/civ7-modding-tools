## ADDED Requirements

### Requirement: Studio Polling Reads Share One Managed Tuner Session

The Studio daemon SHALL serve all polling tuner reads (the studio-server
`/rpc` read surface and the control-oRPC mount) over a single shared
`Civ7DirectControlSession` owned by an Effect scoped service in the
studio runtime — acquired lazily, multiplexed across concurrent requests,
self-healing on reconnect, and released with a graceful FIN when the
daemon disposes its runtime on shutdown. Run-in-game flows keep their
per-flow sessions (serialized by the operation queue) and are unchanged.

#### Scenario: One connection across polls

- **WHEN** the Studio polls readiness and live status repeatedly through
  the daemon
- **THEN** at most one established client connection to the tuner port
  exists for those reads, reused across polls, and the game-side
  descriptor count does not grow with poll count

#### Scenario: Graceful release on shutdown

- **WHEN** the daemon receives SIGINT or SIGTERM
- **THEN** the runtime scope closes, the shared session ends with a FIN
  handshake (destroy only as a timeout fallback), and the process exits

#### Scenario: Self-healing after a dropped socket

- **WHEN** the tuner socket drops (game restart) and a later read arrives
- **THEN** the shared session reconnects on that request without daemon
  restart and the read succeeds once the tuner answers

### Requirement: Tuner Reads Back Off When The Game Stops Answering

The shared session service SHALL track consecutive response-timeouts
observed on the shared socket and, past a threshold, fail polling reads
fast with a typed backoff error for a fixed cooldown instead of issuing
new tuner requests — recovering automatically (half-open) after the
cooldown, with the counter reset by any successful response. Connection
failures (game not running) are not gated. Response shapes and status
codes of the read surface are unchanged; only failure message text may
differ while the gate is open.

#### Scenario: Gate opens under sustained timeouts

- **WHEN** consecutive tuner reads exceed the response-timeout threshold
- **THEN** subsequent reads fail fast with the typed backoff error during
  the cooldown and no new requests are written to the tuner socket

#### Scenario: Gate recovers

- **WHEN** the cooldown elapses and the next read receives a successful
  response
- **THEN** the counter resets and reads flow normally again

### Requirement: The Daemon Reports Tuner Session Health

The daemon's health endpoint SHALL report the shared tuner session state —
consecutive response-timeouts, gate status, and a wedge-suspicion flag —
so a wedged game (process alive, tuner silent) is observable without log
archaeology.

#### Scenario: Wedge suspicion is visible

- **WHEN** the tuner stops answering while the game process is running
  and the timeout threshold is crossed
- **THEN** the health endpoint reports the elevated consecutive-timeout
  count and wedge suspicion
