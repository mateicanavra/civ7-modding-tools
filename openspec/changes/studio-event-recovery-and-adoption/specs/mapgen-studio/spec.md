## ADDED Requirements

### Requirement: Studio Event Recovery Clears Stale Error State

MapGen Studio SHALL clear event-stream local errors only after a proven recovery event and SHALL preserve operation truth across reconnect and daemon identity changes.

#### Scenario: Reconnect proves recovery

- **WHEN** the browser records an event-stream error and later receives a valid hello, current operation, or live event for the active daemon identity
- **THEN** stale local event error state is cleared
- **AND** operation adoption does not overwrite newer local terminal state incorrectly

#### Scenario: Busy gate is user-visible

- **WHEN** a user invokes Run, Save/Deploy, Autoplay, or Explore while a competing operation blocks it
- **THEN** Studio shows visible feedback instead of silently ignoring the action
