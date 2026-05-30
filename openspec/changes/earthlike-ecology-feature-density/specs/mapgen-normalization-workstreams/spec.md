## ADDED Requirements

### Requirement: Earthlike Ecology Feature Density Is Product-Visible

Swooper Earthlike ecology SHALL produce product-visible accepted densities for
key vegetation and reef feature families after upstream terrain, climate,
pedology, biome, and engine-validity facts are stable.

#### Scenario: Vegetation density is evaluated
- **WHEN** representative Swooper Earthlike seeds run
- **THEN** accepted forest, taiga, rainforest, and dryland vegetation families
  meet configured visible density floors without exceeding upper bounds
- **AND** planned-but-rejected features do not count toward success

#### Scenario: Reef and atoll density is evaluated
- **WHEN** representative Swooper Earthlike seeds run
- **THEN** accepted warm reefs, cold reefs, and atolls meet configured visible
  density floors on engine-valid surfaces
- **AND** per-family telemetry distinguishes planned, accepted, rejected, and
  projected counts

#### Scenario: A single lucky seed passes
- **WHEN** only one generated map satisfies a family density target
- **THEN** Earthlike ecology density proof remains open until representative
  multi-seed evidence passes
