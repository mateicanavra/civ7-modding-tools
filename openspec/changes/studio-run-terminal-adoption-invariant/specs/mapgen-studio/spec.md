## ADDED Requirements

### Requirement: Browser Adopts Daemon Terminal State

MapGen Studio SHALL reconcile browser-visible operation state from daemon
current/status records when event delivery is missed or interrupted.

#### Scenario: Terminal event is missed

- **WHEN** the daemon terminalizes a Run in Game operation
- **AND** the browser misses the terminal event
- **THEN** the next current-operation reconciliation adopts the terminal state
- **AND** the UI no longer shows the operation as running

#### Scenario: Browser reloads during operation

- **WHEN** the browser reloads while a Run in Game operation is active or
  terminal
- **THEN** Studio reads `studio.operations.current`
- **AND** displays the daemon-owned active or terminal state for that request
- **AND** does not replay `runInGame.start`

#### Scenario: Event stream reconnects

- **WHEN** the event stream disconnects and reconnects
- **THEN** the browser reconciles with `studio.operations.current`
- **AND** handles a terminal state exactly once
- **AND** public UI copy remains safe

#### Scenario: Private diagnostics are requested

- **WHEN** the user or operator needs private failure detail
- **THEN** the UI uses the explicit diagnostics lookup path
- **AND** does not embed private diagnostics in public operation state
