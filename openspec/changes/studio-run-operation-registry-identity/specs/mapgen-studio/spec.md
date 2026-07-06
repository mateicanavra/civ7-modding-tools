## ADDED Requirements

### Requirement: Run In Game Operation Identity Is Request Id

MapGen Studio SHALL use request id as the sole Run in Game operation identity
and shall hold one active runtime ownership lease.

#### Scenario: Same content starts a new operation

- **WHEN** a user starts Run in Game twice with identical authored content
- **AND** the two starts have different request ids
- **AND** the first operation has terminalized
- **THEN** Studio admits the second start as a fresh operation
- **AND** no expired record for the first request id blocks the second request

#### Scenario: Another launch is active

- **WHEN** a Run in Game operation holds the runtime ownership lease
- **AND** another Run in Game start request is submitted
- **THEN** Studio rejects the second start with public category `ownership`
- **AND** does not create a second active operation

#### Scenario: Save and Deploy races active Run in Game

- **WHEN** Run in Game holds the runtime ownership lease
- **AND** Save/Deploy attempts a deployed-mod write
- **THEN** Save/Deploy reports a public ownership conflict
- **AND** Run in Game remains the lease owner

#### Scenario: Old request id is queried

- **WHEN** status is queried for an expired or terminal request id
- **THEN** Studio returns the lookup result for that request id only
- **AND** that lookup result does not affect admission for a different request
  id

### Requirement: Operation Records Survive Daemon Restart

MapGen Studio SHALL record enough operation identity to reconcile abandoned
operations after daemon restart.

#### Scenario: Daemon restarts with active records

- **WHEN** a new daemon starts and finds non-terminal operation records owned by
  another daemon id
- **THEN** those records terminalize as failed with public category `ownership`
- **AND** each terminalized record references private diagnostics
- **AND** any stale durable lease slot owned by those records is released
