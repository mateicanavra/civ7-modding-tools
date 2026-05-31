## ADDED Requirements

### Requirement: Direct Control Reads Civ7 Setup State

The Civ7 direct-control boundary SHALL expose App UI setup snapshots and
frontend map-row visibility as package-owned read wrappers.

#### Scenario: Setup snapshot reads selected setup fields
- **WHEN** a caller requests a Civ7 setup snapshot
- **THEN** the boundary targets App UI
- **AND** it reports shell/loading/running-game phase, setup revision, `Map`,
  `MapSize`, `MapRandomSeed`, `GameRandomSeed`, and visible map rows

#### Scenario: Frontend map rows are distinct from gameplay map-size rows
- **WHEN** a caller verifies a setup map script
- **THEN** the boundary reads frontend setup/config map rows
- **AND** it does not treat Tuner `GameInfo.Maps` map-size rows as setup row
  proof

### Requirement: Direct Control Applies Single-Player Setup

The Civ7 direct-control boundary SHALL apply map script, map size, map seed,
and bounded setup options through package-owned App UI setup wrappers.

#### Scenario: Setup is applied from shell
- **WHEN** a caller provides map script, map size, and seed with approval
- **THEN** the boundary validates visible setup domains
- **AND** it writes setup through App UI setup/configuration APIs
- **AND** it reads back the requested values before reporting success

#### Scenario: Setup mutation is not replayed automatically
- **WHEN** a setup mutation command times out or the socket closes after send
- **THEN** the boundary returns a classified error
- **AND** it does not replay the setup mutation without a new caller request

### Requirement: Direct Control Starts Prepared Single-Player Games

The Civ7 direct-control boundary SHALL start a prepared single-player game only
after verifying expected setup values.

#### Scenario: Prepared start verifies setup and runtime seed
- **WHEN** a caller starts a prepared game
- **THEN** the boundary verifies expected setup row, map size, and map seed
  before start
- **AND** it waits for App UI GameStarted and optional Tuner readiness
- **AND** when Tuner proof is requested it verifies `GameplayMap.getRandomSeed`
  against the setup map seed

#### Scenario: Existing game requires explicit exit approval
- **WHEN** a caller requests Run in Game from an existing running game
- **THEN** the boundary exits to shell only when the request explicitly approves
  `fromRunningGame: "exit-to-shell"`
- **AND** it records that transition in the result
