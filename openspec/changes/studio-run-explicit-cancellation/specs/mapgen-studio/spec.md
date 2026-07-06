## ADDED Requirements

### Requirement: Run In Game Cancellation Is Explicit

MapGen Studio SHALL cancel Run in Game only through an explicit cancellation
operation.

#### Scenario: Active operation is cancelled

- **WHEN** `runInGame.cancel` is called with an active request id
- **THEN** Studio interrupts that operation
- **AND** records diagnostics
- **AND** releases the runtime ownership lease after cleanup and diagnostics
  finalization
- **AND** emits exactly one terminal event
- **AND** projects public status `cancelled` with category
  `operation-cancelled`

#### Scenario: Cancellation is repeated

- **WHEN** `runInGame.cancel` is called again for the same cancelled request id
- **THEN** Studio returns the existing cancelled status
- **AND** does not emit another terminal event

#### Scenario: Browser request is aborted

- **WHEN** the browser aborts or disconnects after a Run in Game operation is
  admitted
- **THEN** Studio keeps the operation running
- **AND** the browser can resume by querying status with the request id
