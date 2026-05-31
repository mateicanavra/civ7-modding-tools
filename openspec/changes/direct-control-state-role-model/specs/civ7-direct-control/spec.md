## ADDED Requirements

### Requirement: Direct Control Defines State Roles

The direct-control package SHALL model Civ7 scripting states as role-specific
surfaces over one direct tuner-socket transport.

#### Scenario: App UI owns lifecycle
- **WHEN** a caller requests lifecycle, client, loading, session, restart, or
  Begin Game behavior
- **THEN** the direct-control package targets the `App UI` state role
- **AND** it does not send those commands to `Tuner`

#### Scenario: Tuner owns post-Begin gameplay
- **WHEN** a caller requests gameplay map reads, GameInfo reads, visibility
  reads, or gameplay operation validators after Begin Game
- **THEN** the direct-control package targets the `Tuner` state role unless the
  wrapper contract names App UI as the owner
- **AND** it requires Tuner gameplay readiness rather than `LSQ:` presence alone

### Requirement: Direct Control Readiness Is Phase-Aware

The direct-control package SHALL expose health/readiness semantics that
distinguish socket reachability, App UI command readiness, Begin Game readiness,
GameStarted state, and Tuner gameplay readiness.

#### Scenario: Tuner is listed before gameplay is ready
- **WHEN** `LSQ:` returns a `Tuner` state
- **THEN** the package treats this as state-listing evidence
- **AND** it does not report gameplay readiness until a Tuner canary succeeds

#### Scenario: Role-specific command fails
- **WHEN** a command targets an unavailable or unready role
- **THEN** the package returns a classified direct-control error
- **AND** it does not route the command through another role as a hidden
  recovery path

### Requirement: State-Changing Commands Are Not Replayed Automatically

The direct-control package SHALL NOT automatically replay state-changing Civ7
commands after socket errors, timeouts, or listener restarts.

#### Scenario: Read-only probe fails during reconnect
- **WHEN** a read-only health, state discovery, snapshot, or catalog probe fails
- **THEN** the package may reconnect and retry within bounded timeout settings

#### Scenario: Mutating command fails during reconnect
- **WHEN** a restart, begin, autoplay, reveal, turn-complete, or operation
  request fails after being sent
- **THEN** the package reports a classified error
- **AND** it does not repeat the mutation unless the caller makes a new request
