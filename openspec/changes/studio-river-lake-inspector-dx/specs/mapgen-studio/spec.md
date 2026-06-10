## ADDED Requirements

### Requirement: Studio Exposes River Lake Diagnostic Inspector

MapGen Studio SHALL provide a River/Lake Inspector that separates physical
hydrology, navigable projection, engine terrain readback, Civ metadata readback,
lakes, floodplains, and mismatches.

#### Scenario: User inspects a normal run
- **WHEN** a run emits river/lake artifacts
- **THEN** Studio shows planned minor, planned major, projected navigable, and
  engine terrain river counts without requiring debug mode
- **AND** metadata and mismatch layers are available behind an explicit debug
  control
- **AND** lakes are separated into plan/readback and exact-counter rows
- **AND** floodplains are separated into intent, application, and live-readback
  rows
- **AND** zero visible rivers yields a specific status and tuning target
- **AND** layer-backed rows are labeled as inspectable/available rather than
  passed until same-run proof counters or rendered proof packets satisfy the
  row's proof class

#### Scenario: Legacy river-density config is imported
- **WHEN** Studio imports a config with `map-rivers.knobs.riverDensity`
- **THEN** it migrates to `navigableRiverDensity` when no conflicting value is
  present
- **AND** it reports a precise conflict when both keys differ
