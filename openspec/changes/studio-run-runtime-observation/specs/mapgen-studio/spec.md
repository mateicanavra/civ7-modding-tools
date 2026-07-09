## ADDED Requirements

### Requirement: Runtime Observation Requires Deployment Records

MapGen Studio SHALL observe runtime only after request artifact and deployment
records exist.

#### Scenario: Runtime observation starts

- **WHEN** manifest, generated mod, deployment, and deployed snapshot records
  exist
- **THEN** Studio establishes a scripting-log observation window before Civ7
  start or focus
- **AND** Studio collects scripting-log observation and setup-row readback
- **AND** Studio collects a post-start generated-artifact marker from the
  running game
- **AND** Studio collects loaded-game status and bounded map snapshot through
  the public `/rpc` `civ7.live.status` and `civ7.live.snapshot` operations
- **AND** compares all observation records against run correlation

#### Scenario: Stale log marker exists

- **WHEN** a matching marker appears before the operation's log observation
  cursor
- **THEN** Studio treats that marker as stale
- **AND** the operation still waits for a marker inside its observation window

#### Scenario: Observation times out

- **WHEN** the observation deadline passes without matching correlation
- **THEN** Studio fails the operation with public category
  `runtime-observation`
- **AND** records private diagnostics

#### Scenario: Setup row is missing or mismatched

- **WHEN** setup row readback cannot find the requested row or finds a row whose
  run artifact id does not match the request
- **THEN** Studio fails the operation with public category
  `runtime-observation`
- **AND** records private diagnostics

#### Scenario: Loaded game readback is missing or mismatched

- **WHEN** post-start observation cannot find the request-specific
  generated-artifact marker from the running game
- **OR WHEN** public `/rpc` live reads cannot show loaded/in-game state or
  cannot return a non-empty bounded map grid matching the requested map size
- **OR WHEN** status/snapshot shape evidence exists without the request-specific
  generated-artifact marker
- **THEN** Studio fails the operation with public category
  `runtime-observation`
- **AND** records private diagnostics

#### Scenario: Correlation mismatches

- **WHEN** runtime observation sees correlation that does not match the request
- **THEN** Studio fails the operation with public category
  `runtime-observation`
- **AND** records private diagnostics
