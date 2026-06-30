## MODIFIED Requirements

### Requirement: Pre-Push Target Policy

Habitat pre-push SHALL select Nx targets from changed path families without
running duplicate structural lanes for the same artifact family.

#### Scenario: Source-check rule authority files use source-check once

- **WHEN** pre-push sees only `.habitat/rules/<id>/rule.json` changes for rules
  owned by `source-check`
- **THEN** it SHALL request `source:check` through Nx affected
- **AND** it SHALL NOT also request owner `habitat:check`.

#### Scenario: Non-source rule authority files use owning rule targets

- **WHEN** pre-push sees only `.habitat/rules/<id>/rule.json` changes for rules
  not owned by `source-check`
- **THEN** it SHALL request `habitat:rule:<id>` through Nx affected.

#### Scenario: Mixed rule authority files compose without duplicate owner check

- **WHEN** pre-push sees both source-check and non-source rule metadata changes
- **THEN** it SHALL request `source:check` plus the non-source owning rule
  targets
- **AND** it SHALL NOT request broad owner `habitat:check` unless an artifact is
  unclassified.
