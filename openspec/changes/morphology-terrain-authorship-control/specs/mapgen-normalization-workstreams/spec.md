## ADDED Requirements

### Requirement: Terrain Morphology Authorship Predeclares Ranges

Terrain morphology workstreams SHALL predeclare expected terrain bands before
changing shipped map config, morphology thresholds, or projection behavior.

#### Scenario: Earthlike terrain relief work starts
- **WHEN** a change claims Earthlike terrain relief, flatness, rough land,
  hills, mountain belts, volcanoes, cliffs, or engine elevation behavior
- **THEN** it records the terrain corpus and expected Earthlike bands before
  implementation or tuning
- **AND** it distinguishes Civ7 impassable ridge mountains from the broader
  hills/rough-land footprint
- **AND** it does not derive success ranges from current output alone

### Requirement: Terrain Relief Proof Separates Truth Projection And Readback

Terrain morphology workstreams SHALL keep Morphology truth, map projection,
Hydrology terrain mutation, and engine readback as separate proof surfaces.

#### Scenario: Terrain proof is recorded
- **WHEN** a change reports planned or final terrain shares
- **THEN** it compares planned Morphology masks with final terrain readback
- **AND** it separates volcano-stamped mountains from ridge/belt mountains
- **AND** it reports lake and navigable-river terrain mutation as Hydrology or
  engine projection evidence rather than Morphology truth

#### Scenario: Cliff or elevation success is claimed
- **WHEN** a change claims Civ7 elevation or cliff behavior
- **THEN** it includes readback after `TerrainBuilder.buildElevation()`
- **AND** it does not treat Morphology heightfields or local projection plans
  as proof of engine cliffs

### Requirement: Rough Land Needs A Dedicated Morphology Owner

Earthlike rough-land work SHALL NOT rely only on ridge foothill skirts,
volcanoes, projection fallback, or noise-only fill.

#### Scenario: Hill coverage remains below the predeclared band
- **WHEN** diagnostics show planned or final hills below the Earthlike
  rough-land band
- **THEN** the next implementation slice adds or reshapes a Morphology-owned
  operation for non-foothill hills, rolling uplands, old highlands, plateaus,
  escarpments, basin margins, or craton relief
- **AND** shipped map config changes wait until that causal surface exists or
  the change records source evidence that config is the real bottleneck
