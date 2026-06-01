## ADDED Requirements

### Requirement: Guard Enablement Cites Completed Cleanup

Each normalization guard SHALL cite the cleanup change that makes the guarded
structure true before the guard is enabled.

#### Scenario: A G1-G9 guard is added
- **WHEN** a guardrail from the normalization packet is enabled
- **THEN** the guard cites the completed cleanup slice it encodes
- **AND** the guard either passes current intended source or explicitly scopes
  itself to already-passing behavior

### Requirement: Promotion Follows Evidence

OpenSpec archives and evergreen spec promotions SHALL follow implemented and
verified behavior rather than proposal-only target shape.

#### Scenario: A normalization change is archived
- **WHEN** an OpenSpec normalization change is archived
- **THEN** implementation tasks are complete
- **AND** source gates, downstream realignment, and proof records support the
  promoted requirements

### Requirement: Authority Promotion Names Superseding Records

Authority promotion SHALL identify which evergreen doc, ADR, or OpenSpec spec
supersedes each promoted packet section.

#### Scenario: A packet decision is promoted
- **WHEN** a packet decision becomes long-lived authority outside the packet
- **THEN** the promotion records the superseding file and decision scope
- **AND** the packet is updated or cross-referenced so later agents do not
  treat both records as competing authority
