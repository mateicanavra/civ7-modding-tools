## ADDED Requirements

### Requirement: Ecology Feature Scores Become Sparse Intents

Ecology feature-family planners SHALL convert continuous per-tile suitability
scores into sparse feature intents through a documented planner admission
policy while preserving feature-family-specific habitat rules.

#### Scenario: A tile has only weak positive suitability
- **WHEN** a feature score is positive but does not satisfy the owning
  feature-family admission policy
- **THEN** the planner does not emit a feature placement for that tile
- **AND** the tile remains available for later feature families according to
  the current occupancy chain

#### Scenario: Feature families share the score-to-intent category
- **WHEN** reef, wetland, vegetation, or ice planning consumes continuous
  suitability scores and occupancy snapshots
- **THEN** tests cover the shared weak-positive category rather than only one
  named feature
- **AND** each family owns a local policy instead of routing through generic
  feature-planner shared machinery
- **AND** those policies do not replace reef, wetland, vegetation, or ice
  habitat physics

#### Scenario: A planner evaluates a tile
- **WHEN** a feature-family planner evaluates a candidate tile
- **THEN** feature-family habitat eligibility is evaluated before the
  family-local admission policy
- **AND** occupancy/reservation claim and artifact publish happen after the
  admitted feature intent is selected
