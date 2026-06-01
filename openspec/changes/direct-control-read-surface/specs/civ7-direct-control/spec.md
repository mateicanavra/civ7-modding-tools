## ADDED Requirements

### Requirement: Direct Control Provides Bounded Read Wrappers

The direct-control package SHALL expose structured, bounded read wrappers for
developer, Studio, mapgen, player, and LLM-agent consumers.

#### Scenario: Caller requests playable status
- **WHEN** a caller requests playable status
- **THEN** the package reports listener readiness, available states, selected
  role health, App UI loading/session facts, game turn/date, map dimensions,
  local player facts, and Tuner readiness when available

#### Scenario: Caller requests map facts
- **WHEN** a caller requests a map summary, plot snapshot, or map grid
- **THEN** the package targets the Tuner state role after gameplay readiness
- **AND** it returns bounded structured map facts such as dimensions, seed,
  terrain, biome, feature, resource, elevation, rainfall, owner, revealed state,
  area, region, and water/river/coast flags where available

#### Scenario: Caller requests actor summaries
- **WHEN** a caller requests player, unit, or city summaries
- **THEN** the package returns bounded structured records for the selected
  player or live players
- **AND** it includes identifiers, ownership, location, turn-state, count, and
  type facts that are available from the current scripting state

#### Scenario: Caller requests visibility facts
- **WHEN** a caller requests visibility summary for a player
- **THEN** the package returns visibility and revealed counts and bounded
  revealed-state facts
- **AND** it labels whether the view is full developer state or player-filtered

#### Scenario: Caller requests catalog table rows
- **WHEN** a caller requests GameInfo/Database rows
- **THEN** the package accepts a bounded table and row range
- **AND** it returns parsed JSON rows or a classified direct-control error

#### Scenario: Caller requests root inspection
- **WHEN** a caller requests a root inspection
- **THEN** the package limits returned keys and method metadata
- **AND** it does not perform unbounded global dumps
