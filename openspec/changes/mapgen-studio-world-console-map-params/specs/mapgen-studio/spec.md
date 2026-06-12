## ADDED Requirements

### Requirement: World Console Controls Are Pipeline Inputs Only

The footer's World console SHALL author exactly the settings the map
pipeline reads to generate the map — Size, Players, and Seed — and SHALL
render no authoring control for a setting the pipeline does not consume.
Resources is removed from the console UI under this rule while its
underlying state, persistence, and run plumbing remain unchanged (runs keep
carrying the recorded resources value). This supersedes the
Resources-select scenarios of `mapgen-studio-toolbar-architecture-v2`; the
shared operation gating and `WorldSettings` flow of that change carry
forward unchanged.

#### Scenario: Footer authors map parameters only

- **WHEN** the footer renders
- **THEN** it contains Size, Players, and Seed authoring controls and no
  Resources control
- **AND** changing Size or Players updates the same `WorldSettings` state
  as before

#### Scenario: Resources state survives the UI removal

- **WHEN** a browser run or Run in Game starts after this change
- **THEN** the run request carries the same resources value it would have
  carried before (the persisted/default `WorldSettings.resources`),
  byte-identical plumbing

#### Scenario: History describes the last run without resources

- **WHEN** the History control renders its tooltip and accessible name
- **THEN** they present the last run's seed, size, and players, with no
  resources line
