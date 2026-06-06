## ADDED Requirements

### Requirement: Stack recovery is semantic, not title-based

Swooper mapgen stack recovery SHALL classify predecessor branches and detached
worktrees by code semantics and current behavior, not by commit titles alone.

#### Scenario: A predecessor branch contains a possible fix

- **GIVEN** a nearby branch or detached worktree appears related to Swooper
  mapgen or Studio parity
- **WHEN** it is considered for recovery
- **THEN** the workstream MUST inspect the code delta, compare it to current
  equivalents, and either integrate the missing semantic behavior or record why
  it is already represented, stale, or out of scope.

### Requirement: Visual product failures remain tracked even when tests pass

The recovery workstream SHALL record visible mountain-region and Studio
deploy/config identity failures as product evidence when existing tests do not
catch them. Missing major hydrology outcomes such as visible rivers SHALL be
treated the same way.

#### Scenario: Studio shows implausible mountain regions

- **GIVEN** the current Studio visualization shows mountain ranges as massive
  blocking lines or disconnected oversized clusters
- **WHEN** existing numeric tests pass
- **THEN** the workstream MUST treat this as a missing behavioral/visual proof
  gap
- **AND** it MUST NOT claim mountain-region quality is solved until a
  region-shape gate or direct Studio identity proof covers the failure.

#### Scenario: Studio shows no rivers despite hydrology tests passing

- **GIVEN** current Studio runs show little or no visible river network
- **WHEN** existing hydrology or projection tests pass
- **THEN** the workstream MUST treat this as a missing product-level river
  proof gap
- **AND** it MUST preserve the failure evidence for a focused hydrology/river
  recovery slice instead of claiming parity from local unit tests alone.
