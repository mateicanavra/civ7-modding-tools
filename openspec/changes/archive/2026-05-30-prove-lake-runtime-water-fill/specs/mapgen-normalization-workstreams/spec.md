## ADDED Requirements

### Requirement: Lake Projection Is Proven At Runtime Lifecycle Boundaries

MapGen lake projection SHALL prove that Hydrology lake intent remains visible
as Civ7 water/lake runtime state after the engine terrain lifecycle, not only
immediately after adapter terrain writes in tests.

#### Scenario: A planned lake tile is projected
- **WHEN** `map-hydrology/lakes` asks the Civ7 adapter to stamp a planned lake
  tile
- **THEN** projection diagnostics record terrain type, water state, lake state,
  area evidence, and elevation evidence where the runtime exposes them
- **AND** the diagnostic distinguishes terrain-write failure, water
  classification failure, lake classification failure, and later drying

#### Scenario: Later engine calls can rewrite terrain or water caches
- **WHEN** elevation, river modeling, validation, placement preparation, or
  cache refresh runs after lake projection
- **THEN** a final lifecycle check compares accepted lake projection against
  final runtime state
- **AND** unexpected lake drying is reported as a bounded projection failure
  rather than silently accepted

#### Scenario: Sea-level behavior is suspected
- **WHEN** official resources or runtime DB state show an active Civ7 sea-level
  setup control
- **THEN** a dedicated OpenSpec change defines how that control affects MapGen
  water projection
- **AND** this lake proof change does not bake in speculative sea-level logic
