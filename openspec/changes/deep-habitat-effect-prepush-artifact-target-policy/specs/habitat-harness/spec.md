## MODIFIED Requirements

### Requirement: Pre-Push Target Policy

Habitat pre-push SHALL select Nx targets from the changed path families instead
of always running generic product `check`.

#### Scenario: Ordinary source changes keep generic check

- **WHEN** pre-push sees changed paths outside Habitat authority roots
- **THEN** it SHALL run generic `check`, `validate:boundary-taxonomy`, and
  `validate:grit-patterns` through Nx affected.

#### Scenario: Rule metadata artifact changes use structural targets

- **WHEN** pre-push sees only `.habitat/rules/**` changes
- **THEN** it SHALL run Habitat structural/source-check targets through Nx
  affected
- **AND** it SHALL NOT request generic product `check`.

#### Scenario: Pattern artifact changes validate patterns

- **WHEN** pre-push sees only `.habitat/patterns/**` changes
- **THEN** it SHALL include Grit pattern validation in the Nx affected request.
