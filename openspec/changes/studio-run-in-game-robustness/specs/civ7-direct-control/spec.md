## ADDED Requirements

### Requirement: Direct Control Classifies Shell-Safe Runtime Readiness

The Civ7 direct-control package SHALL classify App UI shell/main-menu as a
valid setup-control state without requiring gameplay globals.

#### Scenario: Shell lacks gameplay globals
- **WHEN** App UI responds from shell/main-menu
- **AND** `Game`, `GameContext`, `Players`, or `GameplayMap` are undefined
- **THEN** direct control reports a shell/setup-control readiness state
- **AND** health/status calls do not fail with `Game is not defined`

#### Scenario: Tuner listed is not gameplay ready
- **WHEN** the Civ7 state list includes `Tuner`
- **BUT** gameplay map summary or runtime seed reads are unavailable
- **THEN** direct control does not classify the game as playable
- **AND** it reports the strongest proven phase instead

### Requirement: Run In Game Mutations Are Not Silently Replayed

Direct control SHALL NOT automatically replay setup/start mutations after a
timeout or socket uncertainty.

#### Scenario: Connection drops during start
- **WHEN** a Run in Game operation loses protocol certainty after requesting a
mutating phase
- **THEN** the operation becomes `uncertain` or `failed`
- **AND** no further mutating command is sent without a new explicit request

#### Scenario: Start timeout includes raw tuner command text
- **WHEN** direct-control reports a Run in Game timeout or socket failure whose
  internal error message contains a raw Tuner `CMD:` request
- **THEN** Studio reports bounded public operation status text
- **AND** status details preserve phase, failure class, direct-control code,
  completed phases, and materialization evidence needed for recovery
- **AND** public status and copyable diagnostics omit raw command, payload,
  state/session, and JavaScript probe text

## ADDED Requirements

### Requirement: Studio Run In Game Is Resumable And Phase-Aware

Mapgen Studio SHALL model Run in Game as a request-id keyed phase operation
that can be resumed after browser reload or fetch abort.

#### Scenario: Browser reloads during launch
- **WHEN** the Studio tab reloads after Run in Game is requested
- **THEN** Studio can query the operation status by request id
- **AND** it shows the last recorded phase, completed phases, proof fields, or
  structured failure details

#### Scenario: Operation completes
- **WHEN** Run in Game succeeds
- **THEN** Studio reports setup row proof, setup readback, start request proof,
  App UI `GameStarted`, Tuner readiness where required, runtime seed and
  dimensions, and fresh Swooper hash markers

### Requirement: Studio Preserves Structured Failure And Recovery Details

Mapgen Studio SHALL surface direct-control failure details and explicit recovery
actions instead of reducing failures to a generic toast.

#### Scenario: Row is missing after deploy
- **WHEN** the requested map row is not visible to Civ setup
- **THEN** Studio reports the phase, map script, materialization mode/path,
  reload boundary, completed phases, and direct-control error code
- **AND** it offers only recovery actions that are valid for that phase

#### Scenario: Dev server is stale
- **WHEN** the browser is connected to a Studio server that cannot serve the
current Run in Game API contract
- **THEN** Studio reports a stale-server or build/server mismatch clearly
- **AND** it does not present a successful launch state
