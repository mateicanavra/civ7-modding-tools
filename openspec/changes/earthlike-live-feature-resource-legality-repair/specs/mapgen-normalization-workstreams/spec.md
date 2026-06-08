## ADDED Requirements

### Requirement: Feature And Resource Repairs Follow Classified Legality Evidence

Feature and resource legality repairs SHALL follow classified final-surface
evidence and the correct official-data, adapter, map-policy, or MapGen owner.

#### Scenario: Feature or resource delta belongs to repo policy
- **WHEN** final-surface parity classifies a feature or resource delta as a
  repo-owned policy gap
- **THEN** the repair is made in the adapter or map-policy owner
- **AND** focused tests preserve official-data and legality behavior

#### Scenario: Resource repair would violate spacing or age legality
- **WHEN** a resource repair would silently violate authored spacing,
  age-appropriateness, or diversity expectations
- **THEN** the repair is rejected before product acceptance reruns
