## ADDED Requirements

### Requirement: Studio Save/Deploy Does Not Launch Civ By Default

Mapgen Studio SHALL keep repo-backed config Save/Deploy separate from Civ
setup/start mutation.

#### Scenario: User saves a config
- **WHEN** Studio saves a repo-backed map config
- **THEN** Studio writes and deploys the config
- **AND** it does not restart or start Civ unless an explicit launch action
  requested that mutation

### Requirement: Studio Distinguishes Current And Previous Run In Game State

Mapgen Studio SHALL show whether the visible Run in Game operation was requested
from the current authored Studio state.

#### Scenario: User edits config after a completed launch
- **WHEN** Run in Game has a completed operation
- **AND** the user changes the current config, seed, map size, player count,
  resources, preset, or materialization mode
- **THEN** Studio marks the operation as previous or stale
- **AND** it does not present that operation as proof for the current authored
  state

### Requirement: Studio Does Not Queue Duplicate Active Launch Mutations

Mapgen Studio SHALL avoid queueing a second setup/start mutation while a Run in
Game operation is already running.

#### Scenario: User clicks Run in Game while launch is running
- **WHEN** a Run in Game operation is already active
- **THEN** the server returns the active operation status
- **AND** no second mutating setup/start command is queued

### Requirement: Run In Game Server State Is Testable

Run in Game operation-state and request-validation behavior SHALL be available
as focused server helpers, separate from Vite middleware wiring.

#### Scenario: Malformed request reaches middleware
- **WHEN** a Run in Game payload includes malformed setup fields or raw control
  command fields
- **THEN** validation rejects the request before any file write, deploy, or Civ
  mutation is queued
