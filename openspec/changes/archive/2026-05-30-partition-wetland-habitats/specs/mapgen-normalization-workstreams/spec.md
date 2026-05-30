## ADDED Requirements

### Requirement: Wetland Intent Planning Uses Wetland-Specific Habitat Partitions

Wetland-family feature planning SHALL distinguish hydromorphic, intertidal,
cold-bog, and arid water-point habitats instead of treating broad near-river
moisture as generic wetland intent.

#### Scenario: Humid highland is near a river
- **WHEN** a land tile is moist and river-adjacent but lacks wetland habitat
  eligibility such as lowland, floodplain, waterlogged, or intertidal context
- **THEN** marsh planning does not emit a marsh intent for that tile

#### Scenario: Wetland-family features differ physically
- **WHEN** marsh, tundra bog, mangrove, oasis, or watering-hole features are
  planned
- **THEN** each feature follows its named habitat partition
- **AND** wetland-family planner admission does not erase those distinctions

#### Scenario: Wetland substrate is shared
- **WHEN** feature substrate publishes hydromorphic or well-drained eligibility
- **THEN** the field names represent physical invariants with concrete wetland
  and vegetation consumers
- **AND** feature-specific wetland rules remain in owning wet feature ops
