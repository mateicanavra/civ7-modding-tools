## MODIFIED Requirements

### Requirement: Rule-selection tests stay at the structural-check domain boundary

Habitat rule-selection tests SHALL validate selector and staged-disposition
contracts without running the full Habitat check runtime unless the test is
explicitly about runtime composition.

#### Scenario: Selector refusal report uses the owned projection

- **WHEN** a requested Habitat selector does not match registered rules
- **THEN** the failing check report is built through the structural-check
  selector-refusal projection
- **AND** the unit test does not enter full check execution.

#### Scenario: Staged Grit no-root disposition is deterministic

- **WHEN** staged paths do not intersect approved Grit scan roots
- **THEN** the selected Grit rule receives a not-applicable execution record
- **AND** the unit test does not run Grit, baselines, providers, Nx, or the full
  Habitat runtime.
