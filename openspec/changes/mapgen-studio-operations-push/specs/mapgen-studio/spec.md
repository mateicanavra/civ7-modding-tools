## ADDED Requirements

### Requirement: Operation Registries Publish Transition Events

MapGen Studio SHALL publish daemon operation transitions to
`studio.events.watch` as `operation` events.

#### Scenario: Run in Game transition publishes an operation event

- **WHEN** a Run in Game operation is created or updated in the daemon registry
- **THEN** the daemon publishes a `studio.events.watch` event with
  `type: "operation"`
- **AND** `kind` is `run-in-game`
- **AND** the event status matches the daemon-owned Run in Game operation
  status snapshot

#### Scenario: Save&Deploy transition publishes an operation event

- **WHEN** a Save&Deploy operation is created or updated in the daemon registry
- **THEN** the daemon publishes a `studio.events.watch` event with
  `type: "operation"`
- **AND** `kind` is `save-deploy`
- **AND** the event status matches the daemon-owned Save&Deploy operation
  status snapshot

#### Scenario: Publication is wired to the existing EventHub

- **WHEN** the daemon constructs Studio engines
- **THEN** operation publishers use the S3.1 daemon-owned EventHub
- **AND** no alternate event transport or operation-specific stream is added

### Requirement: Client Applies Operation Events Without Polling

MapGen Studio SHALL update displayed operation state from pushed operation
events instead of background status polling.

#### Scenario: Run in Game event updates displayed state

- **WHEN** the client receives an operation event with `kind: "run-in-game"`
- **THEN** it updates the displayed Run in Game operation state from the event
  status
- **AND** live terminal events still trigger the existing terminal toast effect

#### Scenario: Save&Deploy event updates displayed state

- **WHEN** the client receives an operation event with `kind: "save-deploy"`
- **THEN** it updates the displayed Save&Deploy operation state from the event
  status

#### Scenario: Reconnect still adopts daemon truth

- **WHEN** the client receives an event stream `hello`
- **THEN** it continues to call `studio.operations.current`
- **AND** it adopts daemon-retained operations for reconnect/boot truth

### Requirement: Operation Polling And ServerInfo Watchdog Are Deleted

MapGen Studio SHALL remove operation status polling and the client daemon
identity watchdog after operation events own operation freshness.

#### Scenario: Operation status polling hook is gone

- **WHEN** S3.2 is complete
- **THEN** no `useOperationStatusPolls` hook, import, or call remains
- **AND** no background Run in Game or Save&Deploy status polling loop remains

#### Scenario: Hidden Save&Deploy completion polling is gone

- **WHEN** a Save&Deploy operation starts
- **THEN** the client does not run a private loop that sleeps and calls
  Save&Deploy status until terminal
- **AND** terminal completion reaches the client through pushed operation
  events or reconnect adoption

#### Scenario: ServerInfo watchdog no longer owns identity

- **WHEN** S3.2 is complete
- **THEN** no `useDaemonInstanceWatchdog` hook, import, or call remains
- **AND** the event stream `hello` is the client identity/reconnect authority

#### Scenario: Live-game polling remains for S3.3

- **WHEN** S3.2 is complete
- **THEN** live-game polling behavior remains unchanged
- **AND** S3.3 remains the owner for live-game event publication and live-game
  poll deletion
