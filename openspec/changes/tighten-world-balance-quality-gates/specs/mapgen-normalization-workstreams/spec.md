## ADDED Requirements

### Requirement: World Balance Proof Covers Feature Families And Map Identity

World-balance tests SHALL prove product-visible geography through standard
recipe/runtime execution across shipped map identities and representative
seeds.

#### Scenario: Vegetation exists only as an aggregate
- **WHEN** a generated map has rainforest or any vegetation but lacks required
  forest, taiga, savanna, or sagebrush outcomes for its map identity
- **THEN** world-balance tests fail with the missing family named
- **AND** aggregate vegetation presence is not sufficient proof

#### Scenario: Feature density is within broad budgets
- **WHEN** shipped configs run through the standard recipe
- **THEN** lake, wetland, reef-family, rainforest, and total vegetation metrics
  stay within broad map-identity bands
- **AND** rare required features may be asserted across N-of-M seeds instead
  of every seed

#### Scenario: Configs compile but drift from product identity
- **WHEN** shipped map configs or presets use stale strategies, invalid current
  properties, or values that contradict the map identity
- **THEN** config identity tests fail even if schema validation passes
- **AND** implementation updates configs/presets in the same workstream as
  code changes
