## MODIFIED Requirements

### Requirement: Pre-Push Target Policy

Habitat pre-push SHALL select Nx targets from changed path families without
running duplicate or unrelated structural lanes.

#### Scenario: Ordinary Habitat tooling source changes use package-local check only

- **WHEN** pre-push sees only ordinary `tools/habitat-harness/src/**` changes
  that do not implement structural targets
- **THEN** it SHALL run `@internal/habitat-harness:check`
- **AND** it SHALL NOT request any Nx affected structural targets.

#### Scenario: Boundary taxonomy implementation changes use boundary taxonomy target

- **WHEN** pre-push sees Habitat harness changes to the boundary taxonomy
  implementation
- **THEN** it SHALL run `@internal/habitat-harness:check`
- **AND** it SHALL request `validate:boundary-taxonomy` through Nx affected
- **AND** it SHALL NOT request `validate:grit-patterns`.

#### Scenario: Structural target declaration changes use all structural targets

- **WHEN** pre-push sees Habitat harness structural target declarations change
- **THEN** it SHALL run `@internal/habitat-harness:check`
- **AND** it SHALL request both `validate:boundary-taxonomy` and
  `validate:grit-patterns` through Nx affected.
