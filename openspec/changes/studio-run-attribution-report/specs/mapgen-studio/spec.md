## ADDED Requirements

### Requirement: Run In Game Attribution Is A Private Report

MapGen Studio SHALL store Run in Game attribution as a private report associated
with the request workspace and diagnostics record.

#### Scenario: Attribution report is assembled

- **WHEN** a Run in Game operation creates manifest, generation, deployment, and
  observation records
- **THEN** Studio appends those records to `RunAttributionReport`
- **AND** marks the report complete only when all required sections from the
  target vocabulary are present

#### Scenario: Required attribution section is absent

- **WHEN** a required attribution section is absent
- **THEN** Studio marks the attribution report incomplete
- **AND** if the missing section belongs to a required launch step, the
  operation fails with that step's public failure category

#### Scenario: Public status is queried

- **WHEN** public Run in Game status is queried
- **THEN** Studio returns public operation status and diagnostics id
- **AND** does not embed the attribution report
