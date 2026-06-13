## ADDED Requirements

### Requirement: Studio Engine Failures Are Exhaustively Mapped

Studio host engines SHALL expose known operation failures through a sealed
failure model and an exhaustive oRPC mapping so known categories do not surface
as anonymous fallback 500s.

#### Scenario: Every known failure category maps to a declared error

- **GIVEN** the sealed Studio engine failure union
- **WHEN** each known failure member is converted to an oRPC error
- **THEN** the result uses a declared Studio server contract error code
- **AND** the result uses the status assigned to that failure category
- **AND** the mapping has no known-category fallback to a generic 500

#### Scenario: Unexpected exceptions remain declared failures

- **WHEN** a Studio engine throws an unexpected non-domain exception
- **THEN** the host maps it to the declared `*_FAILED` error for that
  procedure namespace
- **AND** the error remains typed by the Studio server contract

### Requirement: Operation Status Misses Echo Daemon Identity

Run in Game and Save&Deploy status lookups SHALL both carry daemon identity
when an operation request id is not found.

#### Scenario: Run in Game status miss echoes identity

- **WHEN** `runInGame.status` receives an unknown request id
- **THEN** the error is `RUN_IN_GAME_STATUS_NOT_FOUND`
- **AND** the error data includes `serverInstanceId` and `serverStartedAt`

#### Scenario: Save and Deploy status miss echoes identity

- **WHEN** `mapConfigs.status` receives an unknown request id
- **THEN** the error is `SAVE_DEPLOY_STATUS_NOT_FOUND`
- **AND** the error data includes `serverInstanceId` and `serverStartedAt`
- **AND** this supersedes the older documented no-echo asymmetry

### Requirement: Engine Recovery Hints Are Structured

Studio operation failures SHALL carry recovery-action hints in a normalized
contract field when the engine knows the operator's next safe action.

#### Scenario: Run in Game and Save Deploy expose comparable recovery hints

- **WHEN** Run in Game or Save&Deploy fails with a known recoverable category
- **THEN** the typed error details include a structured recovery hint
- **AND** existing durable diagnostic fields remain available for debugging
