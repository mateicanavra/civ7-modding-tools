## ADDED Requirements

### Requirement: Live Runtime Snapshots Are Freshness-Keyed

Mapgen Studio SHALL key live runtime snapshots by turn or equivalent runtime
marker plus request shape and stable snapshot hash.

#### Scenario: Newer snapshot supersedes older snapshot
- **WHEN** two live snapshot requests target the same runtime surface
- **AND** the later request completes before the earlier request
- **THEN** Studio commits the later snapshot as current
- **AND** the older snapshot cannot overwrite current runtime state

#### Scenario: Snapshot is stale or partial
- **WHEN** a live snapshot is stale, partial, or failed
- **THEN** Studio displays that evidence state explicitly
- **AND** it does not present the stale snapshot as current product proof

### Requirement: Runtime Observations Do Not Mutate Authored Config

Mapgen Studio SHALL keep live runtime observations outside authored
`pipelineConfig` state unless a developer applies an explicit suggestion through
the normal visible config edit path.

#### Scenario: Runtime observation implies a config change
- **WHEN** a runtime observation is translated into a possible config action
- **THEN** Studio records a suggestion with source snapshot identity
- **AND** applying the suggestion uses normal config edit and dirty-state
  behavior
