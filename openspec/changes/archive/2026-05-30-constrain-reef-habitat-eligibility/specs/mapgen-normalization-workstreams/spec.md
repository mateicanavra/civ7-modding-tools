## ADDED Requirements

### Requirement: Reef Intent Planning Uses Reef-Specific Habitat Eligibility

Reef-family feature planning SHALL apply reef-specific habitat eligibility
rather than treating every shallow or temperature-suitable water tile as reef
intent.

#### Scenario: Broad water has weak reef structure
- **WHEN** water tiles have broad positive temperature/depth suitability but no
  reef-family habitat structure
- **THEN** reef planning does not emit blanket reef placements

#### Scenario: Reef-family features differ physically
- **WHEN** warm reefs, cold reefs, atolls, or lotus features are planned
- **THEN** each feature follows its named physical habitat rule
- **AND** reef-family planner admission does not erase those distinctions

#### Scenario: Atolls are evaluated
- **WHEN** `FEATURE_ATOLL` is considered for a water tile
- **THEN** the tile must satisfy isolated shallow-bank habitat rather than
  generic reef or near-coast water habitat
- **AND** atoll density is bounded by the same sparse-intent proof as other
  reef-family features
