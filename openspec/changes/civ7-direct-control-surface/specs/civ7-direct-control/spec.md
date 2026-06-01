## ADDED Requirements

### Requirement: Civ7 Direct Control Has One Transport Owner

The repository SHALL expose one canonical direct-control boundary for Civ7 tuner
socket transport behavior.

#### Scenario: Package owns direct transport
- **WHEN** repo code needs Civ7 tuner socket transport behavior
- **THEN** it imports `@civ7/direct-control`
- **AND** the package owns state discovery, command execution, health, frame
  parsing, reconnect polling, and classified direct-control errors

#### Scenario: CLI executes a runtime command
- **WHEN** a CLI command needs to run JavaScript against Civ7
- **THEN** it calls the canonical direct-control boundary
- **AND** it does not implement tuner socket framing, state discovery, or
  reconnect behavior locally

#### Scenario: Studio executes a runtime command
- **WHEN** Studio needs to restart or otherwise control the running game
- **THEN** its API endpoint calls the canonical direct-control boundary
- **AND** it does not own raw tuner socket protocol logic

#### Scenario: Bridge path is absent
- **WHEN** repo code needs to control Civ7
- **THEN** it does not append external command logs or call external control
  scripts
- **AND** direct-control failure returns a classified error instead of routing
  through a fallback transport

### Requirement: Direct Control Reports State And Health

The Civ7 direct-control boundary SHALL support state discovery, state selection,
command execution, and health reporting for a running Civ7 instance.

#### Scenario: Health check runs while Civ7 is reachable
- **WHEN** a caller requests health
- **THEN** the boundary reports the host, port, connection status, and available
  tuner states

#### Scenario: Command targets a selected state
- **WHEN** a caller supplies a command and a state selection
- **THEN** the boundary resolves that selection to a tuner state before sending
  the command
- **AND** it returns command output or a classified error

#### Scenario: App UI state exposes curated read-only status
- **WHEN** a caller requests the maintained App UI runtime snapshot
- **THEN** the boundary targets the `App UI` state by role/name
- **AND** it returns read-only network, autoplay, game, UI, player, and map
  status fields without running restart, autoplay activation, save/load, or
  other state-changing commands

#### Scenario: Tuner state is separate from App UI
- **WHEN** a caller targets the `Tuner` state
- **THEN** the boundary treats it as a distinct scripting surface
- **AND** it does not assume `App UI` globals such as `Network.restartGame()`
  exist there
- **AND** it reports command timeouts or command failures as state-specific
  evidence rather than falling back to `App UI`

#### Scenario: Tuner health proves gameplay readiness
- **WHEN** a caller requests Tuner readiness
- **THEN** the boundary executes a read-only canary in the `Tuner` state
- **AND** readiness requires gameplay globals such as `Game`, `GameplayMap`,
  and `Players` to respond with map dimensions, turn data, and alive player ids
- **AND** `LSQ:` presence alone is not treated as Tuner-ready

### Requirement: Direct Control Can Restart And Begin A Game

The Civ7 direct-control boundary SHALL support the native restart-and-begin
developer loop without Windows, FireTuner UI, or user clicks after restart.

#### Scenario: Restart follows the native App UI path
- **WHEN** a caller requests a game restart
- **THEN** the boundary sends `Network.restartGame()` to the `App UI` state
- **AND** it treats the command as successful only when Civ7 returns `true`

#### Scenario: Begin follows the native load-screen path
- **WHEN** a caller asks the boundary to begin after restart
- **THEN** the boundary polls App UI loading state until Civ7 reports
  `WaitingForUIReady` or `WaitingToStart`
- **AND** it sends `UI.notifyUIReady()` to the `App UI` state
- **AND** it waits until App UI reports `GameStarted`

#### Scenario: Restart can wait for Tuner gameplay readiness
- **WHEN** a caller requests restart, begin, and Tuner readiness
- **THEN** the boundary performs the App UI restart/begin sequence
- **AND** it waits for the Tuner gameplay canary to pass before reporting
  ready

### Requirement: Reconnect Behavior Is Explicit

The Civ7 direct-control boundary SHALL make reconnect behavior explicit after
Civ7 exits, restarts, or temporarily drops the tuner socket.

#### Scenario: Civ7 restarts
- **WHEN** the tuner socket becomes unavailable and later returns
- **THEN** the boundary opens a new socket and rediscovers states before
  executing a new command
- **AND** callers receive bounded timeout or reconnect errors rather than a
  silent fallback path

#### Scenario: Reconnect polling waits for readiness
- **WHEN** a caller waits for Civ7 direct-control readiness
- **THEN** the boundary polls with read-only health/state probes
- **AND** it does not automatically replay a state-changing command

#### Scenario: Restart loop uses a persistent control session
- **WHEN** a caller runs a restart/begin/readiness loop
- **THEN** the boundary reuses a persistent tuner-socket session for sequential
  `LSQ:` and `CMD:` requests
- **AND** it reconnects only when Civ7 restarts or closes the listener
