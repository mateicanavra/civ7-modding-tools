## ADDED Requirements

### Requirement: Placement Step Promotion Requires Product Evidence

The placement contract change SHALL promote placement work into separate steps
only when each promoted step has a product or effect boundary.

#### Scenario: Placement work becomes a step
- **WHEN** a placement concern is promoted to a step
- **THEN** the step names its artifact or effect surface, verification
  boundary, and consumer impact
- **AND** the step is not justified only by helper function boundaries or
  internal ordering

### Requirement: Maintenance Work Remains Transactional Without Consumers

Maintenance placement operations SHALL remain transactional unless they gain
independent artifacts, effects, or consumers.

#### Scenario: Maintenance operation is considered for promotion
- **WHEN** terrain validation, area recalculation, restamping, water cache
  storage, or fertility recalculation is considered for a new step
- **THEN** the proposal names the independent contract or leaves the operation
  transactional
