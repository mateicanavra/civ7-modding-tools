## ADDED Requirements

### Requirement: Operation Registries Publish Transition Events

MapGen Studio SHALL publish daemon operation transitions to
`studio.events.watch` as `operation` events through the D8 `StudioEventHub`.

#### Scenario: Run in Game transition publishes an operation event

- **WHEN** a Run in Game operation is created, updated, completed, or failed in
  the daemon registry
- **THEN** the daemon publishes a `studio.events.watch` event with
  `type: "operation"`
- **AND** `kind` is `run-in-game`
- **AND** the event status matches the daemon-owned Run in Game operation
  status snapshot

#### Scenario: Save&Deploy transition publishes an operation event

- **WHEN** a Save&Deploy operation is created, updated, completed, or failed in
  the daemon registry
- **THEN** the daemon publishes a `studio.events.watch` event with
  `type: "operation"`
- **AND** `kind` is `save-deploy`
- **AND** the event status matches the daemon-owned Save&Deploy operation
  status snapshot

#### Scenario: Publication uses the D8 EventHub

- **WHEN** the daemon constructs Studio engines
- **THEN** operation publishers use the D8 daemon-owned `StudioEventHub`
- **AND** no alternate event transport, operation-specific stream, or
  operation-only bus is added

#### Scenario: Production daemon composition supplies EventHub

- **WHEN** the production Studio daemon creates Studio engines
- **THEN** it supplies the D8 `StudioEventHub`
- **AND** any no-publisher construction path is limited to tests or explicitly
  non-daemon composition

#### Scenario: Publish failure does not reopen polling

- **WHEN** EventHub publication rejects unexpectedly after a daemon operation
  transition is recorded
- **THEN** the operation transition remains recorded in the daemon registry
- **AND** the failure is surfaced as diagnostics
- **AND** no background status polling path is started as compensation

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
- **AND** this adoption is not replaced by browser request-id recovery

### Requirement: Operation Polling And ServerInfo Watchdog Are Deleted

MapGen Studio SHALL remove operation status polling and the client daemon
identity watchdog after operation events own operation freshness.

#### Scenario: Operation status polling hook is gone

- **WHEN** D9 is implemented
- **THEN** no `useOperationStatusPolls` hook, import, or call remains
- **AND** no background Run in Game or Save&Deploy status polling loop remains

#### Scenario: Hidden Save&Deploy completion polling is gone

- **WHEN** a Save&Deploy operation starts
- **THEN** the client does not run a private loop that sleeps and calls
  Save&Deploy status until terminal
- **AND** terminal completion reaches the client through pushed operation
  events or reconnect adoption

#### Scenario: Polling-only status-miss handling is gone

- **WHEN** D9 is implemented
- **THEN** `StudioShell` no longer synthesizes operation terminal state from
  polling-only 404/status-miss callbacks
- **AND** operation errors are surfaced through the operation event/adoption
  paths that own current UI state

#### Scenario: ServerInfo watchdog no longer owns identity

- **WHEN** D9 is implemented
- **THEN** no `useDaemonInstanceWatchdog` hook, import, or call remains
- **AND** the event stream `hello` is the client identity/reconnect authority

#### Scenario: Live-game polling remains D10-owned

- **WHEN** D9 is implemented
- **THEN** live-game polling behavior remains unchanged
- **AND** D10 remains the owner for live-game event publication and browser
  live-game polling/timer deletion
