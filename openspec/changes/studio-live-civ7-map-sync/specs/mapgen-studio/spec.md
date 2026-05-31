## ADDED Requirements

### Requirement: Studio Exposes Read-Only Live Civ7 Runtime Status

Mapgen Studio SHALL expose a read-only live runtime surface backed by
`@civ7/direct-control`.

#### Scenario: Live status polls direct-control reads
- **WHEN** Studio live status is enabled
- **THEN** Studio reads playable status, App UI state, map summary, and autoplay
  status through `@civ7/direct-control`
- **AND** repeated failures are reported as live runtime errors rather than
  raw command prompts

#### Scenario: Runtime state is stored outside authored config
- **WHEN** Studio receives live Civ7 observations
- **THEN** it stores them in a separate runtime model
- **AND** it never writes them into `pipelineConfig` automatically

### Requirement: Studio Provides Bounded Runtime Snapshots

Mapgen Studio SHALL expose bounded map/entity/GameInfo reads for developer
overlays and summaries.

#### Scenario: Bounded map snapshot is requested
- **WHEN** Studio requests live plot facts
- **THEN** it supplies explicit bounds, fields, and max plot caps
- **AND** the server rejects or caps unbounded requests

#### Scenario: Entity and dictionary reads are bounded
- **WHEN** Studio requests live players, units, cities, or label dictionaries
- **THEN** the server uses package read wrappers with item/table limits
- **AND** the request remains read-only

### Requirement: Runtime-To-Config Translation Is Explicit

Mapgen Studio SHALL keep live runtime observations observational unless a
developer explicitly accepts a suggestion through the normal config editing
path.

#### Scenario: Suggestion is not an automatic patch
- **WHEN** live observations imply a possible config change
- **THEN** Studio may surface a suggestion record
- **AND** applying it requires an explicit user action that uses normal config
  edit/dirty-state behavior
