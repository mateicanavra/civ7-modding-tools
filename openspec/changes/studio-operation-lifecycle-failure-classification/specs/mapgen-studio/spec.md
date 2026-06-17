## ADDED Requirements

### Requirement: Studio Operations Project Phase-Specific Runtime Failures

MapGen Studio SHALL report operation lifecycle failures according to the phase that failed rather than converting background exceptions into input-validation errors.

#### Scenario: Worker exception becomes phase-specific status

- **WHEN** a Run in Game, Save/Deploy, or Autoplay worker throws after request admission
- **THEN** the terminal operation DTO reports a phase-specific runtime failure
- **AND** it does not use `InvalidRequest` unless the failure was true pre-admission validation

#### Scenario: Runtime registry remains source of truth

- **WHEN** event publishing, disposal, duplicate requests, or daemon mismatch occur
- **THEN** `studio.operations.current` remains the authoritative operation-state source
