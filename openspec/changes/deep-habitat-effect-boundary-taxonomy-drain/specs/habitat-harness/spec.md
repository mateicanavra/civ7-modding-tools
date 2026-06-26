## ADDED Requirements

### Requirement: Boundary Taxonomy Audit Is Graph-Owned

The current-workspace boundary taxonomy audit SHALL be runnable as an explicit
Nx target instead of as part of the Habitat package unit-test target.

#### Scenario: taxonomy validation runs through Nx

- **GIVEN** the current workspace taxonomy, package manifests, Nx project graph,
  and boundary config
- **WHEN** `nx run @internal/habitat-harness:validate:boundary-taxonomy` runs
- **THEN** the target validates taxonomy/config/manifest/Nx metadata drift and
  illegal graph edges
- **AND** it exits non-zero on audit issues.

#### Scenario: taxonomy validation stays on normal validation paths

- **GIVEN** Habitat root check or Habitat verify/pre-push target planning
- **WHEN** normal validation targets are selected
- **THEN** `validate:boundary-taxonomy` is included as a graph target
- **AND** boundary taxonomy drift is not dependent on unit-test execution.

### Requirement: Unit Tests Do Not Resolve Current Workspace Topology

Habitat unit tests SHALL NOT resolve the live Nx project graph for boundary
taxonomy enforcement.

#### Scenario: boundary taxonomy tests use fixtures

- **GIVEN** `boundary-taxonomy.test.ts`
- **WHEN** the Habitat package test target runs
- **THEN** the tests exercise parsing and audit behavior with bounded fixtures
- **AND** current workspace topology is validated by the explicit Nx target.
