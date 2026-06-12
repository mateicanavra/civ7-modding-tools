## ADDED Requirements

### Requirement: River Contracts Prevent Metadata Projection Confusion

River adapter, mock, catalog, and hydrology contracts SHALL preserve the
distinction between Civ terrain rows, Civ river metadata, repo-owned constants,
and Hydrology river-class truth.

#### Scenario: Mock adapter stamps navigable terrain
- **WHEN** mock terrain is set to `TERRAIN_NAVIGABLE_RIVER`
- **THEN** tests can represent live-compatible `NO_RIVER` metadata
- **AND** consumers must not infer metadata success from terrain success

#### Scenario: Generated catalog documents river metadata
- **WHEN** generated catalogs include official resource or live probe facts
- **THEN** comments describe them as source evidence
- **AND** repo-owned constants remain owned by the map-policy source

#### Scenario: Standard MapGen stages author rivers
- **WHEN** `map-rivers` materializes Hydrology-owned river truth into Civ
  terrain/runtime state
- **THEN** it may call `adapter.modelRivers()` only as the bounded Civ-native
  materialization pass described by `@civ7/map-policy`
- **AND** `modelRivers()` must not become an upstream Hydrology generator,
  public length-selector model, or proof substitute for same-run readback
