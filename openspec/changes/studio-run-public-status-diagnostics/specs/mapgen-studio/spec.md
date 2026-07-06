## ADDED Requirements

### Requirement: Run In Game Public Status Is Closed And Safe

MapGen Studio SHALL expose Run in Game status, current-operation projection,
events, and declared public errors through a closed public operation contract.

#### Scenario: Operation failure is projected publicly

- **WHEN** a Run in Game operation fails
- **THEN** public status includes request id, public phase, terminal status,
  safe failure category, diagnostics id, timestamps, and typed recovery actions
- **AND** public status does not embed private diagnostics or attribution
  records

#### Scenario: Pre-admission request fails

- **WHEN** a Run in Game start request fails validation before operation
  admission
- **THEN** the declared public error payload uses the same safe failure
  vocabulary as operation status
- **AND** developer diagnostics are available only through explicit diagnostics
  lookup when a diagnostics id is present

### Requirement: Diagnostics Are Private Lookup Records

MapGen Studio SHALL allocate a durable private diagnostics record for every
public diagnostics id.

#### Scenario: Diagnostics id is emitted

- **WHEN** public Run in Game status or error data includes `diagnosticsId`
- **THEN** the diagnostics lookup endpoint resolves that id to a private
  diagnostics record or a safe not-found result
- **AND** copy-diagnostics reads from diagnostics lookup rather than serializing
  public operation status

#### Scenario: Daemon restarts

- **WHEN** the Studio daemon restarts before retention deletes a diagnostics
  record
- **THEN** diagnostics lookup still resolves the diagnostics id from the request
  diagnostics workspace
