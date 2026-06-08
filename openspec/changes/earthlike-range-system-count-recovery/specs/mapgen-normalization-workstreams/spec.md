## ADDED Requirements

### Requirement: Swooper Earthlike range systems scale from map area

Swooper Earthlike SHALL express desired major mountain range count through the
map-area-scaled spacing input, not through direct output counts or denser
mountain tiles.

#### Scenario: Huge Earthlike map target

- **GIVEN** a Huge `106x66` Swooper Earthlike map
- **WHEN** major mountain range systems are planned
- **THEN** the shipped preset SHOULD target approximately 18 range systems
  through `rangeSystemSpacingTiles`
- **AND** individual regions MUST remain physically gated by tectonic drivers,
  uplift, relief, and the region-first morphology planner.
