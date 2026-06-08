## ADDED Requirements

### Requirement: Mountain Region Repairs Preserve Region Product Shape

Mountain-region repair SHALL preserve mountains as physically grounded,
internally varied, passable regions rather than optimizing thin spines or line
systems.

#### Scenario: Mountain-region failure row exists
- **WHEN** product acceptance records a failing mountain-region row
- **THEN** the repair workstream measures footprint, length, width, diameter,
  connectedness, non-mountain interior, flat pockets, peak share, foothill
  support, rough support, and passability
- **AND** it classifies the owner before code changes

#### Scenario: Proposed repair improves a spine but loses region shape
- **WHEN** a proposed repair improves mountain spine metrics while degrading
  region width, internal variation, or passability
- **THEN** the repair fails the product acceptance gate
