## ADDED Requirements

### Requirement: Run In Game Browser Click Admits One Public Operation

MapGen Studio SHALL treat the rendered Run in Game button as a first-class
request surface whose admitted operation is visible through public status.

#### Scenario: Browser click starts Run in Game

- **WHEN** the user selects a map config, saved setup config, seed, map size,
  player count, and clicks Run in Game in the rendered Studio page
- **THEN** Studio sends one `runInGame.start` request through the public `/rpc`
  oRPC mount
- **AND** the admitted public status includes the daemon `requestId`
- **AND** the browser-originated evidence row records the selected source, seed,
  map size, and player count without expanding the public operation status
  projection beyond safe public fields

#### Scenario: Event and current surfaces agree

- **WHEN** a browser-originated Run in Game request is active or terminal
- **THEN** `studio.events.watch`, `studio.operations.current`, and
  `runInGame.status` refer to the same request id
- **AND** no public payload embeds private diagnostics, attribution records, or
  local file paths

#### Scenario: Browser evidence row is recorded

- **WHEN** a browser-originated live check runs
- **THEN** the workstream evidence identifies it as browser-originated
- **AND** records the visible input values and admitted request id
- **AND** does not count endpoint-only admission as a browser-originated row
