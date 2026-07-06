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
- **AND** compares both against run correlation

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

#### Scenario: Correlation mismatches

- **WHEN** runtime observation sees correlation that does not match the request
- **THEN** Studio fails the operation with public category
  `runtime-observation`
- **AND** records private diagnostics
