## ADDED Requirements

### Requirement: Earthlike Pedology And Climate Support Biome Diversity

Earthlike pedology and climate proof SHALL show that hydrology-derived moisture,
temperature, aridity, soil, fertility, and biome bindings support visible
temperate, plains, boreal, tropical, and dryland outcomes.

#### Scenario: Pedology is computed after hydrology
- **WHEN** `ecology-pedology` consumes hydrology and morphology products
- **THEN** the proof records soil bucket distribution, fertility distribution,
  and whether declared slope/sediment/bedrock semantics are actually supplied
- **AND** a strategy cannot claim sediment or relief behavior from missing input
  signals

#### Scenario: Plains are missing
- **WHEN** Earthlike biome projection produces few or no `BIOME_PLAINS` tiles
- **THEN** the change investigates internal biome classification and engine
  binding separately
- **AND** feature tuning cannot close the issue until the plains/biome cause is
  dispositioned

#### Scenario: Dry flat land dominates visually
- **WHEN** visible land reads as dry and unvegetated
- **THEN** balance proof compares aridity, humidity, effective moisture,
  vegetation density, soil fertility, and feature rejection diagnostics
- **AND** the root cause is assigned to the owning hydrology, pedology, biome,
  feature, or projection change
