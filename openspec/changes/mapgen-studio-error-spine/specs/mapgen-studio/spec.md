## ADDED Requirements

### Requirement: Studio Expected Failures Are Typed Runtime Values

D3 SHALL replace status-code-shaped Studio engine error truth with a typed expected-failure model suitable for Effect failures and exhaustive oRPC mapping.

#### Scenario: Expected workflow failures have domain tags

- **WHEN** Run in Game, Save/Deploy, or Autoplay emits a known failure
- **THEN** the failure carries a domain tag such as `OperationBlocked`, `InvalidRequest`, `OperationNotFound`, `OperationExpired`, `DaemonIdentityMismatch`, `RuntimeDisposed`, `UnsupportedOperationType`, `DependencyUnavailable`, `MaterializationFailed`, `DeployFailed`, `ProofFailed`, `AutoplayStartStopFailed`, or `AutoplayVerificationFailed`
- **AND** the failure is not classified by HTTP status as the source of truth
- **AND** the failure is suitable for `Effect.fail` in D4 runtime services
- **AND** unknown defects are excluded from workflow `Effect.fail` unions

#### Scenario: Status-code bridge errors are deleted at D3 closure

- **WHEN** D3 implementation closes
- **THEN** production app/package code contains no `StudioEngineError` or `RunInGameHttpError` construction, catch, import, or bridge mapping
- **AND** app-hosted engines emit package-owned typed failure values until D4 moves them into services

#### Scenario: Known failures map exhaustively

- **GIVEN** the Studio expected-failure ADT
- **WHEN** each namespace maps every allowed failure tag to oRPC
- **THEN** the result uses a declared Studio server error code/status/data schema
- **AND** no known expected failure falls through to an anonymous or generic 500

#### Scenario: Lifecycle variants have deterministic mappings

- **GIVEN** an operation lifecycle failure such as expired operation, daemon identity mismatch, runtime disposed, or unsupported operation type
- **WHEN** the failure is raised by Run in Game start/status, Save/Deploy start/status, or Autoplay
- **THEN** the mapper uses the exact code, status, and data family declared in the D3 lifecycle mapping matrix
- **AND** implementation cannot choose a new lifecycle mapping during code edits

#### Scenario: Autoplay failed outcomes are specified

- **WHEN** Autoplay start/stop or verification fails
- **THEN** the failure maps to `AUTOPLAY_FAILED`
- **AND** the failure data carries a declared reason code, bounded diagnostics, and typed recovery actions

#### Scenario: Reason codes are sealed

- **GIVEN** the D3 reason-code matrix
- **WHEN** an engine, runtime service, operation-state projection, mapper, or client-facing error data emits a reason code
- **THEN** the reason code is one of the declared TypeBox literal values for that failure family
- **AND** implementation cannot invent unledgered reason strings

### Requirement: Declared Error Data Is TypeBox-Owned And Sanitized

D3 SHALL make Studio expected-error data a TypeBox-owned public contract and delete or narrow the D2.5 permissive `details?: unknown` bridge.

#### Scenario: Expected error data has no unknown-details bridge

- **WHEN** D3 validates `packages/studio-server/src/contract/errors.ts` and related error-data modules
- **THEN** expected failure data schemas are TypeBox-owned
- **AND** expected failure payloads do not expose `details?: Type.Unknown()`
- **AND** public cause/diagnostic fields are sanitized into declared TypeBox shapes

#### Scenario: Unknown exceptions are defect containment

- **WHEN** an unexpected non-domain exception reaches the router/runtime edge
- **THEN** it maps to the namespace `*_FAILED` declared error
- **AND** the data is `UnexpectedDefectData` with a sanitized cause summary
- **AND** this path is not treated as an expected runtime outcome
- **AND** this path is not part of the expected-failure ADT mapper totality

### Requirement: Status Misses Echo Daemon Identity

D3 SHALL preserve restart-aware status-miss parity for Run in Game and Save/Deploy.

#### Scenario: Run in Game status miss echoes identity

- **WHEN** `runInGame.status` receives an unknown request id
- **THEN** the error is `RUN_IN_GAME_STATUS_NOT_FOUND`
- **AND** the error data includes `serverInstanceId` and `serverStartedAt`
- **AND** the missing request id is represented in typed failure data

#### Scenario: Save and Deploy status miss echoes identity

- **WHEN** `mapConfigs.status` receives an unknown request id
- **THEN** the error is `SAVE_DEPLOY_STATUS_NOT_FOUND`
- **AND** the error data includes `serverInstanceId` and `serverStartedAt`
- **AND** the missing request id is represented in typed failure data

### Requirement: Recovery Actions Are Typed

D3 SHALL expose recovery guidance through a TypeBox-backed recovery-action vocabulary.

#### Scenario: Recovery vocabulary is sealed

- **GIVEN** the D3 failure vocabulary ledger
- **WHEN** implementation exposes recovery guidance in error data or operation-state projections
- **THEN** every action is one of the declared TypeBox recovery-action values
- **AND** operation code cannot emit arbitrary recovery-action strings as the durable public protocol

#### Scenario: Recoverable failures expose actions

- **WHEN** a known Studio operation failure has a safe next action
- **THEN** the error data includes typed recovery actions from the declared vocabulary
- **AND** arbitrary string arrays are not accepted as the durable public protocol
