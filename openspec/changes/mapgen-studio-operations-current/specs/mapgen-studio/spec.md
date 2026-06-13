## ADDED Requirements

### Requirement: Studio Exposes Daemon-Owned Current Operations

MapGen Studio SHALL expose a `studio.operations.current` oRPC procedure that
reports the daemon's retained operation truth for Run in Game and Save&Deploy.

#### Scenario: Fresh daemon reports no current operations

- **WHEN** a newly started daemon has not accepted any Run in Game or
  Save&Deploy operation
- **THEN** `studio.operations.current` returns the daemon `serverInstanceId`
  and `serverStartedAt`
- **AND** Run in Game reports `active: null` and `recent: []`
- **AND** Save&Deploy reports `active: null` and `recent: []`

#### Scenario: Active operations are visible through current

- **WHEN** a Run in Game or Save&Deploy operation is active in the daemon
  registry
- **THEN** `studio.operations.current` returns that operation in the matching
  registry's `active` field
- **AND** the same operation appears in that registry's `recent` list

#### Scenario: Recent terminal operations remain visible until TTL pruning

- **WHEN** an operation reaches a terminal state and remains inside the
  registry TTL window
- **THEN** `studio.operations.current` includes it in the matching `recent`
  list
- **AND** it is not reported as `active`

#### Scenario: TTL pruning makes current and status agree

- **WHEN** an operation has expired from the daemon registry TTL window
- **THEN** `studio.operations.current` no longer reports that operation
- **AND** a status lookup by the old request id returns the typed
  `*_STATUS_NOT_FOUND` error with the current daemon identity echo

### Requirement: Client Boot Adoption Reads Daemon Truth

MapGen Studio SHALL adopt retained operation state on boot from
`studio.operations.current` instead of replaying browser-persisted operation
request ids.

#### Scenario: Boot adopts daemon-retained operations

- **GIVEN** the daemon reports a retained Run in Game or Save&Deploy operation
- **WHEN** the Studio shell mounts
- **THEN** the client seeds its displayed operation state from
  `studio.operations.current`
- **AND** existing status polling continues only for active operations until
  the S3.2 event-push slice deletes polling

#### Scenario: Browser operation recovery bridge is deleted

- **WHEN** the Studio shell mounts
- **THEN** it does not read Run in Game or Save&Deploy request ids from
  localStorage
- **AND** it does not persist operation request ids or source snapshots to
  localStorage for recovery
- **AND** unrelated localStorage owners such as authoring, view, theme, and
  presets are unchanged
