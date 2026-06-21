## ADDED Requirements

### Requirement: Grit Pattern Fixture Validation Is Graph-Owned

Checked-in Habitat/Grit pattern fixture validation SHALL be runnable as an
explicit Nx target instead of as live vendor execution inside package unit tests.

#### Scenario: pattern fixtures validate through Nx

- **GIVEN** checked-in Habitat pattern markdown and `.grit/grit.yaml`
- **WHEN** `nx run @internal/habitat-harness:validate:grit-patterns` runs
- **THEN** native `grit patterns test` validates the pattern fixtures
- **AND** the target exits non-zero on fixture failure.

#### Scenario: normal validation includes Grit fixture proof

- **GIVEN** root check or Habitat verify/pre-push target planning
- **WHEN** normal validation targets are selected
- **THEN** `validate:grit-patterns` is included as a graph target
- **AND** Grit fixture validity is not dependent on unit-test execution.

### Requirement: Unit Tests Do Not Execute Native Grit For Availability

Habitat unit tests SHALL NOT execute live Grit merely to prove vendor
availability.

#### Scenario: workspace tool tests use command materialization

- **GIVEN** `workspace-tools.test.ts`
- **WHEN** the Habitat package test target runs
- **THEN** the tests verify workspace-owned Grit command materialization
- **AND** native Grit execution is validated by the explicit Nx target.
