## ADDED Requirements

### Requirement: Engine Terrain Materialization Order Is Explicit

The MapGen normalization workstream SHALL encode Civ7 engine terrain materialization order in the standard recipe rather than hiding it in repair helpers or local compensation paths.

#### Scenario: Static water exists before elevation shaping

- **WHEN** the standard recipe projects gameplay terrain into the Civ7 engine
- **THEN** static morphology terrain projection runs before lake projection
- **AND** Hydrology lake projection runs before `TerrainBuilder.buildElevation()`
- **AND** engine river modeling runs after `TerrainBuilder.buildElevation()`

#### Scenario: Materialization order is guarded categorically

- **WHEN** map projection tests inspect the standard recipe
- **THEN** they assert the relative order of lake projection, elevation building, and river modeling
- **AND** the guard is not tailored to one map config or one seed
